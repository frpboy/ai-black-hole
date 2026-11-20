# Release process

AI Black Hole is pre-release software. Use this process when preparing a tagged release.

## Before release
- [ ] Confirm the intended version and scope.
- [ ] Review all merged changes and unresolved release-blocking issues.
- [ ] Run a clean install, build, typecheck, and test suite on a clean environment.
- [ ] Review dependency updates and security advisories.
- [ ] Verify package metadata, exports, README instructions, and license files.
- [ ] Update CHANGELOG.md with user-visible changes and migration notes.
- [ ] Review SECURITY.md and supported-version guidance.
- [ ] Confirm examples do not use real secrets, real customer data, or unsafe network access.
- [ ] Confirm all CI and CodeQL workflows pass.

## Publish
1. Create a release branch if release changes need coordination.
2. Update package versions consistently and commit the changelog.
3. Create and push a signed or otherwise verified version tag where available.
4. Create a GitHub Release with concise notes, compatibility information, and known limitations.
5. Publish packages only after verifying package contents and provenance settings.

## After release
- [ ] Verify published package metadata and install instructions.
- [ ] Test the documented quick start against the published version.
- [ ] Announce breaking changes and security fixes clearly.
- [ ] Keep the previous release available for users who need rollback.

Do not claim production readiness, complete protection, or reliable AI-agent identification without evidence.
