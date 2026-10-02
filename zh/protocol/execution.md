---
layout: default
title: 批量撮合与资产执行
parent: 核心机制深度解析
nav_order: 3
---

# 批量撮合与资产执行机制

深入解析 TheFatCat 如何将分红权益核算与链上市场兑换解耦、如何通过离散餐次边界与链上 TWAP 收敛三明治夹子攻击暴露面，以及免许可兜底清偿保障。

---

## 1. 权益核算与市场兑换解耦

在传统的 DEX 分红代币中，购买分红代币通常在用户交易中同步强行触发。若当前交易遭遇恶劣滑点或夹子抢跑，质押者将承受不可挽回的损失。

TheFatCat 创新性地采用**两阶段解耦架构（Two-Phase Decoupled Architecture）**：

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">ARCHITECTURE</span>
    <span class="tfc-diagram-title">两阶段解耦执行管线架构</span>
  </div>
  <pre class="tfc-diagram-content"><code>第一阶段：餐次轮转（纯代数核算）           第二阶段：批量执行（异步链上兑换）
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│ 餐次推进：锁定各食谱总权重 W_open │ ──► │ 路由调用 DEX 兑换目标资产         │
│ 质押者应得份额确定性锁定          │     │ 受到 TWAP 与 protocolMinOut 严护 │
└─────────────────────────────────┘     │ 分发器原子累增 liability 兑付负债 │
                                        └─────────────────────────────────┘</code></pre>
</div>

1. **第一阶段：确定性权益锁定**：餐次推进时，计价预算被精准分配给各食谱资金池。质押者的应得份额在代数层面永久确立。无论后续市场行情如何巨震，任何人都无法篡改既定权益。
2. **第二阶段：异步链上兑换**：[`ExecutionRouter`]({% link zh/contracts.md %}) 仅在市场流动性充足、价格位于健康区间内时，以批次为单位择机执行兑换。

### 全局餐次结算顺序

每次采购或实际拨款的回退结算，只处理一个资产的一个完整待结餐次。所有在册资产（包括仍有待结资金的禁用项）中，最早的非零待结餐次须先清完，后续餐次才能支出；同一最早餐次内，各资产可以任意顺序结算。等待结算期间，时钟仍可推进并登记分配。

早期资产受阻会延后其他食谱的后续餐次，直到正常执行或符合资格的回退将其清除。FEED 轮转批次不绕过该顺序。`ExecutionRouter.spendFor()` 仅因等待更早餐次而返回零，不代表取得回退资格；结构性金额检查使用 `RewardDistributor.spendFor()`。

### 架构权衡分析（Tradeoff Analysis）
解耦记账与执行在大幅增强系统安全性的同时，引入了明确的工程权衡：
- **安全收益**：用户侧操作（存入、提取、领取）完全脱离 DEX 现货路由风险，杜绝了针对单个质押者的前置抢跑或交易夹子。
- **运行权衡**：收益交付依赖聚合批次的顺利执行。协议将兑换集中在任何人都可触发的聚合批次中，将 MEV 攻击面局限在聚合批次执行窗口之内，并由链上 TWAP 偏离约束与流动性下限进行防御。

---

## 2. 链上 TWAP 与滑点保护边界

为收敛 MEV 暴露面并防止批量兑换遭遇掠夺性三明治攻击：

- **按路线选择预言机**：Router 使用 Registry 为资产配置的适配器及预言机。首发菜单为 BNB/WBNB、QQQB、SPCXB、NVDAB、SPYB、GOOGLB；WBNB 使用直接路径，五项 bStock 使用 WBNB → USDT → 目标资产的 V3 双跳路线及 `PancakeV3TwoHopTwapOracle`。适配的 V2 路线使用 `PancakeV2TwapOracle`。FATCAT 奖励上架须另行核验路线，FATCAT/QQQB 发射池不是直接 FATCAT/WBNB 报价池。
- **强制滑点校验**：在发起市场兑换前，路由严格校验实际产出不得低于：

$$\text{protocolMinOut} = \left\lfloor \frac{\text{expectedOut} \cdot (10000 - \text{deviationBps})}{10000} \right\rfloor$$

若瞬时价格偏离度超出安全阈值（默认 200 bps / 2%），链上兑换将自动安全回滚，拒绝成交。

---

## 3. 代币化美股（bStocks）的 5% 观察期熔断上限

