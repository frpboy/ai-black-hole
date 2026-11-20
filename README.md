# AI Black Hole

**Deception-as-Code for AI Agents**

AI Black Hole is an open-source application security toolkit with two cooperating parts:

1. **Agent skill**: guides coding agents through repository assessment, threat modelling, safe integration, testing and documentation.
2. **Runtime library**: provides framework-neutral behavioural signals, policy decisions, bounded rate controls, synthetic decoys and security events.

The goal is not to promise that software cannot be reverse-engineered. Client-side code can be inspected. AI Black Hole helps developers reduce exposed attack surface, keep sensitive logic server-side, detect suspicious behaviour, constrain abuse and safely observe reconnaissance.

> Status: early development. APIs and package names are provisional until the first tagged release. Do not treat this repository as a production security certification.

## Design principles

- **Defence first:** authentication, authorization, server-side validation, least privilege and data minimisation come before deception.
- **Behaviour, not identity claims:** signals indicate patterns; they do not prove that a visitor is an AI agent.
- **Safe by default:** monitor-only mode by default; enforcement and deception require explicit configuration.
- **Bounded deception:** synthetic-only data, strict request/session limits, no production data access and no unbounded work.
- **Respect legitimate automation:** provide explicit paths for authorised integrations, monitoring, accessibility tools and developer workflows.
- **Privacy-conscious:** no mandatory telemetry service and no external network calls from the core.
- **Developer-controlled:** explainable decisions, documented changes and an emergency disable switch.

## Repository layout

```text
skills/ai-black-hole/     Agent skill and implementation playbook
packages/core/            Framework-neutral runtime
packages/express/         Express middleware adapter
examples/express-api/     Runnable integration example
docs/                    Architecture, threat model and roadmap
.github/workflows/        CI and CodeQL
```

## Quick start (source checkout)

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm run build
npm test
```

The initial runtime is intentionally small and dependency-free. It currently provides typed request observations, a basic threshold policy and a bounded in-memory rate limiter. Deception primitives are planned and are not implemented yet. The Express adapter is an optional integration.

## Runtime example

```ts
import express from "express";
import { createBlackHole } from "@ai-black-hole/core";
import { blackHoleMiddleware } from "@ai-black-hole/express";

const app = express();
const security = createBlackHole({
  mode: "monitor",
  rateLimit: { windowMs: 60_000, maxRequests: 120 },
});

app.use(blackHoleMiddleware(security));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.listen(3000);
```

See [Getting Started](docs/GETTING_STARTED.md) and [the Express example](examples/express-api/README.md).

## Agent skill

The canonical skill instructions live at [skills/ai-black-hole/SKILL.md](skills/ai-black-hole/SKILL.md). It instructs an agent to inspect first, propose changes, preserve project conventions, integrate only justified controls, test normal and authorised traffic, and report limitations.

Host-specific installation details are maintained in [Skill Installation](docs/SKILL_INSTALLATION.md). Skill compatibility depends on the host agent's supported skill format.

## Security model

Read [the threat model](docs/THREAT_MODEL.md), [security limitations](docs/SECURITY_LIMITATIONS.md) and [SECURITY.md](SECURITY.md) before deployment.

AI Black Hole is not a substitute for a secure application architecture, a WAF, identity controls, secure SDLC practices or professional security review. Never place secrets, real customer records or production credentials in decoy resources.

## Roadmap

See [ROADMAP.md](ROADMAP.md) and the detailed [Development Plan](docs/DEVELOPMENT_PLAN.md). Initial priorities are runtime correctness, safe defaults, tests, a useful Express adapter and an agent skill that can integrate the actual runtime.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), check open issues and discuss large changes before submitting a pull request.

## License

Apache-2.0. See [LICENSE](LICENSE).
