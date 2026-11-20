# Development Plan

This document turns the roadmap into implementation work packages. The order is intentional: the project must establish reliable security boundaries before adding deception.

## Product tracks

### Track A: Runtime
A self-hosted TypeScript library that observes requests, evaluates deterministic policy, applies bounded controls and emits redacted events.

### Track B: Agent skill
A repeatable workflow that inspects a target application, builds an evidence-based threat model, proposes changes, integrates runtime components and verifies the result.

### Track C: Integrations and ecosystem
Framework adapters, examples, host-specific skill packaging, documentation, CI and release automation.

## Phase 0: Foundation

Deliverables:
- Repository governance and license.
- Threat model and architecture.
- TypeScript workspace.
- CI and static analysis.
- Repository instructions for coding agents.

Exit criteria:
- Clean install from a fresh clone.
- CI build, typecheck and tests pass.
- Security boundaries are documented.
- Public APIs are explicitly marked provisional.

## Phase 1: Runtime contracts

Work:
- Define request observation, security event, policy decision and runtime configuration schemas.
- Define stable error behaviour and validation.
- Separate request inspection from side-effecting controls.
- Define event redaction and sink interfaces.
- Define mode semantics.

Exit criteria:
- Type-safe public API.
- Deterministic unit tests.
- Invalid configuration fails at startup.
- No ambiguous double-counting API.

## Phase 2: Rate control and policy

Work:
- In-memory limiter for development and single-process use.
- Explicit maximum tracked identities and eviction strategy.
- Pluggable limiter interface for distributed deployments.
- Deterministic policy rules with reason codes.
- Scoped allow rules for authorised integrations.

Exit criteria:
- Memory is bounded.
- Window expiry and clock assumptions are documented.
- Multi-instance limitations are explicit.
- Authorization is never inferred from risk scores.

## Phase 3: Behavioural detection

Work:
- Route enumeration indicators.
- Request frequency and sequence indicators.
- Repeated failed authentication/authorization indicators.
- Canary access events.
- Configurable signal weights and thresholds.
- Explainable decisions and false-positive handling.

Exit criteria:
- Every signal has documented limitations.
- Tests cover normal users, accessibility tools, monitoring and authorised automation.
- No detection rule alone causes severe disruption by default.

## Phase 4: Deception

Work:
- Synthetic decoy registry.
- Canary ID generation and rotation.
- Isolated handlers with synthetic fixtures.
- Per-session request, time and response-size budgets.
- Expiry, cleanup and emergency disable.
- No outbound network by default.

Exit criteria:
- Tests prove no production database or secret access.
- All resource limits are enforced.
- Decoy access produces a minimal redacted event.
- Deception remains opt-in.

## Phase 5: Framework integrations

Work:
- Express adapter.
- NestJS adapter.
- Middleware ordering guidance.
- Trusted proxy configuration.
- Graceful shutdown and error handling.
- Integration tests and runnable examples.

Exit criteria:
- Clean example install and run.
- No duplicate request evaluation.
- Framework integration does not bypass existing auth.
- Telemetry sink failures do not interrupt application traffic.

## Phase 6: Agent skill

Work:
- Agent-neutral skill specification.
- Repository discovery and audit.
- Evidence-based severity classification.
- Plan-before-edit and user approval gates.
- Framework/version-aware package integration.
- Test generation, verification and rollback.
- Host-specific packaging after verifying each host's official format.

Exit criteria:
- Skill does not hallucinate unsupported packages or APIs.
- Skill starts in monitor mode.
- Skill preserves user changes.
- Skill produces a reproducible report of changes and residual risks.

## Phase 7: Public beta

Work:
- External security review.
- API and compatibility review.
- Documentation and clean-install verification.
- Dependency and license review.
- Versioning and release notes.
- Public beta feedback process.

Exit criteria:
- All critical tests pass.
- No unresolved critical/high security findings.
- Known limitations are prominent.
- A developer can reproduce the example from a clean checkout.

## Cross-cutting quality gates

Every phase must consider:
- security and privacy;
- resource bounds;
- accessibility and legitimate automation;
- false positives;
- observability without sensitive logging;
- failure modes and rollback;
- documentation and migration impact.

## Explicit non-goals

AI Black Hole will not guarantee anti-reverse-engineering, identify all AI clients, attack external agents, drain tokens, create unbounded work, ship malware, or require a central hosted service.
