---
layout: default
title: Core Vault Contracts
parent: Verified Contracts
nav_order: 1
---

# Core Protocol Vault Contracts

The core storage and capital custody layers of TheFatCat enforce strict contract-level separation between principal capital and reward distributions:

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
  - **Authorized Spender Outflows**: Outflows can only leave The Belly via `release(amount)`, callable exclusively by the single write-once authorized `spender` ([`ExecutionRouter`]({% link contracts.md %})). `IntervalController` acts purely as a clock and quota accounting engine and never calls Belly directly.

---

## 3. QQQB Revenue Infrastructure

- **`FatCatQqqbVaultFactory`**: The Flap entry Factory receives a separately deployed upstream implementation, creates the Beacon and QQQB Vault proxies, and deploys a fixed downstream BNB receiver. It declares QQQB as the launch quote; Belly and the reward core are independently deployed contracts, not aliases for the Factory address.
- **`FatCatQqqbVault`**: Receives protocol QQQB, executes the fixed QQQB → USDT → WBNB path with on-chain price, amount and capacity checks, and forwards conversion proceeds to the configured receiver. Public callers do not supply or approve their own QQQB and cannot redirect the proceeds. Governor and Flap Guardian may adjust the conversion limit, bucket capacity and refill rate via `setConversionLimit(newLimit)` (minimum 10 QQQB).
- **`FatCatMaintenanceRewards`**: Holds the 0.1% gross-WBNB bounty earned by an eligible conversion caller until that caller claims it. This per-Vault module is not upgraded through the Beacon.
- **`FatCatStakingVault`**: The fixed-implementation BNB receiver processes the conversion output in the same transaction. Its `flush()` wraps the remaining BNB into WBNB and sends 3/19 to Ops and 16/19 to Belly. Integer dust stays with Belly. It performs the only operations split; neither this receiver nor the reward core is upgraded through the upstream Beacon.

### Beacon Ownership and Upgrade Authority

The Factory owns the Beacon, but only the canonical Flap Guardian can call Factory `upgradeVaultImplementation(address)` or `lockVaultUpgrades()`. `beaconImplementation()` reports the current implementation; `isVaultUpgradesLocked()` reports whether upgrades were permanently disabled. The deployer and project multisig have no upgrade authority through these entrypoints.

Deployment leaves upgrades available. **Calling the permanent lock is irreversible.** Until locked, a Guardian upgrade can change the behavior of every upstream QQQB Vault under this Factory, including how unconverted assets are handled. It cannot upgrade the fixed receiver, Belly or staking principal contracts. Switching implementation code back does not undo transactions or guarantee storage repair. See [Monitoring and Pause Scope]({% link safety/monitoring.md %}).
