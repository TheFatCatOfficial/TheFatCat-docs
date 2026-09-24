---
layout: default
title: 合约规范与地址
nav_order: 9
has_children: true
---

# 权威合约注册与规范表

TheFatCat 协议在 BNB Chain 上的官方智能合约注册表。具体合约地址与 BscScan 验证链接将在主网创世部署完成后统一公布。

---

## 合约子系统导览

深入查阅各子系统智能合约的技术细节与不变量约束：

- **[核心协议金库合约]({% link zh/contracts/core-vaults.md %})**：质押本金金库（StakingVault，本金隔离托管与不可暂停赎回）、The Belly（无特权指数平滑储备池）与税道分账金库（FatCatStakingVault，Flap V3 原生增量识别与比例分流）。
- **[周边路由与预言机]({% link zh/contracts/routers-and-oracles.md %})**：批量执行路由（ExecutionRouter，永久写死授权 Spender）、TWAP 预言机（PancakeV3TwoHopTwapOracle / PancakeV2TwapOracle）以及创世食谱资产注册表（InitialRewardAssetRegistry）。
- **[资历与账本数学合约]({% link zh/contracts/seniority-ledger.md %})**：资历账本（SeniorityLedger，$O(1)$ 标量权重闭式解核算）、收益分发器（RewardDistributor，双重负债结算会计）以及纯链上 SVG 资历凭据体系。

---

## 协议核心合约总表

{: .note }
**主网创世部署说明**：官方链上合约地址将在 BNB Chain 创世广播后正式公布。正式部署后将在此直接接入 BscScan 实时开源验证链接。

| 核心组件 | 源码合约 | 架构职责与系统边界 | 部署规范 | 创世开源验证 |
|:---|:---|:---|:---|:---|
| **FATCAT 代币** | `FATCAT.sol` | 1,000,000,000 恒定总供应量、零预售、不可篡改的 BEP-20 代币 | Flap 联合曲线工厂 | 待发射上线 |
| **PancakeSwap V2 交易对** | `PancakePair` | 主流动性交易对池（`FATCAT/QQQB`），累积 TWAP 价格数据源 | PancakeFactory | 达成毕业指标后 |
| **FatCatStakingVault** | `FatCatStakingVault.sol` | 固定 BNB 接收器；包装净所得，3/19 至 Ops，余款（16/19）至 Belly | ERC-1167 固定克隆 | 待部署 |
| **FatCatQqqbVault** | `FatCatQqqbVault.sol` | 接收 QQQB 并沿固定路线兑换至 BNB 接收器 | Flap V3 BeaconProxy | 待部署 |
| **FatCatQqqbVaultFactory** | `FatCatQqqbVaultFactory.sol` | 创建金库并持有 Beacon；仅 Guardian 可升级或锁定 | Flap FactoryBaseV2 | 待部署 |
| **FatCatMaintenanceRewards** | `FatCatMaintenanceRewards.sol` | 每个 QQQB 金库对应的不可升级推动奖励托管与领取模块 | Factory 创建 | 待部署 |
| **ProtocolExecutor** | `ProtocolExecutor.sol` | 无许可一笔尝试：QQQB 兑换、一个到期餐次及最多三个奖励采购 | 独立合约 | 待部署 |
| **Belly 金库** | `Belly.sol` | 一阶指数阻尼蓄水池；单窗口流出限额 $\le 16/168$，单次永久写死 Spender | 确定性部署 | 创世批次 |
| **质押金库** | `StakingVault.sol` | 隔离托管质押本金；不可暂停的 `redeem()`、10 万 FATCAT 门槛与凭据联动 | 确定性部署 | 创世批次 |
| **资历账本** | `SeniorityLedger.sol` | $O(1)$ 标量权重核算、22-槽位环形缓冲区、RAY 精度前缀引擎 | 确定性部署 | 创世批次 |
| **创世时钟控制器** | `LaunchIntervalController.sol` | 生产时钟引擎（$\ge 8\text{h}$ 节奏），内嵌 7 天初始零分红爬坡期 | 确定性部署 | 创世批次 |
| **创世食谱注册表** | `InitialRewardAssetRegistry.sol` | 生产菜单白名单管理，带签名的首发菜单标的豁免 5% 试用期分配上限 | 确定性部署 | 创世批次 |
| **执行路由** | `ExecutionRouter.sol` | 永久绑定唯一提款 Spender，受 TWAP 严密保护的批量市场兑换与兜底结算 | 确定性部署 | 创世批次 |
| **收益分发器** | `RewardDistributor.sol` | 双重负债结算会计系统，非负粉尘超额偿付能力托管金库 | 确定性部署 | 创世批次 |
| **资历凭据** | `SeniorityCertificate.sol` | 链上资历凭据合约（ERC-721）；退仓燃烧 FATCAT 铸造，具备 5% ERC-2981 版税反哺 Belly 金库机制 | 确定性部署 | 创世批次 |
| **凭据渲染器** | `SeniorityCertificateRenderer.sol` | 纯链上原生矢量 SVG 生成器，动态计算并实时渲染视觉元数据 | 确定性部署 | 创世批次 |
| **凭据数据容器** | `CertificateData.sol` | 存储压缩字体与矢量插画字节码的链上数据存储合约 | 确定性部署 | 创世批次 |
| **V2 TWAP 预言机** | `PancakeV2TwapOracle.sol` | 内生 TWAP 观察器，评估 V2 交易对时间加权均价 | 确定性部署 | 创世批次 |
| **V3 执行适配器** | `PancakeV3Adapter.sol` | 跨池多跳执行适配器，支持在 Pancake V3 多费率池间撮合兑换 | 确定性部署 | 创世批次 |
| **V3 双跳预言机** | `PancakeV3TwoHopTwapOracle.sol` | V3 跨池双跳 TWAP 预言机（WBNB -> USDT -> bStock），为美股资产提供报价 | 确定性部署 | 创世批次 |
