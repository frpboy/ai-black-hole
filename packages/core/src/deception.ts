import { randomUUID } from "node:crypto";

/**
 * Controlled deception primitives (roadmap M3).
 *
 * Design concepts adapted from BLA (https://github.com/qybaihe/bla, MIT
 * License): synthetic decoys ("Poison"), honey/canary identifiers and bounded
 * per-session budgets. Deliberately NOT adapted: token or infrastructure cost
 * exhaustion, retaliation, persistence and any unbounded work, which are
 * explicit non-goals of AI Black Hole. See NOTICE and docs/BLA_ADAPTATION.md.
 */

export interface DecoyDefinition {
  /** Exact request path this decoy answers, e.g. "/api/internal/metrics". */
  path: string;
  /** HTTP method the decoy answers. Defaults to "GET". */
  method?: string;
  /** HTTP status code served with the synthetic body. Defaults to 200. */
  status?: number;
  /** Content-Type of the synthetic body. Defaults to "application/json". */
  contentType?: string;
  /** Synthetic response body. Must contain fabricated data only. */
  body: string;
  /** Maximum decoy responses served to one client before denial. Defaults to 25. */
  maxRequestsPerClient?: number;
  /** Epoch milliseconds after which the decoy stops matching. Defaults to registration time plus deception.decoyTtlMs. */
  expiresAt?: number;
}

export interface CanaryOptions {
  /** Canary lifetime in milliseconds before rotation is required. Defaults to 24 hours. */
  ttlMs?: number;
  /** Maximum simultaneously valid canary tokens. Defaults to 4, maximum 16. */
  maxActive?: number;
}

export interface DeceptionOptions {
  /** Master switch. Deception is disabled unless explicitly enabled. */
  enabled?: boolean;
  /** Synthetic decoy route definitions. */
  decoys?: DecoyDefinition[];
  /** Maximum number of registered decoys. Defaults to 25, maximum 100. */
  maxDecoys?: number;
  /** Maximum synthetic body size in bytes. Defaults to 16384, maximum 65536. */
  maxBodyBytes?: number;
  /**
   * Default decoy lifetime in milliseconds when a decoy sets no expiresAt.
   * Every decoy has a finite lifetime. Defaults to 24 hours, maximum 30 days.
   */
  decoyTtlMs?: number;
  /** Canary identifier configuration. Canaries require enabled deception. */
  canary?: CanaryOptions;
}

export interface DecoyResponse {
  status: number;
  contentType: string;
  body: string;
}

export interface CanaryHandle {
  token: string;
  /** Absolute path that carries the canary token. */
  path: string;
  expiresAt: number;
}

export interface DecoyMatch {
  response: DecoyResponse;
  maxRequestsPerClient: number;
}

export interface DecoyRegistry {
  /** Match a request against the registry without consuming response budget. */
  match(path: string, method: string, timestamp: number): DecoyMatch | undefined;
  /** Response budget left for this client. Fail-closed: an untracked client at counter capacity reads as 0. */
  remaining(path: string, method: string, clientKey: string): number;
  /** Consume one response from the client's budget. Call only when serving the synthetic response. */
  charge(path: string, method: string, clientKey: string): void;
  /** Fetch the synthetic response without recording a hit. */
  responseFor(path: string, method?: string): DecoyResponse | undefined;
  readonly size: number;
  reset(): void;
}

export interface CanaryStore {
  /** Current valid canary, creating or rotating one when expired. */
  current(timestamp: number): CanaryHandle;
  /** Rotate immediately: a new canary becomes current, older ones stay valid up to maxActive. */
  rotate(timestamp: number): CanaryHandle;
  /** True when the request path contains any currently valid canary token. */
  matches(path: string, timestamp: number): boolean;
  reset(): void;
}

