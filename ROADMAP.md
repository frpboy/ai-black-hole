# Roadmap

This roadmap is directional. Milestones are complete only when acceptance criteria are met and tested. Dates are not release promises.

## Current status

**Foundation / early prototype.** Public APIs are provisional. No production-readiness claim is made.

## M0 - Repository foundation
- [x] Define project purpose and boundaries.
- [x] Add Apache-2.0 license and community/security policies.
- [x] Define architecture, threat model and initial skill workflow.
- [ ] Establish CI and security automation.

## M1 - Runtime core
- [ ] Finalise event and request-context contracts.
- [ ] Implement safe configuration validation.
- [ ] Implement deterministic policy evaluation.
- [ ] Implement bounded in-memory rate control.
- [ ] Add unit tests and API documentation.

## M2 - Detection
- [ ] Configurable behavioural signals and explainable risk assessments.
- [ ] Scoped identities for authorised automation.
- [ ] False-positive and bypass testing.

## M3 - Controlled deception
- [ ] Synthetic decoy registry and handlers.
- [ ] Canary identifiers and event recording.
- [ ] Request, time, response-size and memory bounds.
- [ ] Isolation tests, expiry and emergency disable.

## M4 - Integrations
- [ ] Express adapter.
- [ ] NestJS adapter.
- [ ] Working examples and integration tests.
- [ ] Evaluate Python adapter.

## M5 - Agent skill
- [ ] Agent-neutral SKILL.md.
- [ ] Repository discovery and audit workflow.
- [ ] Plan-before-edit and confirmation gates.
- [ ] Framework-aware runtime integration.
- [ ] Verification, rollback and host compatibility guidance.

## M6 - Public beta
- [ ] Security and dependency review.
- [ ] Reproducible installation and release process.
- [ ] External documentation review.
- [ ] Tag beta only after acceptance criteria pass.

## Non-goals

- Preventing all reverse engineering or proving an agent's identity.
- Attacking, infecting or exhausting another agent or provider.
- Replacing authentication, authorization, secure architecture or incident response.
- Requiring a central cloud service or mandatory telemetry collection.
