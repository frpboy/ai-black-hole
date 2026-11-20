# Contributing

Thanks for helping improve AI Black Hole.

New contributors: start with the [Contributor Onboarding Guide](docs/CONTRIBUTOR_ONBOARDING.md). The [issue triage guide](docs/ISSUE_TRIAGE.md) explains how work is selected and scoped.

## Before opening a pull request

1. Search existing issues and pull requests.
2. Discuss substantial design changes in an issue first.
3. Keep changes focused and explain the security problem being solved.
4. Add or update tests and documentation.
5. Run `npm install` and `npm run check`.

## Security-sensitive changes

Changes to detection, policy, deception, isolation, telemetry or default behaviour require a threat-model update, explicit resource bounds, tests for legitimate and suspicious traffic, false-positive considerations, and documented failure and rollback behaviour.

Never add real secrets or production data to decoys. Do not add infinite loops, unbounded work, hidden persistence, destructive payloads or external cost-generation behaviour.

## Pull requests

Describe the problem, design, alternatives, tests, compatibility impact and operational risks. Never claim a heuristic proves a request came from an AI agent.