const DEFAULT_MAX_DECOYS = 25;
const HARD_MAX_DECOYS = 100;
const DEFAULT_MAX_BODY_BYTES = 16_384;
const HARD_MAX_BODY_BYTES = 65_536;
const DEFAULT_MAX_REQUESTS_PER_CLIENT = 25;
const HARD_MAX_REQUESTS_PER_CLIENT = 1_000;
const DEFAULT_DECOY_TTL_MS = 86_400_000;
const HARD_MAX_DECOY_TTL_MS = 2_592_000_000; // 30 days
const DEFAULT_CANARY_TTL_MS = 86_400_000;
const DEFAULT_CANARY_MAX_ACTIVE = 4;
const HARD_CANARY_MAX_ACTIVE = 16;
const MAX_COUNTER_ENTRIES = 10_000;
const CANARY_PATH_PREFIX = "/__ai-black-hole-canary/";

interface NormalizedDecoy {
  method: string;
  path: string;
  response: DecoyResponse;
  maxRequestsPerClient: number;
  expiresAt: number;
}

export function createDecoyRegistry(options: DeceptionOptions = {}, registeredAt = Date.now()): DecoyRegistry {
  const maxDecoys = options.maxDecoys ?? DEFAULT_MAX_DECOYS;
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  const decoyTtlMs = options.decoyTtlMs ?? DEFAULT_DECOY_TTL_MS;
  if (!Number.isInteger(maxDecoys) || maxDecoys < 1 || maxDecoys > HARD_MAX_DECOYS) {
    throw new Error(`deception.maxDecoys must be an integer between 1 and ${HARD_MAX_DECOYS}`);
  }
  if (!Number.isInteger(maxBodyBytes) || maxBodyBytes < 1 || maxBodyBytes > HARD_MAX_BODY_BYTES) {
    throw new Error(`deception.maxBodyBytes must be an integer between 1 and ${HARD_MAX_BODY_BYTES}`);
  }
  if (!Number.isFinite(decoyTtlMs) || decoyTtlMs <= 0 || decoyTtlMs > HARD_MAX_DECOY_TTL_MS) {
    throw new Error(`deception.decoyTtlMs must be finite, positive and at most ${HARD_MAX_DECOY_TTL_MS}`);
  }
  const definitions = options.decoys ?? [];
  if (definitions.length > maxDecoys) {
    throw new Error(`deception.decoys exceeds deception.maxDecoys (${maxDecoys})`);
  }
  const decoys = new Map<string, NormalizedDecoy>();
  for (const definition of definitions) {
    const decoy = normalizeDecoy(definition, maxBodyBytes, registeredAt + decoyTtlMs);
    const key = `${decoy.method} ${decoy.path}`;
    if (decoys.has(key)) {
      throw new Error(`duplicate decoy definition for ${key}`);
    }
    decoys.set(key, decoy);
  }
  // Per-client response budgets. Bounded at MAX_COUNTER_ENTRIES and
  // fail-closed: at capacity an untracked client reads as exhausted rather
  // than evicting another client's live budget record.
  const counters = new Map<string, number>();

  function counterKey(path: string, method: string, clientKey: string): string {
    return `${method.toUpperCase()} ${path} ${clientKey}`;
  }

  function served(key: string, limit: number): number {
    const count = counters.get(key);
    if (count === undefined) return counters.size >= MAX_COUNTER_ENTRIES ? limit : 0;
    return count;
  }

  return {
    get size() {
      return decoys.size;
    },
    match(path: string, method: string, timestamp: number): DecoyMatch | undefined {
      const decoy = decoys.get(`${method.toUpperCase()} ${path}`);
      if (!decoy || timestamp >= decoy.expiresAt) return undefined;
      return { response: decoy.response, maxRequestsPerClient: decoy.maxRequestsPerClient };
    },
    remaining(path: string, method: string, clientKey: string): number {
      const decoy = decoys.get(`${method.toUpperCase()} ${path}`);
      if (!decoy) return 0;
      return decoy.maxRequestsPerClient - served(counterKey(path, method, clientKey), decoy.maxRequestsPerClient);
    },
    charge(path: string, method: string, clientKey: string): void {
      const key = counterKey(path, method, clientKey);
      const count = counters.get(key);
      if (count === undefined && counters.size >= MAX_COUNTER_ENTRIES) return;
      counters.delete(key);
      counters.set(key, (count ?? 0) + 1);
    },
    responseFor(path: string, method = "GET"): DecoyResponse | undefined {
      return decoys.get(`${method.toUpperCase()} ${path}`)?.response;
    },
    reset() {
      counters.clear();
    },
  };
}

