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
