---
layout: default
title: Meals & Seniority Ladder
parent: Core Mechanics
nav_order: 2
---

# Meals and the Seniority Ladder

Meals determine when reward shares are recorded; seniority determines a position's allocation weight. They work together, but a seniority multiplier is not a return multiplier.

## 1. When a Position Joins

Every stake creates an independent position with its own principal, diet and seniority. A new position does not participate in the meal already underway. It activates at **Notch 1 (1.0×)** when the next meal begins.

After activation, each completed active meal adds one notch, up to 22. Advances are at least eight hours apart. Under the standard cadence, climbing from Notch 1 to Notch 22 takes 21 completed meals, about seven days. Maintenance delays can extend this time.

![Position Activation and the Seniority Ladder]({{ '/assets/images/fig3-graduation-ring.svg' | relative_url }}?v=20261010u1)

## 2. Seniority and Relative Weight

A position's allocation weight is:

**Position weight = staked principal × current seniority multiplier**

At equal principal, a Notch 22 position has 22 times the weight of a Notch 1 position. At equal seniority, ten times the principal gives ten times the weight. Actual rewards also depend on protocol revenue, other positions' aggregate weight and settlement. A 22× weight does not promise a fixed 22× return.

![Seniority Relative Advantage Scenarios]({{ '/assets/images/fig4-seniority-premium.svg' | relative_url }}?v=20261010u1)

Relative advantage also changes with the seniority distribution. If most other positions approach the cap, a fully mature position's advantage over the average becomes smaller. New staking can dilute existing positions' allocation shares.

## 3. How Rewards Remain Recorded

At each meal's close, the protocol records eligible position shares. Purchases or fallback settlement then turn those shares into claimable rewards. An advanced meal does not necessarily have rewards ready to claim.

Historical settled rewards have no protocol expiry, and changing diets does not erase them. Long unclaimed histories may require several transactions. See [Diets & Claiming]({% link guides/diets-and-claiming.md %}).

## 4. Exit and Forfeiture

Ordinary redemption returns principal to the position owner without waiting for meal advancement. Exiting forfeits only the unsettled share of the currently open meal; previously earned rewards remain recorded with no protocol expiry.

Forfeited shares follow that meal's asset settlement rules; they do not universally roll into the next meal. Exiting ends the position's future participation and seniority. Staking again requires a new position starting at Notch 1.
