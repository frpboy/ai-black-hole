# Release Checklist

## Before any tagged release

- [ ] Confirm the release scope and compatibility impact.
- [ ] Update CHANGELOG.md and version numbers.
- [ ] Run `npm install` from a clean checkout.
- [ ] Run `npm run check`.
- [ ] Run all integration and security tests.
- [ ] Review dependency and license changes.
- [ ] Review CodeQL and dependency alerts.
- [ ] Review threat model and security limitations.
- [ ] Confirm examples contain synthetic data only.
- [ ] Confirm no secrets or private data are committed.
- [ ] Confirm default mode is non-disruptive.
- [ ] Confirm resource limits and emergency disable paths.
- [ ] Verify installation and upgrade instructions.
- [ ] Publish release notes with known limitations.

## Beta release gates

- [ ] External review of runtime trust boundaries.
- [ ] Decoy isolation tests pass.
- [ ] False-positive tests cover legitimate automation.
- [ ] No unresolved critical/high severity findings.
- [ ] API stability status is clearly communicated.
- [ ] Public issue templates and security reporting are functional.
