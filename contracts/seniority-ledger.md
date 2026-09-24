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
    $$W(m) = (1 + m) P_{\text{climb}} - J_{\text{climb}} + 22 P_{\text{settled}} + W_{\text{exiting}}$$
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

- **SeniorityCertificate (`SeniorityCertificate.sol`)**: ERC-721 credential contract minted via burning FATCAT upon position exit, with hardcoded 5% ERC-2981 royalties routed to The Belly via `CertificateRevenueVault.sol`.
- **CertificateData (`CertificateData.sol`)**: On-chain raw font bytecode and portrait vector graphics asset store deployed at genesis.
- **CertificateRenderer (`SeniorityCertificateRenderer.sol`)**: Pure on-chain SVG renderer producing deterministic visual badge layers with zero external IPFS or HTTP dependencies.
