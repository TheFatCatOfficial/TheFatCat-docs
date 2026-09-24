---
layout: default
title: 安全审计与缺陷加固复盘
parent: 安全性与治理设计
nav_order: 2
---

# 安全审计与缺陷加固复盘

在对抗性安全审计与内部形式化验证（PocAudit 测试套件）过程中，团队针对一系列核心记账边界、并发竞态与精度截断问题展开了深度排查与系统性加固。

本文公开披露三个具有代表性的关键安全隐患、加固方案及其在 `contracts/test/` 中的测试用例佐证。

---

## 1. 上游收益交割并发抢跑与包装代币竞态

- **测试套件**：[`SweepWrappedRace.t.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/test/SweepWrappedRace.t.sol)
- **目标合约**：`FatCatStakingVault.sol`, `FatCatStakingVaultFactory.sol`

### 漏洞向量与边界
上游发射台协议（如 Flap V3）向外部质押金库分发协议收益时，采用“先转账再通知”（`transfer-then-ping`）的异步模式。

这种调用架构引入了潜在的竞态条件：
1. 若无特权调用者在物理代币转账完成与通知 Ping 到达之间抢跑调用 `sweepWrapped()`，资金将在金库记账钩子确认存入之前被强行扫入 The Belly，可能导致金库流水与记账脱节。
2. 若上游包装代币（如 WBNB）在执行中途临时暂停或抛出异常，部分状态更新可能导致金库已记录收益与实际物理持仓产生偏差。

### 加固方案与验证
金库通过幂等状态检查与原子化包装/解包自愈逻辑进行加固：
- 在调用 `flush()` 前，原生 BNB 收益以未包装形式存在；此时调用 `sweepWrapped()` 因包装代币余额为零而成为安全的无害空操作（no-op）。
- `flush()` 执行过程中完全不存在重入暴露面：外部调用严格受限于受信任的官方包装代币合约。
- 在 `SweepWrappedRaceTest` 中，测试模拟了在转账与 Ping 通知之间插入扫仓调用的极限对抗场景。测试证明：资金托管守恒，绝无资金滞留，且金库余额在无需管理员介入的情况下实现完全自愈。

---

## 2. 大规模多仓位舍入残差与负债偿付边界

- **测试套件**：[`RewardDustEstimate.t.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/test/RewardDustEstimate.t.sol)
- **目标合约**：`RewardDistributor.sol`, `SeniorityLedger.sol`

### 漏洞向量与边界
在向 $M$ 个在席活跃仓位分发批次奖励 $R$ 时，每个仓位的应得份额均基于整数除法计算：

$$r_i = \left\lfloor \frac{R \cdot W_i}{W_{\text{active}}} \right\rfloor$$

在包含数千个并发开仓、跨越数十个连续餐次的真实运行环境下，累计舍入残差可能产生漂移；若出现向上舍入错误，将导致金库面临资不抵债风险（$\sum r_i > R$）。反之，若尾差沉淀导致负债核算失真，质押者可能无法全额提取其合法应得收益。

### 加固方案与验证
记账引擎执行严格的**申领人不利方向（claimant-adverse）单次向下取整**纪律：
- 截断取整在每次份额计算时仅执行一次（`SeniorityLedger.sol:863–867`），确保每个分配份额 $r_i$ 严格小于或等于其数学精确值。
- 在 `RewardDustEstimateTest` 中，测试套件针对多种规模展开了长周期模拟：
  - 2 个仓位跨越 30 个批次
  - 99 个仓位跨越 30 个批次（分别测试即时领取与汇总领取）
  - 1,000 个仓位跨越 30 个批次（分别测试即时领取与汇总领取）
- 测试用例形式化证明了核心守恒定律：

  $$\text{balanceOf}(\text{Distributor}) \equiv \text{liability}(\text{token})$$

  截断尾差在每个分配份额中严格限制在亚 wei 级别，作为不可提取的偿付缓冲沉淀于合约余额中，且历史累计负债永远不超过物理代币托管总量。

---

## 3. 金库分成比例绝对不可变性与防抽资设计

- **测试套件**：[`VaultRevenueSplit.t.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/test/VaultRevenueSplit.t.sol)
- **目标合约**：`FatCatStakingVault.sol`

### 漏洞向量与边界
在传统质押协议中，团队运维抽成比例通常存储在可修改的合约状态变量中，由管理员私钥或多签时间锁控制。

这带来了两大核心风险：
1. **治理抽资（Governance Skimming）**：若管理员私钥泄漏或作恶，恶意调用者可将抽成比例骤升至 100%，在质押者来不及退出前瞬间抽干分红池。
2. **参数变更不同步**：中途修改费率容易导致已产生但未结算收益与新分成比例产生记账冲突。

### 加固方案与验证
为彻底根除治理抽资的攻击面，协议在合约底层将分成比例硬编码为不可篡改的数学常量：
- **运营维护分成**：严格固定为 $3/19$（约 15.789%），直接转入运营 Safe 多签（用于协议的运营维护以及持续开发）。
- **协议储备池分成**：严格固定为 $16/19$（约 84.211%），直接注入 The Belly 储备金库。
- 合约中**不存在任何 Setter 接口**、无任何管理员覆盖权限，亦无任何治理升级通道可改变该比例（`FatCatStakingVault.sol:94–95`）。
- 在 `VaultRevenueSplitTest` 中，测试验证了在任意金额与资产条件下，每笔到账收益均原子化地按 $3/19$ 刚性分割，且任何第三方均无法篡改或截留分成资金流。

---

## 对抗性测试套件索引

协议代码库中常态化维护的完整加固与对抗测试清单如下：

| 测试文件 | 目标领域 | 验证的核心不变量 |
| :--- | :--- | :--- |
| `contracts/test/SweepWrappedRace.t.sol` | 收益并发交割 | 转账/通知竞态下的资金守恒；包装代币解包时的零重入暴露。 |
| `contracts/test/RewardDustEstimate.t.sol` | 整数除法与精度 | 物理代币持仓恒等于记录负债；尾差累计严格受控于 $O(M \times N)$ wei 级别。 |
| `contracts/test/VaultRevenueSplit.t.sol` | 费用分成核算 | $3/19$ 运营分成刚性不可稀释；零管理员抽成接口。 |
| `contracts/test/PocAudit09Invariant.t.sol` | 资历状态机 | 总资历权重随餐次推进单调递增，严格受控于 $22.0\times$ 硬顶。 |
| `contracts/test/PocAudit03Oracle.t.sol` | TWAP 价格预言机 | 调和流动性下限有效抵御现货兑换报价闪电贷操纵。 |
