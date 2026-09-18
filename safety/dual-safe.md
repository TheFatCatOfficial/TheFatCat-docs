---
title: Dual Safe Architecture
parent: Security & Governance
nav_order: 1
---

# Dual Safe Architecture & Role Separation

How TheFatCat enforces a strict separation of powers between protocol governance and operating revenue custody using two isolated 2-of-3 Gnosis Safe multi-sigs.

---

## 1. The Separation of Church and State

In many DeFi exploits, the operations wallet that pays hosting bills is granted broad administrative rights over user funds, creating a single point of failure.

TheFatCat enforces a complete, physical separation between **Governance (Protocol Oversight)** and **Operations (Revenue Receipt)**:

```
                          ┌───────────────────────────┐
                          │    Forwarding Vault       │
                          └──────┬─────────────┬──────┘
                                 │             │
                    31/36 Split  │             │  5/36 Split
                                 ▼             ▼
              ┌──────────────────────┐     ┌──────────────────────┐
              │      The Belly       │     │       Ops Safe       │
              │   (Reward Reservoir) │     │ (Operations Multi-Sig│
              └──────────┬───────────┘     │       2-of-3)        │
                         │                 └──────────────────────┘
                         ▲                    Zero Admin Powers!
                         │ Pause / Unpause
              ┌──────────┴───────────┐
              │    Governor Safe     │
              │ (Governance Multi-Sig│
              │       2-of-3)        │
              └──────────────────────┘
```

---

## 2. Multi-Sig Role Matrix

The table below contrasts the permissions and capabilities of the two Safes:

| Property / Authority | Governor Safe (Salt Nonce 1) | Ops Safe (Salt Nonce 2) |
|:---|:---|:---|
| **Multi-Sig Configuration** | 2-of-3 Gnosis Safe | 2-of-3 Gnosis Safe |
| **Primary Responsibility** | Protocol security, pause controls, and timelocked activations | Receiving 5/36 operational revenue stream |
| **Emergency Pause Authority** | Yes (Can pause The Belly outflow alongside Guardian) | **No** (Zero pause authority) |
| **Unpause Authority** | **Yes** (Exclusive right to unpause The Belly) | **No** |
| **Spender Activation** | Yes (One-time delayed activation of `ExecutionRouter`) | **No** |
| **Principal Withdrawal** | **No** (Mathematically impossible) | **No** (Mathematically impossible) |
| **Administrative Sweeps** | **No** (No sweep functions exist) | **No** |
| **Protocol Revenue Receipt** | None | Receives $5/36$ (~0.5%) of tax |

---

## 3. The Unprivileged Guarantee

Neither multi-sig has the power to compromise user funds:
1. **No Admin Withdrawals**: Neither the `Governor Safe` nor the `Ops Safe` possesses any method to withdraw staked FATCAT from `StakingVault.sol` or drain unallocated WBNB from `Belly.sol`.
2. **Immutable Spender**: Once the `ExecutionRouter` is activated via the one-time timelock, the spender pointer is sealed forever. Governance cannot substitute a malicious router.
3. **Redemption Independence**: If both multi-sigs were to lose their keys simultaneously, user redemptions in `StakingVault` would continue functioning without interruption.
