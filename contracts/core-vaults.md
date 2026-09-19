---
layout: default
title: Core Vault Contracts
parent: Verified Contracts
nav_order: 1
---

# Core Protocol Vault Contracts

The core storage and capital custody layers of TheFatCat enforce strict physical separation between principal capital and reward distributions:

---

## 1. StakingVault (`StakingVault.sol`)

- **Architectural Role**: Holds 100% of user-staked FATCAT tokens.
- **Key Invariants**:
  - **Zero Tax Inflow**: No trading tax or DEX swap funds ever enter this contract.
  - **100,000 FATCAT Floor**: Positions below the threshold are rejected, preventing dust griefing.
  - **Unpausable Redemptions**: The `redeem()` function deliberately ignores contract emergency pause flags. Users can always withdraw their capital regardless of protocol status.
  - **Zero Sweep Privilege**: Does not contain `sweepToken()`, `emergencyWithdraw()`, or any administrative backdoors.

---

## 2. The Belly Reservoir (`Belly.sol`)

- **Architectural Role**: Custodies quote assets (WBNB) generated from DEX trading taxes.
- **Key Invariants**:
  - **Unprivileged Shock Absorber**: No administrator can arbitrarily withdraw or alter funds.
  - **7-Window Outflow Throttle**: In any single 8-hour window, cumulative outflows are strictly capped at:
    $$\text{Window Cap} = \text{Balance} \times \frac{16}{168} \approx 9.5238\%$$
    Draining 50% of the reservoir requires at least 7 discrete intervals (48–56 hours), ensuring sufficient time for emergency response.
  - **Discrete Interval Releases**: Releases are triggered strictly by authorized `IntervalController` clock advances.

---

## 3. Forwarding Vault (`ForwardingVault.sol`)

- **Architectural Role**: Intermediate atomic tax router receiving liquidated WBNB from the Flap processor.
- **Key Invariants**:
  - **Atomic Split**: In the exact transaction funds arrive:
    - $5/36$ (~0.5% of trade volume) is forwarded to Protocol Operations.
    - $31/36$ + floor remainder (~3.1% of trade volume) is deposited directly into The Belly.
  - **Zero Balance Retention**: The contract holds zero persistent balances between transactions.
