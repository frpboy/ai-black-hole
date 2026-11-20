# AI Black Hole

**Deception-as-Code for AI Agents**

AI Black Hole is an open-source application security toolkit with two cooperating parts:

1. **Agent skill:** guides coding agents through repository assessment, threat modelling, safe integration, testing, and documentation.
2. **Runtime library:** provides framework-neutral request observations, explainable policy decisions, bounded rate controls, security events, and opt-in bounded deception primitives (synthetic decoys and canary identifiers) adapted from [BLA](https://github.com/qybaihe/bla) (MIT, see [NOTICE](NOTICE) and [docs/BLA_ADAPTATION.md](docs/BLA_ADAPTATION.md)).

The goal is not to promise that software cannot be reverse-engineered. Client-side code can be inspected. AI Black Hole helps developers reduce exposed attack surface, keep sensitive logic server-side, detect suspicious behaviour, constrain abuse, and safely observe reconnaissance.

> Status: early development. APIs and package names are provisional until the first tagged release. Do not treat this repository as a production security certification.

## Design principles

- **Defence first:** authentication, authorization, server-side validation, least privilege, and data minimisation come before deception.
- **Behaviour, not identity claims:** signals indicate patterns; they do not prove that a visitor is an AI agent.
- **Safe by default:** monitor-only mode by default; enforcement and future deception features require explicit configuration.
- **Bounded deception:** future decoys must use synthetic-only data, strict request/session limits, no production data access, and no unbounded work.
- **Respect legitimate automation:** provide explicit paths for authorised integrations, monitoring, accessibility tools, and developer workflows.
- **Privacy-conscious:** no mandatory telemetry service and no external network calls from the core.
- **Developer-controlled:** explainable decisions, documented changes, and an emergency disable switch.

## Repository layout

```text
skills/ai-black-hole/     Agent skill and implementation playbook
packages/core/            Framework-neutral runtime
packages/express/         Express middleware adapter
examples/express-api/     Runnable integration example
docs/                    Architecture, threat model, contributor and release guides
.github/                  Issue templates, PR template, workflows, CODEOWNERS
```

## Quick start (source checkout)

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run check
```

The runtime is intentionally small. It currently provides typed request observations, a basic threshold policy, a bounded in-memory rate limiter, and opt-in bounded deception primitives. The in-memory limiter is process-local and is not a distributed rate limiter. Deception is disabled unless explicitly enabled, stays synthetic-only, and never runs while the runtime mode is `off`. The Express adapter is an optional integration.

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

Opt-in deception adds synthetic decoy routes and canary identifiers. In `enforce` mode the adapter serves the synthetic body; in `monitor` mode access is only observed.

```ts
const security = createBlackHole({
  mode: "enforce",
  deception: {
    enabled: true,
    decoys: [
      {
        path: "/api/internal/metrics",
        body: JSON.stringify({ data: [], synthetic: true }),
        maxRequestsPerClient: 25,
      },
    ],
    canary: { ttlMs: 86_400_000 },
  },
});

// Embed security.getCanary()?.path where only an automated crawler would
// follow it (for example a disallowed path in robots.txt). Requests carrying
// the token emit a canary.triggered event.
```

Decoy bodies must be synthetic and are size-bounded; every decoy has a finite lifetime (default 24 hours) and per-client response budgets are enforced. Matching requests emit security events; events record the request path, so do not place sensitive data in paths. See [Safe Deception Patterns](skills/ai-black-hole/references/deception-patterns.md).

See [Getting Started](docs/GETTING_STARTED.md) and [the Express example](examples/express-api/README.md).

## Agent skill

The canonical skill instructions live at [skills/ai-black-hole/SKILL.md](skills/ai-black-hole/SKILL.md). It instructs an agent to inspect first, propose changes, preserve project conventions, integrate only justified controls, test normal and authorised traffic, and report limitations.

Host-specific installation details are maintained in [Skill Installation](docs/SKILL_INSTALLATION.md). Skill compatibility depends on the host agent's supported skill format.

## Security model

Read [the threat model](docs/THREAT_MODEL.md), [security limitations](docs/SECURITY_LIMITATIONS.md), [observability and privacy guidance](docs/OBSERVABILITY_AND_PRIVACY.md), and [SECURITY.md](SECURITY.md) before deployment.

AI Black Hole is not a substitute for a secure application architecture, a WAF, identity controls, secure SDLC practices, or professional security review. Never place secrets, real customer records, or production credentials in decoy resources.

## Roadmap

See [ROADMAP.md](ROADMAP.md) and the detailed [Development Plan](docs/DEVELOPMENT_PLAN.md). Initial priorities are runtime correctness, safe defaults, tests, a useful Express adapter, and an agent skill that can integrate the actual runtime.

## Contributing

Contributions are welcome. Start with the [Contributor Onboarding Guide](docs/CONTRIBUTOR_ONBOARDING.md), then read [CONTRIBUTING.md](CONTRIBUTING.md), the [Community Guide](docs/COMMUNITY.md), and [Definition of Done](docs/DEFINITION_OF_DONE.md). Browse [good first issues](https://github.com/frpboy/ai-black-hole/labels/good%20first%20issue) and open issues before starting substantial work.

## Project policies

- [Governance](GOVERNANCE.md)
- [Maintainer handbook](MAINTAINERS.md)
- [Support](SUPPORT.md)
- [Security policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Compatibility policy](docs/COMPATIBILITY.md)
- [Release process](docs/RELEASING.md)

## License

Apache-2.0. See [LICENSE](LICENSE).
