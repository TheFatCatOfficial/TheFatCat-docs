---
layout: default
title: Seniority Ledger & Math
parent: Verified Contracts
nav_order: 3
---

# Seniority Ledger & State Accounting Contracts

The mathematical engine of TheFatCat provides $O(1)$ constant-gas scalar weight accounting, discrete graduation tracking, and solvency distribution:

---

## 1. Seniority Ledger (`SeniorityLedger.sol`)

- **Architectural Scope**: Calculates aggregate effective weights for each active meal across all diet pools.
- **Key Invariants**:
  - **$O(1)$ Closed-Form Decomposition**: Partitions stakers into climbing and mature cohorts:
    $$W(m) = (1 + m) P_{\text{climb}} - J_{\text{climb}} + 22 P_{\text{settled}} + W_{\text{exiting}} - H_{\text{opening}}$$

    Here $j_i$ is the weight reference `effectiveFrom`; eligibility starts only at `activeFrom`. $H_{\text{opening}}$ is the Ledger's `headOpening` correction that removes opening-meal weight before a position is eligible. Ordinary positions have `effectiveFrom = activeFrom` and zero opening correction.

  - **22-Slot Circular Graduation Ring**: Rotates per interval to graduate mature positions without loops.
  - **Zero Add-Principal / Position Merging**: Mature positions cannot absorb fresh capital, preventing seniority laundering exploits.

---

## 2. Reward Distributor (`RewardDistributor.sol`)

- **Architectural Scope**: Dual-liability accounting and individual claim disbursement.
- **Key Invariants**:
  - **RAY-Precision Accumulators**: Employs $\text{RAY} = 10^{27}$ fixed-point arithmetic for double-prefix accumulators ($A_{a, m}, B_{a, m}$).
  - **Non-Negative Dust Solvency**: Downward integer truncation guarantees total claims strictly never exceed available assets:
    $$\sum r_i \le R_{\text{available}}$$
  - **Single-Transaction Native BNB**: Includes `claimNative()` to unwrap WBNB to native BNB natively on-chain.

---

## 3. Time-Seniority Certificate & Renderer

- **SeniorityCertificate (`SeniorityCertificate.sol`)**: ERC-721 credential contract minted via burning FATCAT upon position exit, with hardcoded 5% ERC-2981 royalty signaling. Actual BNB/WBNB payments can be flushed to The Belly via `CertificateRevenueVault.sol`.
- **CertificateData (`CertificateData.sol`)**: On-chain raw font bytecode and portrait vector graphics asset store in the separate certificate subsystem.
- **CertificateRenderer (`SeniorityCertificateRenderer.sol`)**: Pure on-chain SVG renderer producing deterministic visual badge layers with zero external IPFS or HTTP dependencies.


## Sustainable menu lifecycle

Active menu capacity and FEED batches are governed separately; archived assets leave settlement loops while their historical index, final snapshots and reward liabilities remain. See the [menu lifecycle and limits]({% link protocol/execution.md %}).
