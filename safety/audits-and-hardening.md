---
layout: default
title: Testing & Validation
parent: Security & Governance
nav_order: 2
---

# Testing & Validation

The protocol has undergone extensive internal testing ahead of launch. Internal regression and stateful invariant tests check implementation behavior. They are not an independent audit or a formal proof of all possible executions. Production addresses and explorer verification require a separate official deployment record.

## Current Protections and Test Scope

| Area | Current protection | Internal test scope |
|---|---|---|
| Revenue receipt | Only received revenue is credited; protections limit duplicate processing | Different receipt orders and handling of transfer failures |
| Rounding and liabilities | Rewards round down; pending purchase funds and settled rewards are recorded separately | Sampled claims across positions and meals, and funds covering recorded rewards |
| QQQB-route revenue split | 15% of net proceeds after any Feeder reward goes to project funds; the remainder, including rounding, goes to Belly | Distribution amounts and destinations |
| Oracle pricing | Price reference freshness, average market prices and liquidity checks | Stale price data and insufficient liquidity along the conversion route |

Upstream revenue handling has separate upgrade and emergency transfer powers. These can affect tax revenue before it reaches Belly and are not withdrawal powers over users' staked principal. See [Custody Boundaries]({% link safety/custody.md %}) for the distinction between upstream revenue and staking principal.

Rounding tests sample specific position counts, batch counts and claim schedules. They do not establish one residual limit for every possible use. Multiple rounding stages and smaller-range claims can leave small balances; see [Custody]({% link safety/custody.md %}) for how funds and rewards are kept separate.

Test evidence applies to the tested source revision and model. It does not by itself establish the deployed addresses, production monitoring availability, all external token behavior or a guaranteed recovery time.
