import {
  createCanaryStore,
  createDecoyRegistry,
  type CanaryHandle,
  type CanaryStore,
  type DecoyRegistry,
  type DecoyResponse,
  type DeceptionOptions,
} from "./deception.js";

export type RuntimeMode = "off" | "monitor" | "enforce";
export type DecisionAction = "allow" | "observe" | "throttle" | "deny" | "decoy";
export interface RateLimitOptions { windowMs: number; maxRequests: number; maxTrackedClients?: number }
export interface BlackHoleOptions { mode?: RuntimeMode; rateLimit?: Partial<RateLimitOptions>; deception?: DeceptionOptions; now?: () => number }
export interface RequestObservation { requestId: string; method: string; path: string; clientKey: string; timestamp?: number; authenticated?: boolean; automationId?: string }
export interface SecurityEvent { type: "request.observed" | "rate_limit.exceeded" | "policy.decision" | "decoy.accessed" | "canary.triggered"; timestamp: number; requestId: string; path: string; action?: DecisionAction; reason?: string }
export interface PolicyDecision { action: DecisionAction; reason: string }
export interface InspectionResult { events: SecurityEvent[]; decision: PolicyDecision }
export interface BlackHoleRuntime {
  readonly mode: RuntimeMode;
  inspect(input: RequestObservation): InspectionResult;
  /** Synthetic response for a registered decoy path, if any. */
  getDecoyResponse(path: string, method?: string): DecoyResponse | undefined;
  /** Current canary identifier, or undefined when canaries are not enabled. */
  getCanary(): CanaryHandle | undefined;
  /** Rotate the canary identifier. Returns undefined when canaries are not enabled. */
  rotateCanary(): CanaryHandle | undefined;
  resetRateLimits(): void;
  /** Clear per-client decoy budgets and canary state. */
  resetDeception(): void;
}

export type { CanaryHandle, DecoyDefinition, DecoyResponse, DeceptionOptions } from "./deception.js";

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 120;
const DEFAULT_MAX_TRACKED_CLIENTS = 10_000;

export function createBlackHole(options: BlackHoleOptions = {}): BlackHoleRuntime {
  const mode = options.mode ?? "monitor";
  const windowMs = options.rateLimit?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.rateLimit?.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const maxTrackedClients = options.rateLimit?.maxTrackedClients ?? DEFAULT_MAX_TRACKED_CLIENTS;
  const now = options.now ?? Date.now;
  const buckets = new Map<string, number[]>();
  if (!Number.isFinite(windowMs) || windowMs <= 0) throw new Error("rateLimit.windowMs must be positive and finite");
  if (!Number.isInteger(maxRequests) || maxRequests < 1) throw new Error("rateLimit.maxRequests must be a positive integer");
  if (!Number.isInteger(maxTrackedClients) || maxTrackedClients < 1) throw new Error("rateLimit.maxTrackedClients must be a positive integer");

  // Deception is opt-in and never active while the runtime mode is "off".
  const deceptionEnabled = mode !== "off" && options.deception?.enabled === true;
  const registry: DecoyRegistry | undefined = deceptionEnabled
    ? createDecoyRegistry(options.deception)
    : undefined;
  const canaries: CanaryStore | undefined =
    deceptionEnabled && options.deception?.canary !== undefined
      ? createCanaryStore(options.deception.canary, now)
      : undefined;

  function inspect(input: RequestObservation): InspectionResult {
    if (mode === "off") return { events: [], decision: { action: "allow", reason: "Runtime mode is off" } };
    if (!input.requestId || !input.path || !input.clientKey) throw new Error("requestId, path and clientKey are required");
    if (input.requestId.length > 128) throw new Error("requestId must not exceed 128 characters");
    if (input.path.length > 2048) throw new Error("path must not exceed 2048 characters");
    if (input.clientKey.length > 256) throw new Error("clientKey must not exceed 256 characters");
    const timestamp = input.timestamp ?? now();
    if (!Number.isFinite(timestamp)) throw new Error("timestamp must be finite");
    const previous = buckets.get(input.clientKey) ?? [];
    const active = previous.filter((value) => value > timestamp - windowMs);
    active.push(timestamp);
    if (active.length > maxRequests + 1) active.splice(0, active.length - (maxRequests + 1));
    if (!buckets.has(input.clientKey) && buckets.size >= maxTrackedClients) {
      const oldest = buckets.keys().next().value as string | undefined;
      if (oldest !== undefined) buckets.delete(oldest);
    }
    buckets.delete(input.clientKey);
    buckets.set(input.clientKey, active);
    const exceeded = active.length > maxRequests;

    const events: SecurityEvent[] = [{ type: "request.observed", timestamp, requestId: input.requestId, path: input.path }];

    const decoy = registry?.lookup(input.path, input.method, input.clientKey, timestamp) ?? { kind: "none" as const };
    if (decoy.kind !== "none") {
      events.push({
        type: "decoy.accessed",
        timestamp,
        requestId: input.requestId,
        path: input.path,
        reason: decoy.kind === "exhausted" ? "Decoy session budget exhausted" : "Matched synthetic decoy route",
      });
    }
    if (canaries?.matches(input.path, timestamp)) {
      events.push({
        type: "canary.triggered",
        timestamp,
        requestId: input.requestId,
        path: input.path,
        reason: "Request path contained an active canary identifier",
      });
    }

    let action: DecisionAction;
    let reason: string;
    if (decoy.kind === "exhausted") {
      action = mode === "enforce" ? "deny" : "observe";
      reason = `Decoy per-client response budget exhausted: maximum ${decoy.limit} responses per client`;
    } else if (exceeded) {
      action = mode === "enforce" ? "throttle" : "observe";
      reason = `Rate limit threshold exceeded: maximum ${maxRequests} requests per ${windowMs}ms`;
      events.push({ type: "rate_limit.exceeded", timestamp, requestId: input.requestId, path: input.path, action, reason });
    } else if (decoy.kind === "serve") {
      action = mode === "enforce" ? "decoy" : "observe";
      reason = "Matched synthetic decoy route";
    } else {
      action = "allow";
      reason = "No configured runtime rule matched";
    }
    return { events, decision: { action, reason } };
  }
  return {
    mode, inspect,
    getDecoyResponse(path: string, method?: string): DecoyResponse | undefined {
      return registry?.responseFor(path, method);
    },
    getCanary(): CanaryHandle | undefined {
      return canaries?.current(now());
    },
    rotateCanary(): CanaryHandle | undefined {
      return canaries?.rotate(now());
    },
    resetRateLimits() { buckets.clear(); },
    resetDeception() {
      registry?.reset();
      canaries?.reset();
    },
  };
}
