---
layout: default
title: Allocation Design Choices
parent: Background & Philosophy
nav_order: 1
---

# Allocation Design Choices

TheFatCat uses three mechanisms to organize trading-tax revenue:

| Design question | Choice | Limit |
|:---|:---|:---|
| How should irregular revenue be allocated? | Hold quote funds in the Belly and allocate a fraction of unreserved funds per meal. | A reserve spreads existing revenue across meals; it does not create income or guarantee payout stability. |
| Which asset should users receive? | Each position selects an enabled menu asset. Procurement is separate from allocation. | Settlement depends on asset eligibility, liquidity, oracle checks and fallback conditions. |
| How should duration affect shares? | Multiply principal by a seniority coefficient, rising from 1× to 22× for an ordinary continuing position. | New capital can still reduce existing participants' percentage shares. Duration does not fix a position's reward amount. |

New ordinary positions start participating in the next meal. Position exits and diet changes follow explicit boundaries rather than claiming the opening meal's allocation immediately.

See [Belly allocation]({% link protocol/belly.md %}), [meal and seniority rules]({% link protocol/meals-and-seniority.md %}) and [execution]({% link protocol/execution.md %}) for the formulas and conditions.
