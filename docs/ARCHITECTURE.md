# Architecture

## Overview

AI Black Hole combines a development-time agent skill with an application runtime. The skill audits a repository, proposes changes, integrates supported packages and verifies the result. The runtime executes inside the developer's application and evaluates request observations. The skill does not protect a deployed app unless runtime controls are integrated and deployed.

## Runtime layers

1. **Adapters** translate framework requests into a stable observation.
2. **Core** owns configuration, request context and event contracts.
3. **Detection** extracts behavioural signals.
4. **Policy** evaluates explicit rules and produces explainable decisions.
5. **Controls** apply allow, observe, throttle, challenge, restrict or deny.
6. **Deception** serves synthetic resources from isolated, bounded handlers.
7. **Telemetry** emits structured, redacted events to an application-owned sink.

## Trust boundaries

Request headers, paths, query parameters and client fingerprints are untrusted. Risk scores are advisory, never identity proof. Decoys must not receive production credentials or unrestricted database clients. Telemetry must not log secrets or sensitive payloads.

## Request lifecycle

1. Adapter extracts method, route, request ID and client key using explicitly configured proxy trust.
2. Authentication and authorization are enforced independently.
3. Detection produces bounded signals.
4. Policy evaluates configured rules.
5. Adapter applies the decision.
6. Approved decoys use synthetic data and isolated handlers.
7. Runtime emits a redacted event.

## Modes

- `off`: optional protection disabled.
- `monitor`: observe without changing responses.
- `enforce`: apply configured controls.
- `deception`: explicitly enable registered synthetic decoys.

Monitor is the default. Mode changes must be deliberate and reviewed.

## Failure behaviour

Authentication and authorization must fail closed in the application's own security layer. Optional telemetry should fail open. Deception must fail closed: if isolation or bounds cannot be guaranteed, do not serve the decoy.

The runtime is self-hosted. No central control plane or external telemetry endpoint is required.
