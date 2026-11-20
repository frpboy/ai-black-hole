import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { createBlackHole } from "@ai-black-hole/core";
import { blackHoleMiddleware } from "./index.js";

function fakeRequest() {
  return { headers: {}, ip: "test-client", method: "GET", path: "/test" } as unknown as Request;
}

describe("blackHoleMiddleware", () => {
  it("continues in monitor mode and emits observations", () => {
    const runtime = createBlackHole({ mode: "monitor" });
    const onEvents = vi.fn();
    const next = vi.fn() as unknown as NextFunction;
    const response = {} as Response;
    blackHoleMiddleware(runtime, { onEvents })(fakeRequest(), response, next);
    expect(next).toHaveBeenCalledOnce();
    expect(onEvents).toHaveBeenCalledOnce();
  });

  it("serves the synthetic decoy response in enforce mode", () => {
    const runtime = createBlackHole({
      mode: "enforce",
      deception: {
        enabled: true,
        decoys: [{ path: "/test", status: 200, contentType: "application/json", body: "{\"synthetic\":true}" }],
      },
    });
    const next = vi.fn() as unknown as NextFunction;
    const send = vi.fn();
    const type = vi.fn(() => ({ send }));
    const status = vi.fn(() => ({ type }));
    const response = { status } as unknown as Response;
    blackHoleMiddleware(runtime)(fakeRequest(), response, next);
    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(type).toHaveBeenCalledWith("application/json");
    expect(send).toHaveBeenCalledWith("{\"synthetic\":true}");
  });

  it("answers 404 once a client's decoy budget is exhausted in enforce mode", () => {
    const runtime = createBlackHole({
      mode: "enforce",
      deception: { enabled: true, decoys: [{ path: "/test", body: "{}", maxRequestsPerClient: 1 }] },
    });
    const next = vi.fn() as unknown as NextFunction;
    const json = vi.fn();
    const send = vi.fn();
    const type = vi.fn(() => ({ send }));
    const status = vi.fn(() => ({ type, json }));
    const response = { status } as unknown as Response;
    const middleware = blackHoleMiddleware(runtime);
    middleware(fakeRequest(), response, next);
    middleware(fakeRequest(), response, next);
    expect(status).toHaveBeenLastCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: "Not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("observes but does not serve decoys in monitor mode", () => {
    const runtime = createBlackHole({
      mode: "monitor",
      deception: { enabled: true, decoys: [{ path: "/test", body: "{}" }] },
    });
    const onEvents = vi.fn();
    const next = vi.fn() as unknown as NextFunction;
    const response = {} as Response;
    blackHoleMiddleware(runtime, { onEvents })(fakeRequest(), response, next);
    expect(next).toHaveBeenCalledOnce();
    const events = onEvents.mock.calls.flatMap((call) => call[0] as never[]);
    expect(events.some((event) => (event as { type: string }).type === "decoy.accessed")).toBe(true);
  });

  it("returns 429 after a threshold is exceeded in enforce mode", () => {
    const runtime = createBlackHole({ mode: "enforce", rateLimit: { maxRequests: 1 } });
    const next = vi.fn() as unknown as NextFunction;
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const response = { status } as unknown as Response;
    const middleware = blackHoleMiddleware(runtime);
    middleware(fakeRequest(), response, next);
    middleware(fakeRequest(), response, next);
    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith({ error: "Too many requests" });
  });
});
