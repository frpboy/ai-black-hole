import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { BlackHoleRuntime } from "@ai-black-hole/core";

export interface ExpressAdapterOptions {
  clientKey?: (request: Request) => string;
  onEvents?: (events: ReturnType<BlackHoleRuntime["observe"]>) => void;
}

export function blackHoleMiddleware(runtime: BlackHoleRuntime, options: ExpressAdapterOptions = {}): RequestHandler {
  return (request: Request, response: Response, next: NextFunction): void => {
    const requestId = String(request.headers["x-request-id"] ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const clientKey = options.clientKey?.(request) ?? request.ip ?? "unknown";
    try {
      const result = runtime.inspect({ requestId, method: request.method, path: request.path, clientKey });
      if (result.events.length) options.onEvents?.(result.events);
      if (runtime.mode === "enforce" && result.decision.action === "throttle") {
        response.status(429).json({ error: "Too many requests" });
        return;
      }
      next();
    } catch (error) { next(error); }
  };
}
