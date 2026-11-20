# Contributor onboarding

Welcome! This guide is the shortest route from first-time contributor to a useful merged change.

## 1. Understand the project

Read, in order:
1. [README](../README.md)
2. [Architecture](ARCHITECTURE.md)
3. [Threat model](THREAT_MODEL.md)
4. [Security limitations](SECURITY_LIMITATIONS.md)
5. [Development plan](DEVELOPMENT_PLAN.md)
6. [Contributing guide](../CONTRIBUTING.md)

AI Black Hole combines an agent skill with an embeddable runtime. The current runtime is an early foundation; roadmap items are not automatically implemented.

## 2. Choose work

- Start with issues labelled `good first issue` or `help wanted`.
- Comment that you want to work on an issue before spending significant time.
- Ask questions early if acceptance criteria are unclear.
- For a new feature, open a proposal before creating a large implementation.

## 3. Set up locally

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/frpboy/ai-black-hole.git
cd ai-black-hole
npm install
npm run check
```

Create a branch:

```bash
git switch -c feat/short-description
```

## 4. Make a focused change

- Keep framework-neutral code in `packages/core`.
- Keep framework integration in the relevant adapter package.
- Add tests for new behaviour and regression cases.
- Update docs and examples when public behaviour changes.
- Keep resource use bounded and errors explainable.
- Avoid unrelated formatting or refactoring.

## 5. Validate and submit

```bash
npm run check
```

Then push your branch and open a pull request against `main`. Complete the pull-request template, link the issue, explain security implications, and include exact commands and results. Never say tests passed unless you ran them.

## 6. Security rules

Never commit secrets, production data, real user data, or real credentials. Decoys must be synthetic and isolated. Do not add infinite loops, unbounded work, token draining, destructive payloads, persistence, retaliation, or unrestricted outbound network access. Behavioural heuristics are signals, not proof that a visitor is an AI agent.

For vulnerability reports, use the private process in [SECURITY.md](../SECURITY.md), not a public issue.

## Good first contributions

Documentation corrections, deterministic unit tests, edge-case coverage, examples using synthetic data, and small framework-neutral utilities are excellent starting points. Ask before taking on a broad redesign.
