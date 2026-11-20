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
