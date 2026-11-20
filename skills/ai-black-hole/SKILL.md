---
name: ai-black-hole
description: Audit an application repository and safely integrate AI Black Hole runtime protections, behavioural detection and bounded deception. Use when a developer asks to protect an application against automated reconnaissance, scraping, suspicious automation or reverse-engineering attempts.
---

# AI Black Hole Skill

You are implementing defensive application security for the repository the user asked you to modify. AI Black Hole consists of this development-time skill and a runtime library. The skill does not protect a deployed application until suitable runtime controls are integrated and deployed.

## Non-negotiable safety rules

- Work only on repositories and systems the user owns or is authorised to modify.
- Never add malware, persistence, destructive payloads, credential theft, hidden remote access or retaliation.
- Never create infinite loops, unbounded work, token-draining behaviour or external cost attacks.
- Decoys contain synthetic data only. They must not connect to production databases, secrets, metadata services or unrestricted outbound networks.
- Every decoy has explicit request, time, response-size and memory limits appropriate to its host.
- Never claim a heuristic proves a client is an AI agent.
- Do not disrupt legitimate users, accessibility tools, monitoring or authorised integrations merely because they are automated.
- Do not weaken authentication, authorization, CSRF protections, validation or existing security controls.
- Never expose secrets in source code, client bundles, logs, examples or decoy responses.

## Workflow

### 1. Discover before editing

Inspect language, framework, package manager, repository instructions, application entry points, middleware, routes, authentication and authorization, reverse-proxy configuration, sensitive business logic, data access boundaries, client bundles, source maps, debug routes, existing rate limits and tests. Do not assume Node.js. Do not install packages until framework and version are confirmed.

### 2. Produce an evidence-based audit

Classify findings as Critical, High, Medium or Low. For each finding provide exact file/line or route evidence, impact, confidence, recommended fix and scope. Separate confirmed findings from hypotheses. Do not invent findings.

### 3. Establish the security boundary

Prioritise server-side authorization on every sensitive object and action, keeping secrets and sensitive logic server-side, data minimisation, authentication, validation, quotas and rate limits. Behavioural monitoring and deception come after these controls. Obfuscation and User-Agent checks are not security boundaries.

### 4. Plan before implementation

Present files to change, packages, behaviour changes, compatibility concerns, tests, rollback steps and unresolved questions. Wait for approval before high-impact changes, broad refactors or disruptive enforcement. Follow repository-specific instructions and preserve unrelated user changes.

### 5. Integrate runtime protections

Use official project packages and verified documentation. If packages are unpublished or unsupported for the target framework, do not invent an API and claim it exists. Start in monitor mode. Configure trusted proxies explicitly. Keep policy deterministic and explainable. Authentication and authorization remain independent of behavioural scores.

### 6. Add deception only when justified

Possible mechanisms: synthetic decoy routes, canary identifiers without secrets or personal data, fake resource references served from isolated handlers, and bounded response sequences. Verify synthetic-only content, no production DB/secret access, no internal network access, finite request/session budgets, bounded response sizes and execution time, expiry and emergency disable. Do not place decoys where ordinary users or crawlers will routinely trigger them without an explicit reason.

### 7. Test

Test ordinary journeys, authorised service accounts, suspicious patterns, allow/observe/throttle/deny decisions, rate-limit boundaries, decoy isolation and expiry, telemetry redaction and false positives. Run tests, type checks, lint and build commands. Report failures honestly.

### 8. Report

Summarise findings and evidence, files changed, packages and configuration, controls enabled and current mode, tests and results, known limitations, residual risks, deployment and rollback. Never say an application is fully protected or impossible to reverse engineer. State exactly what was implemented and verified.
