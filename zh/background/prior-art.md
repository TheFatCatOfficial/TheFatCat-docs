---
layout: default
title: 参照协议与机制对照
parent: 背景与设计哲学
nav_order: 2
---

# 参照协议与机制对照

为在去中心化金融（DeFi）技术演进语境下准确定位 TheFatCat 的机制设计，本文将本协议核心架构与行业基准协议进行逐项对比分析：**Curve Finance**（veCRV / Gauge / crvUSD）、**Pendle Finance V2** 与 **Synthetix V3**。

所有比对结论均基于已固定的开源代码库 Commit 逐行核对（Curve AMM `574f4402`、Curve DAO `fa127b1c`、Pendle V2 `87685c89`、Synthetix V3 `23585f73`）。

---

## 机制比对全景矩阵

| 机制维度 | 细分模块 | TheFatCat 实现 | 行业参照实现 | 对比结论与权衡 | 验证状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **记账粒度** | 时间切片 | 8 小时离散餐次快照（`IntervalController.sol:63, 338–347`） | Curve: 每秒连续 `rate × dt`（`LiquidityGaugeV5.vy:279–343`）<br>Pendle: 每区块懒索引（`RewardManager.sol:27–46`） | 离散餐次快照极大降低了高频链上计算 Gas 开销，并将系统状态机转换与块级瞬时闪电波动彻底隔离。 | `[已核实]` |
| **记账方式** | 用户 Checkpoint | 领取时采用前缀数组相减（`SeniorityLedger.sol:846–861`）；无逐笔转账钩子 | Pendle: 转账钩子同步结算双方（`PendleGauge.sol:40–42`）<br>Curve: 惰性 `integrate_checkpoint` | 消除仓位存续期间的 $O(N)$ 遍历与交互双方授权摩擦。 | `[已核实]` |
| **尾差处理** | 截断残差归宿 | 残差不可提取、不可指派（`RewardDistributor.sol:136–142`） | Pendle: `lastBalance` 记录完整增量（`RewardManager.sol:48–49, 73`）；残差沉淀于水位线之下 | 两者截断残差归宿等价（均沉淀于协议侧金库），行业内并不存在“自动回流尾差”的机制。 | `[已核实]` |
| **舍入纪律** | 整除取整方向 | 申领人不利方向（claimant-adverse），单次向下取整（`SeniorityLedger.sol:863–867`） | Curve: 资金池不利（pool-adverse，`StableSwap3Pool.vy:465, 477–478`）<br>Pendle: `mulDown` / `divDown` 向下取整 | 三方均执行严格向下取整，在数学底层保证协议偿付能力永远优于申领者利益最大化。 | `[已核实]` |
| **时间权重** | 动态演变特征 | 加法爬升 $1.0\times \to 22.0\times$（21个餐次），随后恒定（`SeniorityLedger.sol:30–33`） | ve 系锁定期衰减：Curve $A \cdot (t_{\text{end}} - t)/4\text{y}$（`VotingEscrow.vy:250–255`）<br>Pendle $\text{bias} - \text{slope} \cdot t$（`VeBalanceLib.sol:58–61`） | 极性完全反转：奖励持续在席的资历沉淀，而非对未来锁定期的线性折旧。 | `[行业无先例]` |
| **退出惩罚** | 结算中收益 | 退出时进行中餐次的未结算收益自动 forfeit 归幸存质押者（`SeniorityLedger.sol:414–435`） | Curve / Pendle: 无餐次中途罚没机制 | 罚没的未结算收益在数学上于后续餐次完全回流至仍在席的长期质押者。 | `[行业无先例]` |
| **释放控制** | 储备流速限制 | 基于未执行净额的一阶指数平滑：$\min(\Delta t, 16\text{h}) / 168\text{h}$（`IntervalController.sol:338–347`） | Synthetix V3: 连续线性流 `scheduled × Δt / duration`（`RewardDistribution.sol:231–254`） | 基于净余额的流速控制确保即使发生突发性巨额交易税注入，资金流出仍然严格受控。 | `[已核实]` |
| **治理权限** | 收入分成常量 | $3/19$（约 15.79%）固定分配给运营 Safe，无任何管理员修改接口（`FatCatStakingVault.sol:94–95`） | Curve: 可调参数 `admin_fee`，设硬顶（`MAX_ADMIN_FEE`） | 绝对常量设计完全消除了治理层通过修改抽成比例侵蚀金库的攻击面。 | `[已核实]` |
| **执行质量** | DEX 链上撮合 | TWAP 窗口 + 调和流动性下限 + 滑点硬顶 + 兜底报价（`ExecutionRouter.sol:466–484`） | Curve / Pendle / SNX: 不适用（无自主 DEX 现货兑换环节） | 现货 DEX 自动化兑换引入了预言机与流动性依赖，通过调和流动性硬约束消除攻击暴露。 | `[行业无先例]` |

