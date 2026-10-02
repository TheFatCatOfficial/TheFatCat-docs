---
layout: default
title: Security & Custody FAQ
parent: FAQ & Limitations
nav_order: 4
---

# Security & Capital Custody FAQ

---

## 1. What happens if the website goes offline?
Your principal does not depend on our website. Staking contracts are fully permissionless and will be publicly verified on BscScan upon mainnet deployment. Follow our [Emergency Exit Guide]({% link guides/emergency-exit.md %}) to redeem your principal directly on-chain via any standard Web3 block explorer or interface.

---

## 2. Can an administrator freeze my principal?
**No.** In [`StakingVault.sol`]({% link contracts.md %}), the `redeem()` function intentionally ignores the contract's `paused` variable. Even during emergency governance pauses, the path that returns your principal can never be obstructed.

---

## 3. Can an administrator or developer rug pull or drain user funds?
**No.** StakingVault and The Belly have zero administrative sweep, extraction, or migration backdoors. The only capital outflow paths are user-initiated principal redemption and the write-once authorized spender's window-capped release (`release()`, mathematically limited to at most 16/168 per interval window). All outflows are strictly bound by the immutable clock and mathematical release formulas.

---

## 4. What authority does the protocol Guardian hold?
The protocol `Guardian` address holds solely defensive powers:
- Ability to trigger an emergency pause on Belly outflows during anomalous market conditions.
- Zero custody of user principal.
- Zero capability to sweep, transfer, or redirect capital to arbitrary addresses.
