---
layout: default
title: 合约规范与地址
nav_order: 7
has_children: true
---

# 权威合约注册与规范表

TheFatCat 协议在 BNB Chain 上的官方智能合约注册表。具体合约地址与 BscScan 验证链接将在主网创世部署完成后统一公布。

---

## 合约子系统导览

深入查阅各子系统智能合约的技术细节与不变量约束：

- **[核心协议金库合约]({% link zh/contracts/core-vaults.md %})**：质押本金金库（StakingVault，本金隔离托管与不可暂停赎回）、The Belly（无特权指数平滑储备池）与分账金库（ForwardingVault，原子级比例分流）。
- **[周边路由与预言机]({% link zh/contracts/routers-and-oracles.md %})**：批量执行路由（ExecutionRouter，防三明治夹子批量兑换）、TWAP 预言机（PancakeV2TwapOracle，滑点保护与内生均价）以及食谱资产注册表。
- **[资历与账本数学合约]({% link zh/contracts/seniority-ledger.md %})**：资历账本（SeniorityLedger，$O(1)$ 标量权重闭式解核算）、收益分发器（RewardDistributor，双重负债结算会计）以及纯链上 SVG 资历凭据渲染器。

---

## 协议核心合约总表

{: .note }
**主网创世部署说明**：官方链上合约地址将通过 `CREATE2` 确定性部署生成，并在 BNB Chain 创世广播后正式公布。正式部署后将在此直接接入 BscScan 实时开源验证链接。

| 核心组件 | 源码合约 | 架构职责与系统边界 | 部署规范 | 创世开源验证 |
|:---|:---|:---|:---|:---|
| **FATCAT 代币** | `FATCAT.sol` | 1,000,000,000 恒定总供应量、零预售、不可篡改的 BEP-20 代币 | Flap 联合曲线工厂 | 待发射上线 |
| **PancakeSwap V2 交易对** | `PancakePair` | 主流动性交易对池（`FATCAT/WBNB`），累积 TWAP 价格数据源 | PancakeFactory | 达成毕业指标后 |
| **分账金库** | `ForwardingVault.sol` | 接收清算的 WBNB；原子分账 5/36 至运营、31/36 至大肚皮 | 确定性 CREATE2 | 创世批次 |
| **大肚皮蓄水池** | `Belly.sol` | 一阶指数阻尼物理水库；单窗口流出限额 $\le 16/168$，零扫仓后门 | 确定性 CREATE2 | 创世批次 |
| **质押金库** | `StakingVault.sol` | 隔离托管质押本金；不可暂停的 `redeem()`、10 万 FATCAT 门槛 | 确定性 CREATE2 | 创世批次 |
| **资历账本** | `SeniorityLedger.sol` | $O(1)$ 标量权重核算、22-槽位环形缓冲区、RAY 精度前缀引擎 | 确定性 CREATE2 | 创世批次 |
| **时钟控制器** | `IntervalController.sol` | 免许可时钟引擎（$\ge 8\text{h}$ 节奏），推进并锁定餐次权重 | 确定性 CREATE2 | 创世批次 |
| **食谱注册表** | `RewardAssetRegistry.sol` | 权威分红菜单白名单管理与 5% 观察期熔断配额控制器 | 确定性 CREATE2 | 创世批次 |
| **执行路由** | `ExecutionRouter.sol` | 时间锁单活路由器，受 TWAP 严密保护的批量市场兑换器 | 确定性 CREATE2 | 创世批次 |
| **收益分发器** | `RewardDistributor.sol` | 双重负债结算会计系统，非负粉尘超额偿付能力托管金库 | 确定性 CREATE2 | 创世批次 |
| **资历凭据** | `SeniorityCertificate.sol` | 退仓荣誉勋章；销毁代币铸造，100% 纯链上 SVG ERC-721 资产 | 确定性 CREATE2 | 上线后后续规划 |
| **凭据渲染器** | `SeniorityCertificateRenderer.sol` | 纯链上原生矢量 SVG 生成器，动态计算并实时渲染视觉元数据 | 确定性 CREATE2 | 上线后后续规划 |
| **TWAP 预言机** | `PancakeV2TwapOracle.sol` | 内生 TWAP 观察器，防三明治夹子攻击的时间加权均价评估引擎 | 确定性 CREATE2 | 创世批次 |
