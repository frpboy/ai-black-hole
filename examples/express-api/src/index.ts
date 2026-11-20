import express from "express";
import { createBlackHole } from "@ai-black-hole/core";
import { blackHoleMiddleware } from "@ai-black-hole/express";

const app = express();
const runtime = createBlackHole({
  // Switch to "enforce" to serve the synthetic decoy response instead of
  // only observing access. Deception stays opt-in via deception.enabled.
  mode: "monitor",
  rateLimit: { windowMs: 60_000, maxRequests: 100 },
  deception: {
    enabled: true,
    decoys: [
      {
        path: "/api/internal/metrics",
        body: JSON.stringify({ data: [], synthetic: true }),
        maxRequestsPerClient: 25,
      },
    ],
    canary: { ttlMs: 86_400_000 },
  },
});
app.use(blackHoleMiddleware(runtime, {
  onEvents(events) { for (const event of events) process.stdout.write(`${JSON.stringify(event)}\n`); },
}));
app.get("/health", (_request, response) => response.json({ ok: true }));
app.listen(3000, () => {
  process.stdout.write("Example listening on http://localhost:3000\n");
  const canary = runtime.getCanary();
  if (canary) process.stdout.write(`Canary path (emits canary.triggered when requested): ${canary.path}\n`);
});
