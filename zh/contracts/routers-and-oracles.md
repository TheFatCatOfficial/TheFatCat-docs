---
layout: default
title: 周边路由与预言机
parent: 合约规范与地址
nav_order: 2
---

# 周边执行路由与预言机合约

TheFatCat 的周边协议设施负责链上市场批量兑换、TWAP 均价验证以及食谱资产白名单的严密风控：

---

## 1. 批量执行路由 (`ExecutionRouter.sol`)

- **架构职责**：执行从计价资产（WBNB）向各食谱代币的链上批量市场兑换与兜底计价结算。
- **核心不变量**：
  - **单次写入永久 Spender**：在 The Belly 中，授权提款地址（`spender`）只能被设置并激活一次，一旦激活即永久生效且不可替换升级，杜绝资金通道被任意重定向。上线初期设有 7 天的激活时间锁，保障首周资金安全。
  - **原子级清算交割**：兑换所得的全部目标资产，必须在同一笔交易结束前无损打入 `RewardDistributor` 分发合约。
  - **防 MEV 聚合撮合**：将当期全部质押者的食谱兑换需求合并为单一全局订单，有效防止外部三明治夹子与抢跑攻击。

---

## 2. TWAP 价格预言机体系 (`PancakeV2TwapOracle.sol` & `PancakeV3TwoHopTwapOracle.sol`)

- **架构职责**：直接从链上流动性池读取累积价格数据与 Tick 观察值。
- **核心不变量**：
  - **V2 交易对均价评估**：内生时间加权均价评估引擎，为标准交易对（`FATCAT/WBNB`）提供防闪电贷操纵报价。
  - **V3 跨池双跳均价评估**：通过 `PancakeV3Adapter` 与 `PancakeV3TwoHopTwapOracle`，对代币化美股（bStocks）通过深流动性路径（WBNB $\to$ USDT $\to$ bStock）进行双跳 TWAP 验证，严格校验 Tick 观察窗口深度。
  - **滑点硬边界**：为 `ExecutionRouter` 提供权威公允价格基准，强制执行 `protocolMinOut` 协议滑点保护底线。

---

## 3. 食谱资产注册表 (`RewardAssetRegistry.sol` & `InitialRewardAssetRegistry.sol`)

- **架构职责**：维护官方批准的食谱资产（MENU）白名单与配额风控。
- **核心不变量**：
  - **规范网络资产**：BNB（内部以 WBNB 记账）为永久默认且不可移除的底层基准。
  - **观察期单餐上限（bStocks）**：新上线非原生资产在进入系统的最初 7 天观察期（`PROBATION = 7 days`）内，单餐次分配上限严格限制在 500 bps（`PROBATION_CAP_BPS = 5%`），7 天后解除并恢复为 100%。
  - **创世菜单首发豁免**：`InitialRewardAssetRegistry` 部署构造函数中携带的签名初始菜单已在发射前完成深度验证，因此全量享受初始观察期豁免（`_isProbationExempt` 为 `true`）。
  - **原生代币（FATCAT）**：仅在毕业进入 PancakeSwap V2 且完成 TWAP 预言机预热后才具备上线资格。
