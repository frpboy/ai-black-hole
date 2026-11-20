# Contributing

Thanks for helping improve AI Black Hole.

New contributors: start with the [Contributor Onboarding Guide](docs/CONTRIBUTOR_ONBOARDING.md). The [issue triage guide](docs/ISSUE_TRIAGE.md) explains how work is selected and scoped. Read the [Community Guide](docs/COMMUNITY.md) and [Definition of Done](docs/DEFINITION_OF_DONE.md) before opening a substantial pull request.

## Before opening a pull request

1. Search existing issues and pull requests.
2. Comment on an issue before starting substantial work.
3. Discuss architecture or public API changes in an issue first.
4. Keep changes focused and explain the problem being solved.
5. Add or update tests and documentation.
6. Run `npm install` and `npm run check`.
7. Complete the pull-request template honestly.

## Development expectations

- Follow the existing package boundaries and TypeScript strictness.
- Keep dependencies minimal and justify additions.
- Prefer deterministic, explainable behaviour.
- Preserve compatibility unless a breaking change is explicitly proposed.
- Do not commit generated output, local environment files, secrets, or production data.
- Add changelog entries for user-visible changes.

## Security-sensitive changes

Changes to detection, policy, deception, isolation, telemetry, or default behaviour require a threat-model update, explicit resource bounds, tests for legitimate and suspicious traffic, false-positive considerations, and documented failure and rollback behaviour.

Never add real secrets or production data to decoys. Do not add infinite loops, unbounded work, token draining, hidden persistence, destructive payloads, unrestricted outbound networking, or retaliation.

## Pull requests

Describe the problem, design, alternatives, tests, compatibility impact, operational risks, and rollback. Link the issue. Never claim a heuristic proves a request came from an AI agent.

See [Definition of Done](docs/DEFINITION_OF_DONE.md) for merge expectations.
