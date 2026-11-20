# Observability and privacy

Security telemetry can itself become a source of sensitive data. Treat it as security-relevant application data.

## Data minimisation
- Collect only fields required to explain a decision or investigate an event.
- Prefer categorical signals and stable, scoped identifiers over raw request contents.
- Do not capture passwords, authorization headers, cookies, access tokens, request bodies, or personal data by default.
- Avoid persistent identifiers unless there is a documented operational need and retention policy.
- Document the purpose of every event field.

## Storage and access
- Applications own their telemetry destination, access controls, encryption, retention, and deletion.
- Restrict access to operational personnel who need it.
- Avoid sending event payloads to third-party services by default.
- Never use telemetry as a substitute for access control or incident response.

## Reliability
- Telemetry callbacks must not break ordinary application traffic.
- Bound queues, buffers, retries, and event sizes.
- Define what happens when the telemetry destination is unavailable.
- Do not retry indefinitely.

## Deception telemetry
- Record interactions with synthetic decoys only to the extent needed for defensive analysis.
- Do not collect credentials entered into decoys as usable secrets; discard or irreversibly redact them.
- Never expose internal production identifiers or secrets in decoy responses.

This document is guidance. Applications must validate their own legal, privacy, and retention obligations.
