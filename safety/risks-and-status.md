---
layout: default
title: Risks & Operating Conditions
parent: Security & Governance
nav_order: 4
---

# Risks & Operating Conditions

## 1. Network and Opening Rules

- **Network**: BNB Chain (Chain ID: 56).
- **Initial launch venue**: Flap bonding curve, paired with QQQB; reward accounting uses WBNB.
- **Staking opening**: Staking will open immediately after token graduation; the seven-day reward warmup begins when staking opens.
- **Reward warmup**: During the first seven days after opening, intervals and seniority advance without reward allocations. Revenue successfully delivered to Belly can accumulate as reserves.
- **Reward outflow authorization**: Initial reward outflow authorization has a separate seven-day delay. This clock is independent of the reward warmup, so the two gates need not open together.

Before interacting, use a separately published official deployment record to verify addresses, explorer source, network and on-chain state.

## 2. Material Risks

### Market Volume and Variable Rewards

The protocol does not promise fixed yield. Reward funding comes from trading-tax proceeds and voluntary payments received by the protocol. Lower market volume can reduce inflows; the reservoir cannot create new yield when trading stops.

### Upstream Authority and External Tokens

Flap tax processing and the QQQB revenue route are external dependencies. Upgrades, configuration changes or emergency transfers of upstream funds can change reward delivery. These permissions do not grant withdrawal access to the user's principal vault.

The upstream service can also submit staking, redemption, diet changes and claims on users' behalf. Upgrades may change that delegated behavior without replacing the core contracts' code. Ordinary redemption and claims still pay the position owner; new staking requires the user's balance and valid authorization. This dependency therefore extends beyond tax processing.

The current integration trusts QQQB issuer authority. Transfer restrictions, issuer or implementation changes, and unavailable liquidity can affect conversion. See [Custody Boundaries]({% link safety/custody.md %}).

### Procurement and Settlement Delays

Reward procurement depends on available oracle observations, liquidity and slippage checks. Settlement prioritizes the globally oldest pending meal; a waiting asset can delay newer meals, while other assets in that oldest meal may still be processed. Rewards already settled in the Distributor remain claimable, and principal redemption is separate from procurement.

Eligible pending quote can be settled through the WBNB fallback and claimed as native BNB. Eligibility depends on the route's pending-age limit, disabled or parked status, or an allocation exceeding the purchase ceiling. Becoming eligible does not execute a payment: a caller must submit the settlement, and Belly's pause state, available funds and eight-hour outflow cap still apply. The complete oldest-meal allocation for that asset must fit the available window. There is **no guarantee of payment one day after a failed purchase** or of a fixed maximum wait.

Parking preserves an asset's weights and allocation eligibility. Automatic maintenance prefers WBNB fallback without the age wait, while ordinary purchases may still complete. Parking lasts until lifted, and lifting it cannot reverse settled rewards. See [execution and menu rules]({% link protocol/execution.md %}).

### Third-Party Tokenized Assets

Tokenized equities and similar assets are issued and custodied by third parties; they are not direct shares in the underlying companies. They carry issuer default, transfer or trading restrictions, and regulatory risks.

Newly enabled assets are capped at 5% of an interval's allocation during a seven-day probation period. The initial menu is exempt on its initial enable; later re-enabling restores ordinary probation. After probation, 5% is not a permanent per-asset exposure cap. Fallback covers eligible pending procurement amounts, not a guaranteed recovery of already acquired tokens or their market value.
