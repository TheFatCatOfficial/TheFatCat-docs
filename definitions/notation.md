---
layout: default
title: Formal Notation Table
parent: Definitions & Notation
nav_order: 1
---

# Formal Algebraic Notation Table

The table below defines the canonical algebraic symbols used across all protocol specifications, smart contract docstrings, and audit proofs.

| Symbol | Formal Concept | Dimensionality / Unit | Definition & Scope |
|:---|:---|:---|:---|
| $m$ | **Accounting Interval Index** | Discrete $\mathbb{N}$ ($m \ge 0$) | Global sequence counter of completed intervals ($\ge 8\text{h}$ each); advanced permissionlessly by `advance()`. |
| $t$ | **Block Timestamp** | Seconds ($\text{s}$) | EVM block timestamp `block.timestamp`. |
| $\Delta t$ | **Elapsed Interval Time** | Seconds ($\text{s}$) | $\Delta t = t - t_{\text{lastAdvance}}$, with structural gate $\Delta t \ge 28,800\text{ s}$ ($8\text{ hours}$). |
| $p_i$ | **Staked Principal** | $D18\text{ \{FATCAT\}}$ | Principal tokens deposited into `StakingVault.sol` by position $i$ ($p_i \ge 100,000 \cdot 10^{18}$). |
| $j_i$ | **Activation Interval** | Discrete $\mathbb{N}$ | Interval index at which position $i$ becomes active: $j_i = m_{\text{stake}} + 1$. |
| $c_i(m)$ | **Seniority Coefficient** | Dimensionless ($[1, 22]$) | Additive time multiplier: $c_i(m) = \min(1 + m - j_i, 22)$ for $m \ge j_i$. |
| $w_i(m)$ | **Position Seniority Weight** | $D18\text{ \{weight\}}$ | Effective voting/claim weight: $w_i(m) = p_i \cdot c_i(m)$. |
| $W(m)$ | **Aggregate Active Weight** | $D18\text{ \{weight\}}$ | Global sum of all active position weights: $W(m) = \sum_{i \in \text{Active}(m)} w_i(m)$, computed in $O(1)$. |
| $\mathcal{B}$ | **The Belly Treasury** | Smart Contract | Unprivileged rate-limited reservoir holding quote currency (`Belly.sol`). |
| $B(t)$ | **Recognized Quote Stock** | $D18\text{ \{WBNB\}}$ | Total WBNB balance recognized in the Belly reservoir at timestamp $t$. |
| $L(t)$ | **Cumulative Quote Liabilities** | $D18\text{ \{WBNB\}}$ | Sum of quote funds reserved for in-flight batches, pending procurement, and unfinalized intervals. |
| $U(m)$ | **Unreserved Net Balance** | $D18\text{ \{WBNB\}}$ | Clean capital stock available for emission: $U(m) = \max(0, B(t) - L(t))$. |
| $a \in \mathcal{A}$ | **Reward Asset** | Address (`address`) | An approved reward asset whitelist entry registered in `InitialRewardAssetRegistry.sol`. |
| $W_a(m)$ | **Asset Cohort Weight** | $D18\text{ \{weight\}}$ | Aggregate seniority weight of all active stakers who designated asset $a$ as their output selection. |
| $A_a(m)$ | **Asset Quote Budget** | $D18\text{ \{WBNB\}}$ | Net quote currency allocated to procurement pool $a$ for interval $m$. |
| $\text{deviationBps}$ | **Price Deviation Threshold** | Basis Points ($10^{-4}$) | Permissible TWAP slippage bound enforced by `ExecutionRouter.sol` (default 200 bps = 2.0%). |
| $\text{protocolMinOut}$ | **Slippage Floor** | Asset Units ($D_{\text{asset}}$) | Lower-bound output quantity for market swaps: $\lfloor \text{expectedOut} \cdot (10000 - \text{deviationBps}) / 10000 \rfloor$. |
