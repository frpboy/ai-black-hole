export type RuntimeMode = "off" | "monitor" | "enforce";
export type DecisionAction = "allow" | "observe" | "throttle" | "deny" | "decoy";
export interface RateLimitOptions { windowMs: number; maxRequests: number; maxTrackedClients?: number }
export interface BlackHoleOptions { mode?: RuntimeMode; rateLimit?: Partial<RateLimitOptions>; now?: () => number }
export interface RequestObservation { requestId: string; method: string; path: string; clientKey: string; timestamp?: number; authenticated?: boolean; automationId?: string }
export interface SecurityEvent { type: "request.observed" | "rate_limit.exceeded" | "policy.decision" | "decoy.accessed"; timestamp: number; requestId: string; path: string; action?: DecisionAction; reason?: string }
export interface PolicyDecision { action: DecisionAction; reason: string }
export interface InspectionResult { events: SecurityEvent[]; decision: PolicyDecision }
export interface BlackHoleRuntime { readonly mode: RuntimeMode; inspect(input: RequestObservation): InspectionResult; resetRateLimits(): void }

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

  function inspect(input: RequestObservation): InspectionResult {
    if (mode === "off") return { events: [], decision: { action: "allow", reason: "Runtime mode is off" } };
    if (!input.requestId || !input.path || !input.clientKey) throw new Error("requestId, path and clientKey are required");
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
    const action: DecisionAction = exceeded ? (mode === "enforce" ? "throttle" : "observe") : "allow";
    const reason = exceeded ? `Rate limit threshold exceeded: maximum ${maxRequests} requests per ${windowMs}ms` : "No configured runtime rule matched";
    const events: SecurityEvent[] = [{ type: "request.observed", timestamp, requestId: input.requestId, path: input.path }];
    if (exceeded) events.push({ type: "rate_limit.exceeded", timestamp, requestId: input.requestId, path: input.path, action, reason });
    return { events, decision: { action, reason } };
  }
  return {
    mode, inspect,
    resetRateLimits() { buckets.clear(); },
  };
}
