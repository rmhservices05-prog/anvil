# ANVIL

ANVIL is a frontend-only prototype for a contested-spectrum validation console. It is designed to feel like a serious internal mission system for simulated Lineage / DQSP exercises, with deterministic mock state, no backend, and no real APIs.

## Stack

- React
- TypeScript
- Tailwind CSS
- Recharts

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Screens

- Overview: mission trust strip, live attack pressure chart, protocol comparison, attack log, and guardrails.
- Live Exercise: scenario canvas, timeline scrubber, attack controls, and outcome matrix.
- Attack Forge: adversary profile and attack primitive builder.
- Lineage Graph: epoch branches, verified state, stale/rejected branches, and recovery branch.
- Guardrails: fail-secure mission rules and last-known-good policy behavior.
- Protocol Analysis: engineering comparisons under mixed attacks.
- Evidence Pack: export-ready summary with scenario metadata and verdicts.
