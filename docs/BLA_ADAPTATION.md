# BLA Adaptation Notes

AI Black Hole's controlled deception primitives (roadmap M3) adapt design
concepts from [BLA (Blind LLM Agents)](https://github.com/qybaihe/bla) by
qybaihe, an MIT-licensed counter-reverse-engineering toolkit. BLA is MIT
licensed, which is compatible with this project's Apache-2.0 license; the BLA
copyright notice and license text are preserved in [NOTICE](../NOTICE).

BLA protects *build artifacts* (ASAR, WASM, SQLite, model files, native
binaries) against AI reverse-engineering agents at rest. AI Black Hole
protects *running applications* at the HTTP request layer. The adaptation
ports the defensive ideas across that boundary rather than copying BLA's
format-specific code.

## What was adapted

| BLA concept | AI Black Hole adaptation |
| --- | --- |
| Poison: format-valid canaries planted for analysis agents | Canary identifiers: random, rotatable, expiring tokens whose appearance in a request path emits a `canary.triggered` event |
| Poison: plausible synthetic decoy payloads | Synthetic decoy registry: configured routes that serve fabricated responses and emit `decoy.accessed` events |
| Exhaust: tripping analyzer resource budgets | Bounded per-client decoy response budgets; once exhausted, the decoy stops answering (404 in the Express adapter) |
| Runtime-equivalence and verification gates | Startup validation of every decoy definition plus unit tests for serve, observe, expiry, budget and rotation behaviour |

## What was deliberately not adapted

BLA's headline goal is making AI analysis expensive ("Poison → Exhaust →
Hallucinate"). AI Black Hole's documented non-goals forbid attacking or
exhausting another agent or provider, so the following were excluded:

- **Token/cost exhaustion and response amplification.** No tarpits, no
  unbounded generated content, no loops. Every decoy has a fixed synthetic
  body (default cap 16 KiB) and a per-client response budget (default 25).
- **Format artifact shields** (ASAR/WASM/SQLite/GGUF/PE/DEX hardening). These
  protect artifacts at rest and are out of scope for a request-layer runtime.
- **MCP server, CLI and bundler plugins.** BLA's delivery mechanisms do not
  match this project's library-plus-skill shape.
- **Entangle/self-seal runtime binding.** Artifact integrity techniques, not
  applicable to HTTP request handling.

## Safety boundaries kept

- Deception is opt-in (`deception.enabled`) and never active in `off` mode;
  monitor mode only observes.
- Decoys serve synthetic data only, never proxy production services, access
  databases, or make outbound network calls.
- All memory (decoy count, body bytes, per-client counters, active canaries)
  is bounded; canaries rotate and expire.
- Decoy access never proves a visitor is an AI agent; events are signals.

## Source

- Upstream: https://github.com/qybaihe/bla (observed 2026-11-20, v3.5.2,
  MIT License, copyright 2026 BLA Contributors)
- Adapted into: `packages/core/src/deception.ts`,
  `packages/core/src/index.ts`, `packages/express/src/index.ts`
