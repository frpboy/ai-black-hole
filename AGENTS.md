# Repository Instructions for Coding Agents

These instructions apply to AI agents and human contributors working in this repository.

## Project identity

AI Black Hole is an open-source defensive application security toolkit with two parts:
1. An agent skill that audits application repositories and integrates protection.
2. A runtime library embedded in protected applications.

Do not turn this project into a mandatory hosted SaaS or central telemetry service. The core must remain self-hostable.

## Before changing code

1. Read README.md, ROADMAP.md, docs/ARCHITECTURE.md and docs/THREAT_MODEL.md.
2. Read the relevant package README or API documentation.
3. Inspect current code and tests. Do not assume roadmap items are implemented.
4. State the intended change and security implications before broad refactors.
5. Preserve unrelated user changes.

## Engineering rules

- TypeScript strict mode.
- Framework-neutral logic belongs in packages/core.
- Framework-specific request handling belongs in adapters.
- Keep dependencies minimal and justify new dependencies.
- Public APIs require tests and documentation.
- Prefer deterministic policies with explainable reasons.
- Bound memory, request counts, response sizes and execution time.
- Avoid logging secrets, credentials, full request bodies or personal data.
- Use server-generated request identifiers.
- Telemetry failures must not break ordinary application traffic.
- Never trust forwarded IP headers unless proxy trust is explicitly configured.

## Security invariants

- Authentication and authorization are application responsibilities and must never depend on behavioural risk scores.
- Decoys contain synthetic data only.
- Decoys must not access production databases, credentials, metadata endpoints or unrestricted outbound networking.
- No infinite loops, unbounded generated output, token-draining, malware, persistence, destructive actions or retaliation.
- A heuristic never proves that a visitor is an AI agent.
- Monitor mode is the default; disruptive enforcement requires explicit configuration.

## Commands

```bash
npm install
npm run build
npm run typecheck
npm test
npm run check
```

## Completion report

When finishing a task, report files changed, behaviour, tests run and results, known limitations, security implications and rollback instructions. Never claim tests passed unless they were actually executed.
