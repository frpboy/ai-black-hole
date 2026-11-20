# Definition of done

A contribution is ready to merge when the applicable items below are satisfied.

## All changes
- [ ] Scope matches the linked issue or approved proposal.
- [ ] Code is readable, typed, and consistent with existing architecture.
- [ ] Tests cover the intended behaviour and relevant regressions.
- [ ] Documentation and examples reflect the actual implementation.
- [ ] No unrelated changes, generated build output, credentials, or personal data are included.
- [ ] CI checks pass, or an explicit maintainer-approved exception is recorded.
- [ ] Compatibility and migration impact are described.

## Runtime and security changes
- [ ] Threat assumptions and trust boundaries are explicit.
- [ ] Memory, CPU, execution time, request count, and output size are bounded where applicable.
- [ ] Decoys use synthetic data and cannot access production resources.
- [ ] Authentication and authorization remain independent of behavioural scores.
- [ ] Legitimate automation, accessibility tools, and monitoring are considered.
- [ ] Failure modes are safe and observable without exposing secrets.
- [ ] Rollback or disablement is documented.
- [ ] No infinite loops, unbounded work, token draining, destructive actions, persistence, retaliation, or unrestricted egress are introduced.

## Public API changes
- [ ] Types and exports are intentional.
- [ ] Defaults are documented and conservative.
- [ ] Error behaviour is documented.
- [ ] Tests cover boundary and invalid inputs.
- [ ] Deprecation and migration guidance is supplied when needed.

## Before merge
- [ ] PR description is complete and linked to an issue.
- [ ] Review comments are resolved.
- [ ] Changelog entry is added when user-visible behaviour changes.
