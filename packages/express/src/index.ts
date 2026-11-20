import type { Request, Response, NextFunction, RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import type { BlackHoleRuntime, SecurityEvent } from "@ai-black-hole/core";

export interface ExpressAdapterOptions {
  clientKey?: (request: Request) => string;
  onEvents?: (events: SecurityEvent[]) => void;
}

export function blackHoleMiddleware(
  runtime: BlackHoleRuntime,
  options: ExpressAdapterOptions = {},
): RequestHandler {
  return (request: Request, response: Response, next: NextFunction): void => {
    const requestId = randomUUID();
    const clientKey = options.clientKey?.(request) ?? request.ip ?? "unknown";

    try {
      const result = runtime.inspect({
        requestId,
        method: request.method,
        path: request.path,
        clientKey,
      });

      if (result.events.length > 0) {
        try {
          options.onEvents?.(result.events);
        } catch {
          // Optional telemetry must not break application traffic.
        }
      }

      if (runtime.mode === "enforce" && result.decision.action === "throttle") {
        response.status(429).json({ error: "Too many requests" });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
