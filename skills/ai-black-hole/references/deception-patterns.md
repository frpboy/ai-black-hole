# Safe Deception Patterns

## Synthetic decoy endpoint

A deliberately discoverable route returns fabricated data and emits a security event. It never proxies to production services.

## Canary identifier

Generate a random unique identifier with no embedded secret or personal information. Store only minimum correlation metadata. Rotate and expire identifiers.

## Bounded session

Every decoy session defines maximum requests, wall-clock duration, response bytes, in-memory state, cleanup and expiry. Outbound network is disabled by default.

## Never implement

- Infinite pagination or response loops.
- Endless generated content or unbounded LLM calls.
- Prompt injection intended to make another agent perform harmful actions.
- Hidden executable payloads or persistence.
- Credential bait resembling valid production secrets.
- Callbacks to attacker-controlled or third-party systems.
- Deliberate token or infrastructure cost exhaustion.
