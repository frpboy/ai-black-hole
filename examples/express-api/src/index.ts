import express from "express";
import { createBlackHole } from "@ai-black-hole/core";
import { blackHoleMiddleware } from "@ai-black-hole/express";

const app = express();
const runtime = createBlackHole({ mode: "monitor", rateLimit: { windowMs: 60_000, maxRequests: 100 } });
app.use(blackHoleMiddleware(runtime, {
  onEvents(events) { for (const event of events) process.stdout.write(`${JSON.stringify(event)}\n`); },
}));
app.get("/health", (_request, response) => response.json({ ok: true }));
app.listen(3000, () => process.stdout.write("Example listening on http://localhost:3000\n"));
