# Threat Model

## Assets

Customer and business data, credentials and signing keys, proprietary server-side logic, availability and infrastructure budget, workflow integrity, and security telemetry.

## Threats

- Unauthenticated scrapers and route enumerators.
- Automated clients probing object identifiers.
- Credential-stuffing and abusive scripted clients.
- Unauthorised access and privilege escalation.
- Reverse engineers inspecting distributed web or mobile client code.
- Misconfigured or over-privileged integrations.

## Assumptions

All client-supplied values are untrusted. User-Agent and browser fingerprints can be spoofed. AI and human automation cannot be reliably distinguished from request metadata alone. IP addresses may represent many users or change frequently.

## Mitigations

- Server-side authorization on every sensitive object and action.
- Keep secrets and sensitive business logic server-side.
- Minimise data returned to clients.
- Rate limits and quotas at identity and resource boundaries.
- Input validation and safe errors.
- Behavioural signals as supplemental telemetry.
- Synthetic decoys with strict isolation and resource limits.
- Scoped credentials and explicit policies for authorised automation.

## Abuse cases

| Abuse case | Control | Residual risk |
|---|---|---|
| Route enumeration | Detection, throttling, synthetic decoys | Distributed clients can evade heuristics |
| Object ID guessing | Per-object authorization and rate limits | Application authorization bugs |
| Source inspection | Remove secrets, move logic server-side | Client code remains inspectable |
| Credential probing | Auth controls, limits and alerting | Stolen valid credentials |
| Canary access | Unique synthetic identifiers and alerts | Scanners and previews can trigger it |
| Decoy abuse | Synthetic-only data, hard limits, isolation | Runtime or infrastructure vulnerabilities |
| Legitimate automation blocked | Explicit scoped allow rules and tests | Configuration mistakes |

## Security invariants

1. Decoy code cannot access production databases or secrets.
2. Every decoy session has finite request and time budgets.
3. Core operation requires no external network calls.
4. Enforcement decisions are explainable.
5. Authentication and authorization do not depend on risk scores.
6. Default operation does not disrupt legitimate traffic.

## Out of scope

Malware, persistence, destructive actions, retaliation, unbounded computation, token-draining attacks, third-party access without permission, and guaranteed prevention of reverse engineering.
