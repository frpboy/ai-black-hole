# Changelog

All notable changes to AI Black Hole will be documented here.

The project is in early development. Public APIs are provisional and no stable release has been published.

## Unreleased

### Added
- Initial public project documentation and threat model.
- Apache-2.0 licensing and contribution/security policies.
- Agent-neutral AI Black Hole skill foundation.
- TypeScript workspace and framework-neutral runtime prototype.
- Basic monitor/enforce request threshold evaluation.
- Bounded in-memory client bucket tracking.
- Initial Express middleware adapter and example.
- Unit tests for core runtime and Express middleware.
- GitHub Actions CI and CodeQL workflows.
- Development plan, roadmap, release checklist and repository agent instructions.

### Added (2026-11-20)
- Opt-in bounded deception primitives (roadmap M3, first slice): synthetic decoy registry with per-client response budgets and expiry, canary identifiers with rotation and ttl, `decoy.accessed` and `canary.triggered` security events, and `decoy`/`deny` policy actions.
- Express adapter serves synthetic decoy responses in enforce mode and answers exhausted decoy budgets with 404.
- Design concepts adapted from BLA (https://github.com/qybaihe/bla, MIT); attribution in NOTICE and docs/BLA_ADAPTATION.md.

### Notes
- Deception is disabled unless explicitly enabled and never runs in `off` mode; token/cost exhaustion techniques from BLA were deliberately excluded (see docs/BLA_ADAPTATION.md).
- npm packages have not yet been published.