function normalizeDecoy(definition: DecoyDefinition, maxBodyBytes: number, defaultExpiresAt: number): NormalizedDecoy {
  if (typeof definition.path !== "string" || !definition.path.startsWith("/")) {
    throw new Error("decoy.path must be a string starting with /");
  }
  if (definition.path.length > 2048) throw new Error("decoy.path must not exceed 2048 characters");
  const method = (definition.method ?? "GET").toUpperCase();
  if (!/^[A-Z]{1,16}$/.test(method)) throw new Error("decoy.method must be 1-16 uppercase letters");
  const status = definition.status ?? 200;
  if (!Number.isInteger(status) || status < 200 || status > 599) {
    throw new Error("decoy.status must be an integer between 200 and 599");
  }
  const contentType = definition.contentType ?? "application/json";
  if (typeof contentType !== "string" || contentType.length === 0 || contentType.length > 128) {
    throw new Error("decoy.contentType must be a non-empty string of at most 128 characters");
  }
  if (typeof definition.body !== "string") throw new Error("decoy.body must be a string");
  const bodyBytes = Buffer.byteLength(definition.body, "utf8");
  if (bodyBytes > maxBodyBytes) {
    throw new Error(`decoy.body of ${bodyBytes} bytes exceeds deception.maxBodyBytes (${maxBodyBytes})`);
  }
  const maxRequestsPerClient = definition.maxRequestsPerClient ?? DEFAULT_MAX_REQUESTS_PER_CLIENT;
  if (
    !Number.isInteger(maxRequestsPerClient) ||
    maxRequestsPerClient < 1 ||
    maxRequestsPerClient > HARD_MAX_REQUESTS_PER_CLIENT
  ) {
    throw new Error(
      `decoy.maxRequestsPerClient must be an integer between 1 and ${HARD_MAX_REQUESTS_PER_CLIENT}`,
    );
  }
  if (definition.expiresAt !== undefined && !Number.isFinite(definition.expiresAt)) {
    throw new Error("decoy.expiresAt must be a finite epoch-milliseconds number");
  }
  return {
    method,
    path: definition.path,
    response: { status, contentType, body: definition.body },
    maxRequestsPerClient,
    expiresAt: definition.expiresAt ?? defaultExpiresAt,
  };
}

export function createCanaryStore(
  options: CanaryOptions = {},
  now: () => number = Date.now,
  generateToken: () => string = () => `bh-cnr-${randomUUID()}`,
): CanaryStore {
  const ttlMs = options.ttlMs ?? DEFAULT_CANARY_TTL_MS;
  const maxActive = options.maxActive ?? DEFAULT_CANARY_MAX_ACTIVE;
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error("deception.canary.ttlMs must be positive and finite");
  }
  if (!Number.isInteger(maxActive) || maxActive < 1 || maxActive > HARD_CANARY_MAX_ACTIVE) {
    throw new Error(`deception.canary.maxActive must be an integer between 1 and ${HARD_CANARY_MAX_ACTIVE}`);
  }
  let active: CanaryHandle[] = [];

  function prune(timestamp: number): void {
    active = active.filter((handle) => handle.expiresAt > timestamp);
  }

  function issue(timestamp: number): CanaryHandle {
    prune(timestamp);
    const token = generateToken();
    const handle: CanaryHandle = {
      token,
      path: `${CANARY_PATH_PREFIX}${token}`,
      expiresAt: timestamp + ttlMs,
    };
    active.push(handle);
    while (active.length > maxActive) active.shift();
    return handle;
  }

  return {
    current(timestamp: number): CanaryHandle {
      prune(timestamp);
      const newest = active[active.length - 1];
      return newest ?? issue(timestamp);
    },
    rotate(timestamp: number): CanaryHandle {
      return issue(timestamp);
    },
    matches(path: string, timestamp: number): boolean {
      prune(timestamp);
      return active.some((handle) => path.includes(handle.token));
    },
    reset() {
      active = [];
    },
  };
}
