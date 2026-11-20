# Compatibility policy

AI Black Hole is early-stage software. Until a stable major release is explicitly declared, public APIs may change between minor or pre-1.0 releases.

## Runtime support

- Node.js 20 or newer is the current repository baseline.
- Framework adapters may have narrower peer/runtime requirements; consult each adapter's package metadata and documentation.
- A package is not considered compatible with a framework version merely because TypeScript compilation succeeds.

## API stability

- Exported symbols are public surface area and should be documented.
- Internal files and undocumented implementation details are not guaranteed stable.
- Breaking changes must be called out in the changelog and release notes.
- Security fixes may require urgent behaviour changes; explain operational impact and migration steps.

## Support claims

Do not claim a runtime, framework, browser, or deployment target is supported until it is covered by CI or a documented manual compatibility test. Record tested versions and limitations in the relevant package documentation.
