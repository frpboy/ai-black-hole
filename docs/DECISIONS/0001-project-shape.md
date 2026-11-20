# ADR 0001: Project Shape

- Status: Accepted
- Date: 2026-11-20

## Context

The project needs both an implementation workflow for coding agents and reusable protections that execute inside applications. A dashboard-only or hosted-SaaS-first product would not deliver the core value.

## Decision

Build a monorepo containing:
1. an agent-neutral skill with host-specific packaging adapters;
2. a self-hosted, framework-neutral runtime core;
3. framework adapters and examples;
4. documentation, tests and release automation.

The initial runtime language is TypeScript. The first framework target is Express, followed by NestJS. Other languages and platforms are future integrations, not implied current support.

## Consequences

- Skill and runtime can be versioned and tested together.
- Developers can use the runtime without a coding agent.
- Developers can use the skill with supported agent hosts.
- Framework adapters must not leak framework dependencies into core.
- No mandatory central control plane or telemetry service is required.
- Public APIs remain provisional until a stable release.