现实世界代币化资产（bStocks）包含发行方对手方信用与合约升级风险。TheFatCat 在协议层面进行了严格风控：

- **单餐次 5% 观察期上限**：新上线非原生资产在进入系统的最初 7 天观察期（`PROBATION = 7 days`）内，单餐次分配上限严格被钳制为 500 bps（`PROBATION_CAP_BPS = 5%`），7 天后解除并恢复为 100%（`BPS`）。此上限为单餐预算比例上限，而非终身累计硬顶。
- **创世初始菜单豁免**：在创世注册表 [`InitialRewardAssetRegistry`]({% link zh/contracts.md %}) 中，签署于部署构造函数中的首发菜单标的已在部署前完成了严格的深度审核与流动性验证，因此享受初始 7 天观察期豁免（`_isProbationExempt` 为 `true`）。后续若关闭后重新启用，则必须按普通规则重新服满 7 天观察期。
- **信用与时间边界**：发行方风险随仓位所分配的资产承担；全局结算顺序也意味着早期资产受阻可能延后其他食谱的后续餐次。WBNB 始终为默认与兜底资产。

---

## 4. 免许可兜底清偿机制（Fallback Finalization）

如果某种分红资产遭遇流动性匮乏、长时间未撮合成交或被治理下架，协议提供了免许可的自动兜底通道：当特定资产无法采购时，符合条件的待结算金额可改用网络原生资产（BNB）结算。

当且仅当满足以下任一条件时，兜底清偿机制即可被触发：
1. **执行超时**：某项资产待采购时长超过配置的最大容忍期（默认 **1 天**，对应合约状态 `pendingAge > maxPendingAge`）；
2. **资产禁用**：资产在采购期间被治理停用（对应合约状态 `!enabled`）；
3. **单笔预算不足以覆盖首个完整餐次**：当某一餐次所需采购资金超过了系统设定的单笔执行上限，导致当前预算无法启动首个完整餐次的采购时（对应合约底层条件 `spendFor == 0`）。**注意**：DEX 交易中普通的滑点波动并不会立即打开此通道，它仅在结构上无法启动采购时就绪。

```solidity
function fallbackFinalize(address asset) external returns (uint256 quoteIn);
```

- **全员免许可**：链上条件满足时，任何人均可直接调用底层接口 `fallbackFinalize(asset)` 触发兜底。公众维护模型见[协议去中心化维护]({% link zh/guides/community-keeper.md %})。
- **原生 BNB 兜底结算**：实际拨出的 WBNB 总额按一比一记入 `quoteLiability[asset]`，可经收益分发器解包领取为原生 BNB。仓位所得按批次费率及扣除放弃额后的可领取资金池计算，并向下取整。
- **流速与结算边界约束**：将待结 quote 从 Belly 拨入分发器时，仍受 8 小时窗口流速上限（$\le 16/168$）、全局餐次顺序和完整餐次边界约束。资金结算后的普通奖励领取，不再消耗 Belly 的窗口额度。


## 可持续菜单生命周期

Registry 提供 `menuCapacity`（默认 16，硬上限 32）和 `feedBatchSize`（默认 4，硬上限 8，且不超过容量）。Governor 多签调用 `queueMaintenanceConfig` 排队，等待三天，再调用 `executeMaintenanceConfig`；Governor/Guardian 可取消。执行时重新检查在册数量及提案所依据的配置版本。这不增加提款或更换已上市路线的权限。

容量包含永久 WBNB 兜底、启用项和清退中的禁用项。释放槽位需先禁用非默认资产，跨餐清理期初与退出权重，经正常结算清空待采购资金及未处理 forfeits，再由 Governor 调用 `remove`。Ledger 归档时保留历史债权，不要求所有用户先领完。禁用项仅在永久迁移前可以重新启用；本版不支持已迁移或归档 token 地址重新上市。

逐餐循环仅遍历活动资产，历史索引保持追加式，归档累计快照仍供旧奖励查询。因此历史归档数量增加不会扩大每餐循环。FEED 只检查游标指定批次；完整选择菜单和历史奖励在官网、Flap 中分别读取。

提高容量或批次大小前，应按实际路线及活动菜单负载验证 Gas 消耗。详见 [FEED 操作和奖励条件]({% link zh/guides/community-keeper.md %})。
