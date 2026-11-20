import { describe, expect, it } from "vitest";
import { createBlackHole } from "./index.js";

const syntheticBody = JSON.stringify({ data: [{ id: "syn-001", value: 42 }], synthetic: true });

function withDecoy(overrides: Record<string, unknown> = {}) {
  return {
    mode: "enforce" as const,
    now: () => 1000,
    deception: {
      enabled: true,
      decoys: [
        {
          path: "/api/internal/metrics",
          body: syntheticBody,
          maxRequestsPerClient: 2,
          ...overrides,
        },
      ],
    },
  };
}

describe("decoy primitives", () => {
  it("serves a matching decoy in enforce mode with a decoy.accessed event", () => {
    const runtime = createBlackHole(withDecoy());
    const result = runtime.inspect({
      requestId: "r1",
      method: "GET",
      path: "/api/internal/metrics",
      clientKey: "a",
    });
    expect(result.decision.action).toBe("decoy");
    expect(result.events.some((event) => event.type === "decoy.accessed")).toBe(true);
    expect(runtime.getDecoyResponse("/api/internal/metrics")).toEqual({
      status: 200,
      contentType: "application/json",
      body: syntheticBody,
    });
  });

  it("only observes decoy access in monitor mode", () => {
    const monitor = createBlackHole({
      mode: "monitor",
      now: () => 1000,
      deception: { enabled: true, decoys: [{ path: "/decoy", body: "{}" }] },
    });
    const result = monitor.inspect({ requestId: "r1", method: "GET", path: "/decoy", clientKey: "a" });
    expect(result.decision.action).toBe("observe");
    expect(result.events.some((event) => event.type === "decoy.accessed")).toBe(true);
  });

  it("keeps deception disabled unless explicitly enabled", () => {
    const runtime = createBlackHole({
      mode: "enforce",
      now: () => 1000,
      deception: { decoys: [{ path: "/decoy", body: "{}" }] },
    });
    expect(
      runtime.inspect({ requestId: "r1", method: "GET", path: "/decoy", clientKey: "a" }).decision.action,
    ).toBe("allow");
    expect(runtime.getDecoyResponse("/decoy")).toBeUndefined();
  });

  it("never serves decoys while the runtime mode is off", () => {
    const runtime = createBlackHole({
      mode: "off",
      now: () => 1000,
      deception: { enabled: true, decoys: [{ path: "/decoy", body: "{}" }] },
    });
    const result = runtime.inspect({ requestId: "r1", method: "GET", path: "/decoy", clientKey: "a" });
    expect(result.decision.action).toBe("allow");
    expect(result.events).toHaveLength(0);
  });

  it("denies a client after its decoy response budget is exhausted", () => {
    const runtime = createBlackHole(withDecoy());
    runtime.inspect({ requestId: "r1", method: "GET", path: "/api/internal/metrics", clientKey: "a" });
    runtime.inspect({ requestId: "r2", method: "GET", path: "/api/internal/metrics", clientKey: "a" });
    const third = runtime.inspect({ requestId: "r3", method: "GET", path: "/api/internal/metrics", clientKey: "a" });
    expect(third.decision.action).toBe("deny");
    expect(third.decision.reason).toContain("budget exhausted");
    const other = runtime.inspect({ requestId: "r4", method: "GET", path: "/api/internal/metrics", clientKey: "b" });
    expect(other.decision.action).toBe("decoy");
  });

  it("stops matching a decoy after it expires", () => {
    const runtime = createBlackHole({
      mode: "enforce",
      now: () => 6000,
      deception: { enabled: true, decoys: [{ path: "/decoy", body: "{}", expiresAt: 5000 }] },
    });
    expect(
      runtime.inspect({ requestId: "r1", method: "GET", path: "/decoy", clientKey: "a" }).decision.action,
    ).toBe("allow");
  });

  it("resetDeception restores per-client decoy budgets", () => {
    const runtime = createBlackHole(withDecoy());
    runtime.inspect({ requestId: "r1", method: "GET", path: "/api/internal/metrics", clientKey: "a" });
    runtime.inspect({ requestId: "r2", method: "GET", path: "/api/internal/metrics", clientKey: "a" });
    runtime.resetDeception();
    expect(
      runtime.inspect({ requestId: "r3", method: "GET", path: "/api/internal/metrics", clientKey: "a" }).decision.action,
    ).toBe("decoy");
  });

  it("validates decoy definitions at startup", () => {
    expect(() =>
      createBlackHole({ deception: { enabled: true, decoys: [{ path: "no-slash", body: "{}" }] } }),
    ).toThrow();
    expect(() =>
      createBlackHole({ deception: { enabled: true, decoys: [{ path: "/a", body: "{}", status: 99 }] } }),
    ).toThrow();
    expect(() =>
      createBlackHole({
        deception: { enabled: true, decoys: [{ path: "/a", body: "{}" }, { path: "/a", body: "{}" }] },
      }),
    ).toThrow();
    expect(() =>
      createBlackHole({
        deception: { enabled: true, maxBodyBytes: 4, decoys: [{ path: "/a", body: "0123456789" }] },
      }),
    ).toThrow();
    expect(() =>
      createBlackHole({
        deception: { enabled: true, maxDecoys: 1, decoys: [{ path: "/a", body: "{}" }, { path: "/b", body: "{}" }] },
      }),
    ).toThrow();
  });
});

describe("canary identifiers", () => {
  it("issues a canary and records canary.triggered when its token appears in a path", () => {
    const runtime = createBlackHole({
      mode: "monitor",
      now: () => 1000,
      deception: { enabled: true, canary: {} },
    });
    const canary = runtime.getCanary();
    expect(canary).toBeDefined();
    const result = runtime.inspect({
      requestId: "r1",
      method: "GET",
      path: canary!.path,
      clientKey: "a",
    });
    expect(result.events.some((event) => event.type === "canary.triggered")).toBe(true);
    expect(result.decision.action).toBe("allow");
  });

  it("returns no canary when canaries are not configured", () => {
    const runtime = createBlackHole({ mode: "enforce", now: () => 1000, deception: { enabled: true } });
    expect(runtime.getCanary()).toBeUndefined();
    expect(runtime.rotateCanary()).toBeUndefined();
  });

  it("rotates canaries and keeps older tokens valid up to the active bound", () => {
    const runtime = createBlackHole({
      mode: "monitor",
      now: () => 1000,
      deception: { enabled: true, canary: { maxActive: 2 } },
    });
    const first = runtime.getCanary()!;
    const second = runtime.rotateCanary()!;
    expect(second.token).not.toBe(first.token);
    expect(
      runtime.inspect({ requestId: "r1", method: "GET", path: first.path, clientKey: "a" }).events.some(
        (event) => event.type === "canary.triggered",
      ),
    ).toBe(true);
    runtime.rotateCanary();
    expect(
      runtime.inspect({ requestId: "r2", method: "GET", path: first.path, clientKey: "a" }).events.some(
        (event) => event.type === "canary.triggered",
      ),
    ).toBe(false);
  });

  it("expires canaries after their ttl", () => {
    let clock = 1000;
    const runtime = createBlackHole({
      mode: "monitor",
      now: () => clock,
      deception: { enabled: true, canary: { ttlMs: 1000 } },
    });
    const canary = runtime.getCanary()!;
    clock = 5000;
    expect(
      runtime.inspect({ requestId: "r1", method: "GET", path: canary.path, clientKey: "a" }).events.some(
        (event) => event.type === "canary.triggered",
      ),
    ).toBe(false);
  });
});
