# Maintainer handbook

This document is an operational checklist, not a promise of response times.

## Triage
1. Check whether the report is a duplicate or needs clarification.
2. Confirm that public reports contain no secrets, personal data, or exploit details.
3. Move vulnerability reports to the private process in SECURITY.md; remove exposed sensitive material where possible.
4. Apply area and priority labels consistently.
5. Reproduce bugs with synthetic fixtures before assigning a fix.
6. For feature proposals, ask for the problem and smallest useful scope before accepting implementation work.

## Pull request review
1. Confirm the PR links an issue when the change is substantial.
2. Review the diff for unrelated changes, generated files, dependency additions, and accidental secrets.
3. Check tests and CI results; do not rely on an author's statement alone.
4. Review public API compatibility and documentation.
5. For security-sensitive changes, verify the threat model, bounds, isolation, privacy, false-positive handling, and rollback.
6. Request changes when a safety invariant is violated. Do not waive a security invariant merely to unblock a release.

## Labels
Suggested labels:
- Type: `bug`, `enhancement`, `documentation`, `question`
- Contributor: `good first issue`, `help wanted`
- Area: `area: core`, `area: express`, `area: skill`, `area: docs`, `area: ci`
- Priority: `priority: high`, `priority: normal`, `priority: low`
- Status: `needs-triage`, `blocked`, `in-progress`

Create these labels in repository settings before relying on automation that assigns them. GitHub workflows that reference missing labels can fail.

## Release
Follow [docs/RELEASING.md](docs/RELEASING.md) and [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md). Never publish an unverified security claim or imply that reverse engineering can be prevented.
