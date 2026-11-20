import { describe, expect, it } from "vitest";
import { createBlackHole } from "./index.js";

describe("createBlackHole", () => {
  it("defaults to monitor mode and allows ordinary traffic", () => {
    const runtime = createBlackHole({ now: () => 1000 });
    expect(runtime.mode).toBe("monitor");
    expect(
      runtime.inspect({
        requestId: "r1",
        method: "GET",
        path: "/health",
        clientKey: "a",
      }).decision.action,
    ).toBe("allow");
  });

  it("observes threshold crossings in monitor mode", () => {
    const runtime = createBlackHole({
      mode: "monitor",
      rateLimit: { maxRequests: 1 },
      now: () => 1000,
    });
    runtime.inspect({ requestId: "1", method: "GET", path: "/", clientKey: "a" });
    const result = runtime.inspect({
      requestId: "2",
      method: "GET",
      path: "/",
      clientKey: "a",
    });
    expect(result.decision.action).toBe("observe");
    expect(result.events.some((event) => event.type === "rate_limit.exceeded")).toBe(true);
  });

  it("throttles in enforce mode", () => {
    const runtime = createBlackHole({
      mode: "enforce",
      rateLimit: { maxRequests: 1 },
      now: () => 1000,
    });
    runtime.inspect({ requestId: "1", method: "GET", path: "/", clientKey: "a" });
    expect(
      runtime.inspect({
        requestId: "2",
        method: "GET",
        path: "/",
        clientKey: "a",
      }).decision.action,
    ).toBe("throttle");
  });

  it("evicts old client buckets when the configured cardinality limit is reached", () => {
    const runtime = createBlackHole({
      mode: "enforce",
      rateLimit: { maxRequests: 1, maxTrackedClients: 1 },
      now: () => 1000,
    });
    runtime.inspect({ requestId: "a1", method: "GET", path: "/", clientKey: "a" });
    runtime.inspect({ requestId: "b1", method: "GET", path: "/", clientKey: "b" });
    expect(
      runtime.inspect({
        requestId: "a2",
        method: "GET",
        path: "/",
        clientKey: "a",
      }).decision.action,
    ).toBe("allow");
  });

  it("rejects oversized observation fields", () => {
    const runtime = createBlackHole();
    expect(() =>
      runtime.inspect({
        requestId: "x",
        method: "GET",
        path: "/",
        clientKey: "x".repeat(257),
      }),
    ).toThrow();
  });

  it("validates options", () => {
    expect(() => createBlackHole({ rateLimit: { maxRequests: 0 } })).toThrow();
  });

  it("can reset counters", () => {
    const runtime = createBlackHole({
      mode: "enforce",
      rateLimit: { maxRequests: 1 },
      now: () => 1000,
    });
    runtime.inspect({ requestId: "1", method: "GET", path: "/", clientKey: "a" });
    runtime.resetRateLimits();
    expect(
      runtime.inspect({
        requestId: "2",
        method: "GET",
        path: "/",
        clientKey: "a",
      }).decision.action,
    ).toBe("allow");
  });
});
