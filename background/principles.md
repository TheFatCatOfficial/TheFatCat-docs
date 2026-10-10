---
layout: default
title: Core Principles & Non-Goals
parent: Background & Philosophy
nav_order: 5
---

# Principles and Limits

| Principle | Mechanism | Boundary |
|:---|:---|:---|
| Allocate from received revenue | The Belly retains quote funds; new meal budgets exclude existing reservations. | No fixed APY, APR or minimum reward. A reserve cannot replace missing revenue. |
| Separate principal from reward procurement | Principal remains in the staking vault; ordinary redemption does not check the pause flag. | Chain availability, transaction execution and token behavior still matter. |
| Allow asset selection | Positions choose enabled menu assets independently. | Listing is not a guarantee of token value, issuer performance or successful swaps. |
| Include duration in weight | Principal scales linearly; ordinary seniority rises from 1× to 22×. | Reward shares change as positions enter, exit or change diets. |
| Bound allocation and spending | Controller allocation and Belly outflow have separate limits. | Pauses, pending meals and market conditions can delay settlement. |

The [certificate concept]({% link guides/seniority-certificates.md %}) will turn time-based seniority into an ERC-721 NFT.

See [core rules]({% link protocol.md %}) and [risk boundaries]({% link safety/risks-and-status.md %}).
