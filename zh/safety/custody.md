---
layout: default
title: 金库托管与偿付能力证明
parent: 安全性与治理设计
nav_order: 2
---

# 金库托管与偿付能力数学证明

形式化阐述 TheFatCat 的非托管资本边界、零管理员扫仓不变量（Zero-Sweep Invariant），以及基于整除向下取整的超额偿付能力数学证明。

---

## 1. 本金与分红的严格合约隔离

在 TheFatCat 架构中，质押的 FATCAT 代币始终是本金，绝不会与分红储备混淆：

- **独立金库存储**：质押代币严格锁定在 [`StakingVault.sol`]({% link zh/contracts.md %}) 内部。
- **与 The Belly 绝缘**：本金绝不流入 `Belly.sol`、路由合约或分发器合约。
- **无条件随时赎回**：`redeem()` 函数故意忽略任何紧急暂停状态，且无需任何外部 Keeper 审批。

---

## 2. 零管理员扫仓原则（The Zero-Sweep Principle）

在智能合约中，所谓的“扫仓（Sweep）”、“救援（Rescue）”或“资金整理（Skim）”接口，本质上都是披上温和外衣的管理员后门。

{: .important }
**零管理员扫仓不变量**：核心协议合约（`StakingVault`、`Belly`、`RewardDistributor`、`SeniorityLedger`）**均未编写任何 `sweepToken()`、`rescueFunds()` 或 `emergencyWithdraw()` 特权接口**。

一旦资金进入合约，全网没有任何实体 —— 无论是开发者、多签委员会、还是社区投票 —— 能够在预设的确定性状态机规则之外提走或转移这些资产。

---

## 3. 偿付能力数学证明（非负粉尘定理）

DeFi 分红分发器最隐蔽的系统性风险之一是舍入下溢/溢出：整数除法的累积舍入误差会导致金库账面欠款多于实际持有代币，从而导致最后提取的用户发生交易回滚（Bank Run）。

TheFatCat 通过双重 RAY 精度下的严格整除向下取整（Integer Floor Division），在数学层面上彻底清除了资不抵债的可能：

### 定理：非负粉尘归属定理（Non-Negative Dust Vesting）
设 $R$（单位 D18{tok}）为单次执行批次中实际采购获得的分红代币总量，$S$（单位 D18{quote}）为该批次所消耗的计价资金预算。对于任意 $N$ 个满足 $\sum_{i=1}^N x_i \le S$ 的质押者应得计价份额 $x_i$，全网累计实际提取的代币总和 $\sum_{i=1}^N r_i$ 严格小于或等于实际到账代币总量 $R$：

$$\sum_{i=1}^N r_i \le R$$

### 逐步形式化证明：
1. **批次代币折算率（Rate）**：
   
   $$\text{Rate} = \left\lfloor \frac{R \cdot \text{RAY}}{S} \right\rfloor \le \frac{R \cdot \text{RAY}}{S}$$

2. **单用户提取代币数**：
   
   $$r_i = \left\lfloor \frac{x_i \cdot \text{Rate}}{\text{RAY}} \right\rfloor \le \frac{x_i \cdot \text{Rate}}{\text{RAY}}$$

3. **对全部 $N$ 个提取者求和**：
   
   $$\sum_{i=1}^N r_i \le \sum_{i=1}^N \frac{x_i \cdot \text{Rate}}{\text{RAY}} = \frac{\text{Rate}}{\text{RAY}} \cdot \sum_{i=1}^N x_i$$

4. **代入约束边界**：已知 $\sum_{i=1}^N x_i \le S$ 且 $\text{Rate} \le \frac{R \cdot \text{RAY}}{S}$：
   
   $$\sum_{i=1}^N r_i \le \frac{\text{Rate} \cdot S}{\text{RAY}} \le \frac{\left( \frac{R \cdot \text{RAY}}{S} \right) \cdot S}{\text{RAY}} = R \quad \blacksquare$$

### 推论：非负粉尘沉淀（安全不变量 D1）
向下取整产生的微小正粉尘 $\Delta_{\text{dust}} = R - \sum_{i=1}^N r_i \ge 0$ 永久沉淀在分发器内部。因此，分发器的链上代币储备始终严格大于或等于其登记的负债：

$$\text{balanceOf}(\text{Distributor}, a) \ge \text{liability}[a]$$

$$\text{balanceOf}(\text{Distributor}, \text{quote}) \ge \sum_a \text{quoteLiability}[a]$$
