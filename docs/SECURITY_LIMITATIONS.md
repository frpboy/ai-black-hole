# Security Limitations

AI Black Hole is a defence-in-depth toolkit, not an anti-reverse-engineering guarantee.

- Public client-side code can be downloaded and inspected.
- Minification and obfuscation are not security boundaries.
- No heuristic can reliably classify every AI agent.
- IP, User-Agent and browser fingerprints are incomplete and spoofable.
- Behavioural detection can produce false positives and false negatives.
- Decoys do not replace access control or secure application design.
- A compromised server can bypass application-level controls.
- Rate limits require careful identity and proxy configuration.
- Logging creates privacy and retention responsibilities.

Keep secrets, authorization decisions and sensitive business logic on trusted servers. Test protections against legitimate traffic before enforcement. Never configure decoys with real credentials, customer information, production records or internal infrastructure links. Never use decoys to attack or exhaust third-party systems.

## Deception limitations

- Canary detection matches request paths only. Tokens appearing in headers, bodies or other fields are not detected.
- Canary tokens are low-sensitivity random identifiers, not secrets. By design they appear in security event paths and in any logs that record request paths. Never embed meaningful data in a token; rotation and expiry bound how long a token stays valid.
- `getDecoyResponse` is a pure lookup helper: it performs no budget or expiry enforcement. Adapters and integrations must serve a decoy response only after an `inspect` call has returned a decision with action `decoy`.
- Every decoy has a finite lifetime: `expiresAt`, or the default `deception.decoyTtlMs` of 24 hours (maximum 30 days).
- Per-client decoy budgets are consumed only when a synthetic response is actually served. Budget counters are bounded at 10,000 client entries and fail closed at capacity: an untracked client is treated as exhausted rather than evicting another client's budget record. `resetDeception()` clears them.
- Decoy budgets, canary state and counters are process-local in memory, like the in-memory rate limiter. Multi-instance deployments need their own coordination.
- Decoy bodies are static operator-configured strings. The runtime enforces size and format bounds but cannot verify that content is truly synthetic; that remains an operator responsibility.