---

## 机制深度评估与澄清

### 1. 舍入尾差处理机制：TheFatCat 对比 Pendle V2

在离散收益分配引擎中，整数除法的向下截断必然产生微量残差：

$$\text{dust} = R - \sum_{i=1}^{M} r_i \ge 0$$

- **Pendle V2 源码事实（`RewardManager.sol:48–49, 73`）**：`lastBalance` 在索引更新时按**完整余额增量**（包含 `divDown` 截断产生的残差）抬升，在用户领取时与代币余额同步扣减。残差因此被吸收进水位线之下，**绝不会**滚入下一轮可分配收入中——其归宿与 TheFatCat 的“残差不可提取”完全相同。
- **TheFatCat 机制设计（`RewardDistributor.sol:136–142`）**：通过“非负粉尘定理”在数学上证明 $\sum r_i \le R$。截断尾差永久留存在合约余额内充当偿付缓冲垫，确保历史累计负债严格不大于物理持仓 $\sum \text{liability}_k \le \text{balance}(k)$。
- **结论**：两协议均未实现所谓“自动回收尾差”。若在缺乏严格形式化证明的前提下允许尾差回流未结算库存，极易产生挪用尚未领取的合法收益负债的严重安全隐患。TheFatCat 保持残差不可提取是出于金库偿付绝对安全的底层约束。

### 2. 参数上界约束体系：TheFatCat 对比 Pendle V2

- **Pendle V2 费率覆盖机制（`PendleMarketFactoryV7Upg.sol:131–140`）**：Pendle 的 `setOverriddenFee` 接口要求传入的新费率必须严格低于市场基础费率（`getNonOverrideLnFeeRateRoot`）。其语义是**相对外部基准值的硬顶约束**，而非单向棘轮机制。
- **TheFatCat 的参数设计准则**：治理与准入核心参数采取**绝对不可变**（`minStake = 100,000`、`minReleaseWeight`）或**单向即时收紧**策略：
  - `PancakeV3TwoHopTwapOracle` 中的 `maxDeviationBps` 支持 Guardian 角色在检测到预言机异常时即时收紧偏离阈值，但放宽偏离度必须经过完整治理等待期。
  - 拒绝为 `minStake` 等不可变参数添加任何 Setter 接口，避免变相扩大特权管理面。

### 3. 分发数据流拓扑：TheFatCat 对比 Synthetix V3

- **Synthetix V3（`RewardDistribution.sol:26–75`）**：采用基于 `scheduledValueD18`（类型为有符号整数 `int128`）的连续线性流分发，在架构层面支持负向流动（即追回扣减或债务再分配）。
- **TheFatCat**：严格运行于非负离散流出模型之上：

  $$R_k = \min\left(\frac{\Delta t}{T_{\text{window}}}, \frac{16\text{h}}{168\text{h}}\right) \cdot \text{Balance}_{\text{unfinalized}}$$

  系统在架构上不存在任何负向惩罚扣款或逆向清算流程。在分发出金环节，TheFatCat 通过在转账前后实测物理余额增量（`balanceOf(after) - balanceOf(before)`，见 `RewardDistributor.sol:1075–1102`）来检验交付结果，防止因假成功或代币异常而记录虚假发放，同时避免了全局回滚对其他正常仓位的波及。

---

## 吸纳的高标准工程实践

从现代顶级 DeFi 协议的演进中，TheFatCat 采纳并实施了以下关键工程实践：

1. **有状态不变量模糊测试（Stateful Invariant Fuzzing，源自 Curve Stablecoin 实践）**：在数万轮随机多区块、多用户交替操作下，严格验证资产守恒、资历倍数单调性与负债偿付绝对不变量。
2. **确定性权限隔离设计（`Belly.sol`, `StakingVault.sol`）**：
   - 紧急暂停 `pause`：Guardian 与 Governor 均可触发，用于在检测到异常时即时阻断出金与新结算。
   - 恢复运行 `unpause`：权限严格限制于 Governor 多签（`Belly.sol:328–332`），防止受到攻击威胁的 Guardian 私自重启系统。
   - 核心赎回解耦：`StakingVault.sol` 中的 `redeem` 逻辑在结构上完全不读取 `paused` 状态，确保质押本金的取回权利绝不会被管理员权限所剥夺。
3. **真实攻击对抗回归测试套件（PoC Regression Suites）**：在 `contracts/test/` 目录下常态化维护针对包装代币重入、收益抢跑竞赛及预言机操纵等极限攻击路径的 PoC 验证用例。
