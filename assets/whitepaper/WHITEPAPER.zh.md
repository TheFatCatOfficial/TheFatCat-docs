# TheFatCat 白皮书

### 具备自适应阻尼与资历权重的去中心化交易税路由协议

**版本：1.0 正式发布版 (Official Release) | 日期：2026-09-20**
*基于项目计划 v0.5，并对照当前合约源码与发布配置核验。凡属分析模型的公式均明确列出成立条件。普通生产路径默认从资历阶梯第 1 级起步爬坡；持有经链上验证的资历凭据（Seniority Certificate）开仓时，可通过专属入口 `stakeWithCertificate` 继承凭据所载的起始倍数（对应底层 `openWithHead`，提前量 $\text{head} = \text{multiplier} - 1 \in [0, 21]$）。本文档不包含任何预期投资回报率或收益率承诺。*

---

## 摘要 (Abstract)

常见去中心化交易税（Trading-tax / Dividend）方案采用全体共享的奖励配置、缺少时间缓冲的手续费直通路径，并按资本分配而不引入资历。这些是本文所比较上游模板的特征，不是对所有税币实现的普遍断言。

TheFatCat 将以下机制组合为一套协议架构：
1. **The Belly 动力学金库**：任何人均可在至少 8 小时后推进时钟。按名义节奏运行时，每期分配未预留 quote 余额的 $\frac{1}{21} \approx 4.7619\%$，其零流入理想模型的半衰期为 4.736 天；
2. **$O(1)$ 闭式资历账本（Seniority Ledger）**：利用线性代数分解，在不遍历仓位的情况下聚合 1 至 22 级资历权重。完整领取仍需按所跨执行批次线性遍历，可用 `claimThrough` 分段限制单次成本；
3. **主权点餐架构（Diet Architecture）**：每个仓位自主选择采购资产。忽略观察期限额与整数尘埃时，仓位的名义 quote 预算由其全池权重占比决定；资产选择仍会影响执行、市场价值、发行方风险和外部激励；
4. **双重负债与保守舍入**：以 WBNB 作为默认及回退 quote 资产，通过批次会计、精确到账检查和向下取整，在受支持的代币模型内维持经过测试的偿付性不变量。

---

## 1. 绪论与范式转移 (Introduction & Paradigm Shift)

### 1.1 传统直通税币的三重结构性困境

在现有自动化做市商（AMM）生态中，许多交易税分红代币采用直通式流水线：从 swap 中扣费、兑换为配置好的奖励代币，再分发给持币人。本文比较的上游模板有三项限制：

1. **全体共享奖励配置**：所有符合条件的持有人使用同一奖励资产或篮子；上游路径不提供逐质押仓位的独立选择；
2. **缺少时间缓冲**：新增手续费收入随新增成交量下降。直通模式会迅速传导这一变化，不会把已积累库存分摊到后续周期；
3. **没有资历输入**：分配只按资本占比，不为持有时长增加系数。短期资金若占据大部分有效余额，可以主导当期分配，但不会因此取得其入场前已归属他人的奖励。

### 1.2 蓄水池模型：将流量转化为阻尼存量

TheFatCat 将直通管道重构为具有自主黏性的物理蓄水池——**The Belly**。在 4.0% 交易税中，Flap 平台扣留 10%（约 0.4%），金库将所获资金按 5/36（约 0.5%）原子划至独立的运维多签（Ops Safe），其余 31/36（约 3.1%）作为势能注入蓄水池，由确定性时钟按比例释放。资金从“瞬时流量”被转化为“跨周期阻尼存量”。

![图 1：TheFatCat 协议资金流动拓扑与状态机状态转换架构全景](assets/figures/fig1-topology.zh.svg)

---

## 2. The Belly 流体动力学与时间折算 (Hydrodynamics & Time-Proration)

### 2.1 一阶指数衰减与稳态水位方程

The Belly 拒绝固定数额释放。分配基数是**未预留 quote 余额**，即 `accounted - outstandingClaims`，而非合约的账面总余额。

在基准状态下，协议每隔一个最小时间间隔 $\Delta t_{\min} = 8\text{ 小时}$ 推进一次时钟，时间分母定为一周（$T_{\text{week}} = 168\text{ 小时}$）。单次开席的名义分配系数 $\alpha$ 为：

$$\alpha = \frac{\Delta t_{\min}}{T_{\text{week}}} = \frac{8}{168} = \frac{1}{21} \approx 4.7619\%$$

设第 $k$ 顿饭结算前的未预留 quote 余额为 $B_k$。仅在外部流入为零、每期恰好间隔 8 小时、每餐均有效、分配立即完整执行且忽略整数尘埃时，分析模型才遵循一阶离散指数衰减：

$$B_{k+1} = B_k \cdot (1 - \alpha) = B_k \cdot \left(\frac{20}{21}\right)$$

由数学归纳法可知，经历 $k$ 次分配后金库的剩余资金模型为：

$$B(k) = B_0 \cdot \left(\frac{20}{21}\right)^k$$

若外部市场以恒定速率每 8 小时注入手续费 $I$，则金库满足动态平衡条件 $B_{\text{eq}} \cdot \alpha = I$：

$$B_{\text{eq}} = \frac{I}{\alpha} = 21 \cdot I$$

**理想稳态**：在相同节奏与执行假设下，每八小时恒定流入 $I$ 时，结算前平衡余额为 $21I$，相当于该模型下七天的流入。真实余额会受到手续费批量到达、延迟推进、未执行负债、限额、无效餐次及整数舍入影响。

### 2.2 半衰期解析推导 (Half-Life Derivation)

令 $B(k) = \frac{1}{2} B_0$，推导资金半衰期所需的分配周期数 $k_{1/2}$：

$$\left(\frac{20}{21}\right)^{k_{1/2}} = \frac{1}{2} \implies k_{1/2} = \frac{\ln(0.5)}{\ln(20/21)} = \frac{-\ln 2}{\ln 20 - \ln 21} \approx \frac{-0.693147}{-0.048790} \approx 14.207 \text{ 个周期}$$

换算为绝对物理时间 $t_{1/2}$：

$$t_{1/2} = k_{1/2} \times 8 \text{ 小时} \approx 113.654 \text{ 小时} \approx 4.736 \text{ 天}$$

#### 交易归零衰减轨迹表

| 交易量归零后的物理时间 | 经历周期数 $k$ | 金库剩余理论比例 $B(k)/B_0$ | 离散精确计算值 |
|---|---|---|---|
| **第 1 天** (24 小时) | 3 | $(20/21)^3$ | **86.38%** |
| **第 3 天** (72 小时) | 9 | $(20/21)^9$ | **64.46%** |
| **第 7 天** (168 小时) | 21 | $(20/21)^{21}$ | **35.89%** |
| **第 14 天** (336 小时) | 42 | $(20/21)^{42}$ | **12.88%** |
| **第 30 天** (720 小时) | 90 | $(20/21)^{90}$ | **1.24%** |

在该理想模型内，一周零流入不会在数学上耗尽储备；连续 30 天零流入后则仅剩起始余额约 1.24%。该机制是一座阻尼储备池，不是凭空产生价值的永动机。

### 2.3 动态时间折算与窗口出流限速

在生产环境中，区块时间并非绝对均匀，若 Keeper 发生短暂宕机，时钟控制器通过线性时间折算补偿延迟，同时设立两道物理硬保护：

1. **单次释放时间跨度封顶（`CAP_SPAN`）**：
   在 [`IntervalController.sol`](../contracts/src/IntervalController.sol#L82) 中，单次推进允许折算的最大时间为 $\text{CAP\_SPAN} = 2 \times \text{MIN\_INTERVAL} = 16\text{ 小时}$。分配额计算为：
   $$\text{Allocation} = \left\lfloor(\text{accounted} - \text{outstandingClaims}) \cdot \frac{\min(\Delta t, \text{CAP\_SPAN})}{T_{\text{week}}}\right\rfloor$$
2. **金库出厂物理流速限制（`windowAllowance`）**：
   在 [`Belly.sol`](../contracts/src/Belly.sol#L64-L83) 中，每个 8 小时限速窗口（`WINDOW = 8 hours`）内，不可变构造参数锁定最大允许调取比例：
   $$\text{MaxOutflow} = \left\lfloor\text{Balance} \cdot \frac{\text{rateNumerator}}{\text{rateDenominator}}\right\rfloor = \left\lfloor\text{Balance} \cdot \frac{16}{168}\right\rfloor \approx \text{Balance 的 }9.5238\%$$
   即使授权 spender 被完全攻破，每个窗口也最多只能提走该窗口开启时余额的 $\frac{16}{168}$。连续等效的 50% 交点为：
   $$n_{1/2}^{\text{eq}} = \frac{\ln(0.5)}{\ln(152/168)} \approx 6.92569 \text{ 个窗口} \approx 55.4055 \text{ 小时}$$
   合约执行是离散的：六次满额提取后剩余 54.8537%，第七次后剩余 49.6295%，因此需要七个完整窗口额度。若被攻破时当前额度可立即使用，第七次提取可在首次提取后 48 小时发生；若必须先等待新窗口，则约为失陷后的 56 小时。额度若已部分使用，所需时间还会更长。准确口径应为：**需要七个完整窗口额度，实际时间取决于失陷时的窗口相位，不能宣称无条件“至少 55 小时”。**

![图 2：The Belly 流体动力学衰减曲线与离散限速防御模型](assets/figures/fig2-hydrodynamics.zh.svg)

---

## 3. 账本拓扑与资历聚合 (Seniority Ledger & Scalable Topology)

### 3.1 独立仓位与状态隔离

每一笔 FATCAT 质押都会形成一个彼此隔离的逻辑仓位。仓位状态并非存放在单一 Solidity struct 中，而是分布于两份合约：

$$\text{Position}_i = \{ \text{owner}, \text{principal}, \text{diet}, \text{activeFrom}, \text{effectiveFrom}, \text{endInterval} \}$$

`StakingVault` 保存 owner、principal、diet 与可选资历证书关联（`certificatePlusOne`）；`SeniorityLedger` 保存用于权重计算的 principal、`activeFrom`、`effectiveFrom` 与 `endInterval`。

* **禁止混并（Anti-merging）**：多个独立仓位永不混同合并，杜绝利用大资金与老仓位合并完成“资历洗白”；
* **次周期生效（Next-interval Activation）**：在区间 $m$ 内质押的仓位，其生效区间被硬性标记为 $\text{activeFrom} = m + 1$，直接摧毁任何闪电贷借币质押并于同一区块分红跑路的攻击面；
* **起始资历映射（Effective Activation）**：对于常规新开仓位，$\text{effectiveFrom} = \text{activeFrom}$；对于持有资历凭据开仓的仓位（通过 `stakeWithCertificate` 入口），设凭据乘数为 $\text{multiplier} \in [1, 22]$，其提前量为 $\text{head} = \text{multiplier} - 1 \in [0, 21]$，合约设定 $\text{effectiveFrom} = \text{activeFrom} - \text{head}$。

### 3.2 $O(1)$ 闭式资历权重聚合方程 (Closed-Form Aggregation)

#### 问题的提出
设仓位 $i$ 的质押本金为 $p_i$。在仓位尚未达到生效区间时（$m < \text{activeFrom}_i$），资历系数严格为 0；到达生效区间后（$m \ge \text{activeFrom}_i$ 且 $m < \text{endInterval}_i$），资历系数由距虚拟激活区间 $\text{effectiveFrom}_i$ 所跨越的周期决定，并封顶于 22：

$$c_i(m) = \begin{cases} 0, & m < \text{activeFrom}_i \\ 1 + \min(m - \text{effectiveFrom}_i, 21), & m \ge \text{activeFrom}_i \text{ 且 } m < \text{endInterval}_i \end{cases}$$

对于常规仓位（$\text{effectiveFrom}_i = \text{activeFrom}_i$），首个生效周期 $m = \text{activeFrom}_i$ 的系数为 $1 + 0 = 1$；对于凭据提前量为 $\text{head}_i = 21$ 的满级凭据仓位，首个生效周期的系数直接达到 $1 + 21 = 22$。

系统总权重为 $W(m) = \sum_i p_i \cdot c_i(m)$。随着质押人数 $N \to \infty$，循环遍历每个仓位更新权重将直接导致 Gas 耗尽。

#### 代数闭式分解与开仓修正项
TheFatCat 在 [`SeniorityLedger.sol`](../contracts/src/SeniorityLedger.sol) 中通过线性代数分解消解了循环。将全池存续仓位根据虚拟激活区间与当前区间的距离分为两组：
1. **爬坡期仓位集合（Climbing）**：满足 $m - \text{effectiveFrom}_i < 21$；
2. **已满级成熟仓位集合（Settled）**：满足 $m - \text{effectiveFrom}_i \ge 21$，此时系数封顶为 22。

对爬坡期求和：

$$\sum_{i \in \text{Climb}} p_i \cdot (1 + m - \text{effectiveFrom}_i) = (1 + m) \sum_{i \in \text{Climb}} p_i - \sum_{i \in \text{Climb}} (p_i \cdot \text{effectiveFrom}_i)$$

智能合约在存储中实时维护四个全局标量：
* $P_{\text{climb}} = \sum_{i \in \text{Climb}} p_i$（爬坡期本金标量之和）
* $J_{\text{climb}} = \sum_{i \in \text{Climb}} (p_i \cdot \text{effectiveFrom}_i)$（加权虚拟激活序数标量之和）
* $P_{\text{settled}} = \sum_{i \in \text{Settled}} p_i$（已满级成熟本金标量之和）
* $\text{headOpening} = \sum_{i \in \text{Opening}} (\text{head}_i \cdot p_i)$（当期新开仓凭据提前量权重暂存项）

**开仓区间溢出修正（`headOpening`）**：  
常规仓位在区间 $m$ 开仓时，$\text{activeFrom} = \text{effectiveFrom} = m + 1$，在式 $(1 + m)P_{\text{climb}} - J_{\text{climb}}$ 中该仓位的代数贡献恰好为 $(1 + m - (m + 1)) \cdot p = 0$。但对于凭据仓位，$\text{effectiveFrom} = m + 1 - \text{head}$，代数项展开为 $(1 + m - (m + 1 - \text{head})) \cdot p = \text{head} \cdot p$。为了使带有提前量的仓位在尚未生效的开仓区间 $m$ 绝不提前分红，账本在开仓时将 $\text{head} \cdot p$ 累加进 $\text{headOpening}$ 并在总权重中原子扣除。当时钟推进到 $m+1$ 时，$\text{headOpening}$ 自动归零，仓位顺理成章以完整的起始倍数开始计算贡献。

在任意时钟区间 $m$，全池总权重的计算退化为严格的 **$O(1)$ 简单四则运算**：

$$W(m) = (1 + m) \cdot P_{\text{climb}} - J_{\text{climb}} + 22 \cdot P_{\text{settled}} + W_{\text{exiting}} - \text{headOpening}$$

#### 22 槽位环形缓冲区（Graduation Ring）
当区间推进至 $m$ 时，恰好满 21 期的批次需要从 $P_{\text{climb}}$ 毕业转入 $P_{\text{settled}}$。合约使用长度为 $\text{COHORT\_SLOTS} = 22$ 的固定环形数组：

$$\text{slot} = \text{effectiveFrom} \pmod{22}$$

每个周期处理一个全局毕业槽位，并为每个已注册资产处理对应槽位。Gas 开销与全网质押人数 $N$ 无关，但随只增不减的资产列表长度线性增长。

![图 3：22 槽位环形缓冲区常数移库机制](assets/figures/fig3-graduation-ring.zh.svg)

### 3.3 双累加器应得收益计算模型 (Dual-Accumulator Formulation)

为在不逐期遍历的情况下计算单段资历区间，[`SeniorityLedger.sol`](../contracts/src/SeniorityLedger.sol#L51-L58) 引入以 $\text{RAY} = 10^{27}$ 定标的双前缀累加器。

在第 $m$ 期，资产 $a$ 分得的 quote 资金为 $\text{Share}_{a, m}$，该资产在区间开始时的分母为 $W_{\text{open}}(a, m)$。定义单位权重收益率为：

$$\omega_{a, m} = \left\lfloor\frac{\text{Share}_{a, m} \cdot \text{RAY}}{W_{\text{open}}(a, m)}\right\rfloor$$

账本累计两个前缀和序列：

$$A_{a, m} = A_{a, m-1} + (1 + m) \cdot \omega_{a, m}$$
$$B_{a, m} = B_{a, m-1} + \omega_{a, m}$$

对于激活区间为 $j$、本金为 $p$ 的爬坡期仓位，其在区间 $[j, m]$ 内累积应得的 quote 份额为：

$$\text{Entitlement}(j, m) = \left\lfloor\frac{p \cdot (\Delta A_a - j \cdot \Delta B_a)}{\text{RAY}}\right\rfloor$$

对于已满级仓位（系数恒为 22）：

$$\text{Entitlement}_{\text{settled}} = \left\lfloor\frac{22 \cdot p \cdot \Delta B_a}{\text{RAY}}\right\rfloor$$

**复杂度边界**：双前缀相减使单个连续区间内的应得额算术为 O(1)。完整领取仍需定位边界并遍历所覆盖的执行批次，因此端到端成本为 O（跨越的批次数）；`claimThrough` 用于把长期积压安全地拆成多次处理。

### 3.4 退出放弃与同席留守者补偿机制 (Mid-Interval Forfeiture Netting)

协议不对质押本金设置锁定期或退出罚金（`StakingVault.redeem()`）；在受支持代币按预期转账且调用正常执行的前提下，仓位可在任意区块赎回。协议定义的经济代价是放弃**当前正在结算的那一餐**。

设仓位退出时在资产 $a$ 中占有的有效权重为 $w_{\text{exit}}$，当期分配给该资产的总额为 $\text{Allocation}_a$。其被扣留的放弃份额为：

$$\text{Forfeited}_a = \left\lfloor\text{Allocation}_a \cdot \frac{w_{\text{exit}}}{W_{\text{open}}(a)}\right\rfloor$$

在 [`SeniorityLedger.sol`](../contracts/src/SeniorityLedger.sol#L665-L675) 与 [`RewardDistributor.sol`](../contracts/src/RewardDistributor.sol#L465-L480) 中：
1. $\text{Forfeited}_a$ 并不返还给金库，更不属于管理员私钥；
2. 该笔资金永久滞留于资产 $a$ 的采购池中，在下一次批次执行时扣减分母：
   $$\text{ClaimablePot}_a = \text{Pot}_a - \text{Forfeited}_a$$
3. 当放弃额非零时，结算汇率的分子仍为全部到账代币、分母则被扣减，因此该资产当期的单位兑现费率 $\text{BatchRate}$ 上升。整数向下取整可能留下余尘，所以补偿遵循合约舍入规则下的比例，而不是无限精度的“精确补足”。

---

## 4. 名义分配中性与资历情景 (Allocation Neutrality & Seniority Scenarios)

### 4.1 理想条件下的名义 Quote 分配

在传统 DeFi 治理代币（如 Curve Gauge）中，投票决定的是资金流向哪里的**分配额度（How much）**。由于选票直接等价于现金流重定向，必然催生出激烈的二级选票收买市场（Votium / Bribe），协议不得不引入 10 天冷却期等重型约束。

TheFatCat 移除了直接的 Gauge 投票机制。下列约分描述的是限额与整数舍入之前的名义 quote 分配，不能据此证明外部贿选或采购激励不存在。

#### 代数对消证明
依据系统安全属性 S10（[`contracts/doc/SECURITY_PROPERTIES.md`](../contracts/doc/SECURITY_PROPERTIES.md#L41)），所有资产在开席时锁定的分母严格等于系统总权重：

$$\sum_{a \in \text{MENU}} W_{\text{open}}(a) = W_{\text{total}}$$

当时钟推进分配 quote 资金时，资产 $a$ 获取的采购预算为：

$$Q_a = Q_{\text{total}} \cdot \frac{W_{\text{open}}(a)}{W_{\text{total}}}$$

仓位 $i$（权重为 $w_i$，选择资产 $a$）在资产 $a$ 中分配到的应得份额为：

$$\text{Share}_{i, a} = Q_a \cdot \frac{w_i}{W_{\text{open}}(a)}$$

将 $Q_a$ 展开代入：

$$\text{Share}_{i, a} = \left( Q_{\text{total}} \cdot \frac{W_{\text{open}}(a)}{W_{\text{total}}} \right) \cdot \frac{w_i}{W_{\text{open}}(a)} = Q_{\text{total}} \cdot \frac{w_i}{W_{\text{total}}}$$

#### 条件性结论
在实数运算、资产启用且不受限额约束时，分母项 $W_{\text{open}}(a)$ 可以相消。忽略整数尘埃后，仓位 $i$ 的名义 quote 预算占比为 $\frac{w_i}{W_{\text{total}}}$，不因同选该资产的人数而变化。

> **结论边界**：DIET 决定协议买什么；在上述条件下，它不改变仓位的名义 quote 占比。观察期限额、资产停用、整数舍入、执行时间、滑点、费用、市场价格，以及发行方或流动性提供者的激励，仍可能改变实际收到的资产或经济价值。更改 DIET 除 Gas 外免费、保留资历，并在下一周期生效。

### 4.2 资历阶梯相对优势分析

必须严格区分资历倍率的三种参照系：

| 比较维度 | 权重相对倍数 | 经济学本质与边界 |
|---|---|---|
| **满级成熟仓位 vs 首个活跃周期仓位** | **22.0 倍** | 暂时劣势：新人完成 21 个活跃周期后同样达到 22，劣势自然消除 |
| **满级成熟仓位 vs 全池平均水平** | **$22/\bar c$** | 取决于分布：$\bar c$ 为本金加权平均系数 |
| **满级成熟仓位在停滞池中** | **1.0 倍** | 稳态基准：在无新资金进入的静态池中，全员登顶，溢价归一 |

设活跃仓位本金为 $p_i$、系数为 $c_i$，则 $\bar c=\sum_i p_i c_i/\sum_i p_i$。由于 $1\le\bar c\le22$，满级仓位相对全池单位本金均值的倍数 $22/\bar c$ 位于 1 至 22。常见的 1.913 倍只是一种情景：若本金均匀分布在 1 至 22 级，则 $\bar c=11.5$。任何更窄范围都必须先给出进入率、退出率与年龄分布，不能称为协议的理论上限。该优势按单位本金比较；绝对收益仍与本金线性相关。

![图 4：分段线性资历爬坡阶梯、全池稳态溢价关系与本金线性约束](assets/figures/fig4-seniority-premium.zh.svg)

### 4.3 `MIN_STAKE` 硬台阶与资历证书（SeniorityCertificate）规范

1. **部署时锁定的准入门槛**：[`StakingVault.sol`](../contracts/src/StakingVault.sol#L169) 通过构造参数接收不可变 `minStake`。发布配置将其设为 `100_000 FATCAT`（占 10 亿总量的 0.01%），部署后不设 Setter；
2. **纯线性规模收益**：在资历系数与 DIET 相同时，门槛之上的仓位权重随本金线性增长，不存在超线性规模乘数；另开新仓位会从自己的资历路径起步；
3. **资历实体化通道（[`SeniorityCertificate.sol`](../contracts/src/SeniorityCertificate.sol)）**：
   - **创世同步部署**：随核心质押合约群一并创世部署。Governor 多签开放签发后，普通仓位完全退出时，只要本金满足 $\ge 100{,}000\text{ FATCAT}$，质押者可调用 `redeemAndIssueCertificate()` 将当前达成的实际资历档位（$c_i \in [1, 22]$）印刻为不可篡改的 ERC-721 资历凭证（并非仅限满级 22 级仓位）；
   - **死地址永久锁定**：每次铸造必须将固化的 `100_000 FATCAT`（`MINT_BURN`）转入黑洞死地址 `0x000000000000000000000000000000000000dEaD`，实现流通筹码的事实性永久退出（底层调用代币 `transfer(DEAD, MINT_BURN)`，非调用缩减代币总量的 `burn()` 接口）；剩余本金全额退回用户钱包；
   - **凭据开仓与门槛豁免**：持有未被占用的凭据可调用 `stakeWithCertificate(principal, diet, certificateId)` 开仓，新仓位直接继承该凭据的起始倍数（对应提前量 $\text{head} = \text{multiplier} - 1$），并豁免 `minStake` 门槛限制；仓位存续期间凭据独占锁定（`inUse == true`），退出时释放凭据；凭据开出的仓位严禁再次嵌套铸造新凭据；
   - **硬顶上限与一次性开放**：全网硬顶 9,999 枚；部署后默认关闭，由 Governor 多签决定何时一次性开放，开放后不可关闭；没有自动解锁或链上最短等待期；
   - **全链上 SVG 动态渲染**：全套证书元数据与矢量图形完全由链上渲染器（`SeniorityCertificateRenderer.sol`）与字节码字体库（`CertificateData.sol`）纯链上动态计算生成，元数据属性为起始倍数（`Starting multiplier`）与使用状态（`Status`），零依赖中心化服务器或 IPFS。

---

## 5. 路由执行、预言机与偿付性记账 (Execution & Solvency Accounting)

### 5.1 双重负债结算体系 (Dual-Liability Accounting)

[`RewardDistributor.sol`](../contracts/src/RewardDistributor.sol#L125-L135) 独立维护两本会计负债账簿：
* **代币资产负债（`liability[asset]`）**：D18{tok} 维度，记录成功市价兑换的底层奖励资产应付额；
* **保底报价负债（`quoteLiability[asset]`）**：D18{quote} 维度，记录触发回退或原生 WBNB 路由的应付额。

#### 批次定价公式
当路由合约从市场完成代币兑换后，调用 `finalize()` 录入兑现费率：

$$\text{BatchRate} = \left\lfloor\frac{\text{TokensReceived} \cdot \text{RAY}}{\text{ClaimablePot}}\right\rfloor$$

当某个资产因流动性缺失、价格异常或交易超时达到停牌时间（`pendingAge > maxPendingAge`，默认 3 天）时，任何人均可无许可调用 `fallbackFinalize()`。转出的 quote 总额按一比一记入 BNB 回退负债；但单个领取者的批次费率仍以扣除放弃额后的 `claimablePot` 为分母，因此只有该区间不存在放弃额时才恰好等于 `RAY`。

### 5.2 链上 TWAP 读取器与执行边界

协议不依赖由独立管理员签名的价格源，但仍会部署自定义预言机读取合约，并依赖底层池子的流动性与完整性：
1. **FATCAT 毕业交易对**：[`PancakeV2TwapOracle.sol`](../contracts/src/PancakeV2TwapOracle.sol) 在分离的时间点读取 PancakeSwap V2 累计价格（`price0CumulativeLast` 与 `price1CumulativeLast`，UQ112x112·s 维度）并计算 TWAP；
2. **代币化美股（bStock）**：[`PancakeV3TwoHopTwapOracle.sol`](../contracts/src/PancakeV3TwoHopTwapOracle.sol) 对配置池执行时间加权流动性核验。该检查提高操纵成本，但不能保证价格绝对不可操纵；
3. **滑点保护硬界**：路由器执行前严格校验 `minOut`：
   $$\text{protocolMinOut} = \left\lfloor\frac{\text{expectedOut} \cdot (10000 - \text{maxDeviationBps})}{10000}\right\rfloor$$
   调用者仅可进一步收紧该阈值，严禁放宽。

### 5.3 保守舍入与经过测试的偿付性不变量

在 Solidity 整数除法中，操作符 `/` 严格执行向零向下截断：

$$\forall a, b \in \mathbb{N}^+, \quad \left\lfloor \frac{a}{b} \right\rfloor \le \frac{a}{b}$$

对于单个批次，设采购所得资产为 $R$、可领取 quote 池为 $S$，第 $i$ 位领取者的 quote 应得额为 $x_i$，且 $\sum_i x_i\le S$。定标后的批次费率与领取额为：

$$\text{Rate}=\left\lfloor\frac{R\cdot\text{RAY}}{S}\right\rfloor,\qquad r_i=\left\lfloor\frac{x_i\cdot\text{Rate}}{\text{RAY}}\right\rfloor$$

在这些前提下：

$$\sum_{i} r_i \le R$$

这是偿付性设计所要求的舍入方向，但仅凭该不等式还不够。批次守恒、负债更新、精确到账和受支持代币假设也必须成立。实现对最终 D1 不变量进行了测试（[`contracts/doc/SECURITY_PROPERTIES.md`](../contracts/doc/SECURITY_PROPERTIES.md#L69)）：
* $\text{balanceOf}(\text{Distributor}, a) \ge \text{liability}[a]$
* $\text{balanceOf}(\text{Distributor}, \text{quote}) \ge \sum_a \text{quoteLiability}[a]$

在受支持的精确到账代币模型内，实现的设计目标及不变量测试结果是：物理储备不低于已记录负债。部分批次守恒和混合舍入性质仍属于文档假设或定向测试范围，而非形式化证明；属性状态表是覆盖范围的唯一权威口径。

此外，合约通过 [`RewardDistributor.claimNative()`](../contracts/src/RewardDistributor.sol#L928-L960) 提供原生代币自动解包（Unwrap），在保障 WBNB 内部记账一致性的同时，为普通散户免去手动解包的繁琐摩擦。

---

## 6. 外部信任假设与安全边界 (Security Posture & Dependencies)

### 6.1 受限权限金库设计（无管理提款、Sweep 或 Rescue）

1. **The Belly**：设有不可变 governor 与 guardian，治理多签由独立的 2-of-3 Gnosis Safe 担任。两者均可暂停出流，仅 governor 可恢复并完成一次性延迟 spender 激活；运维多签（Ops Safe）则仅用于原子接收 5/36 的固定运维收入，无任何协议管理特权。任何角色都没有管理提款、Sweep、Rescue 或更换已激活 spender 的路径。激活后仅 [`ExecutionRouter.sol`](../contracts/src/ExecutionRouter.sol) 可在窗口额度内拉取资金；
2. **StakingVault**：本金赎回函数 `redeem()` 刻意忽略 `paused`。其暂停状态只限制新建质押，不会暂停 `setDiet`，也不会停止 `IntervalController` 中任何人均可调用的时钟推进，更无法阻断本金赎回。

### 6.2 交易税处理器外部归属与运维监控

* **不可抗力边界**：在 BNB Chain 上，独立的交易税处理器在代币毕业后仍归 Flap 工厂系统所有，并保留可变路由权限。FATCAT 代币克隆体的实现指针不可变，是另一项彼此独立的性质。根据链上已验证源码，税收在毕业后有效 100 年（到期自动永久免税），且一年防抢跑期过后仅对主底池征税；
* **运维检测**：协议提供 [`watch-processor.sh`](../contracts/ops/watch-processor.sh)，轮询 8 个与路由相关的核心只读函数（收款方地址、费率、工厂指针与路由绑定等）。检测延迟与可用性取决于外部监控、RPC 和通知基础设施；合约本身不保证 24/7 在线或第一区块报警；
* **风险物理隔离**：Flap 的路由权限没有进入质押金库的提款路径，因此直接托管风险在未来手续费流，而不是已记录本金。上游变化仍会影响交易经济与未来奖励。

### 6.3 默认资产选择逻辑与现实世界资产风险隔离

在多资产餐单（MENU）中：
1. **BNB 为不可动摇的默认与回退资产（Default & Fallback Diet）**：
   在 [`SeniorityLedger.sol`](../contracts/src/SeniorityLedger.sol#L90) 与 [`RewardAssetRegistry.sol`](../contracts/src/RewardAssetRegistry.sol#L146) 中，`defaultAsset` 与 `fallbackAsset` 不可变绑定为 WBNB。恒等路由无需额外市场交易，也不承受 bStock 的 RWA 发行方/托管方风险；普通智能合约与 BNB Chain 系统风险仍然存在；
2. **代币化美股（bStock）的信用隔离**：
   代币化股票承载现实世界机构的托管与升级风险。协议以 5% 观察期额度上限限制而非消除该风险；卡住的采购池可通过无许可回退以 quote 结算，该路径不会清算 bStock；
3. **FATCAT 毕业后增补上架**：
   FATCAT 首发于 Flap 联合曲线上，初期无 AMM 深度。只有在毕业注入 PancakeSwap V2、完成路由验证且 TWAP 预热后，治理才可通过 3 天标准队列将其加入餐单；上架并非自动发生。

### 6.4 创世启动时序与两道独立的七天闸门 (Genesis Launch Sequence & Dual-Gate Cold Start)

税收接收、质押合约部署与开放质押是三个独立事件。七天计奖时钟从一次性的“开放质押”交易开始，不从部署或毕业开始：

```
[ Flap 代币发射 ] ──► [ 税收进入 Belly；质押合约可提前部署但保持关闭 ]
                              │
                 Governor 提前开放 或 毕业后任何人触发开放
                              ▼
                         [ 开放质押 ]
                              │ 整整 7 天：奖励分配为 0
                              ▼
                    [ 第 8 天：开始计奖 ]
                              │ 后续周期推进、路线结算
                              ▼
                        [ 可领取奖励 ]

独立闸门：Belly Spender 提案 → 7 天时间锁 → Governor 激活。
```

1. **代币发射与税收接收**：FATCAT 先在 Flap 联合曲线上交易。转发金库将创作者收益送入 Belly；这不依赖质押合约是否已部署或开放。此后 Flap 可将流动性迁移至 PancakeSwap V2，毕业后的税收仍继续；
2. **提前部署、默认关闭**：代币发射且初始奖励路线完成审查后，生产质押合约可在毕业前部署。金库接受 Flap 状态 0–4，但部署时禁止质押和周期推进，`stakingOpenedAt = rewardStartAt = 0`；
3. **一次性开放质押**：毕业前只有 Governor 可调用 `vault.openStaking()` 提前开放；Flap `state()` 达到毕业后的 2–4 时，任何人都可在仍关闭的情况下触发开放。该交易同时开放质押并固定 `rewardStartAt = stakingOpenedAt + 7 天`。若选择提前开放，第八天可能早于 Flap 毕业；FATCAT 作为奖励资产仍要等待毕业、路线验证和预言机预热；
4. **两道独立的七天闸门**：从质押开放起整整七天，仓位资历与税收储备可累积，但奖励分配量为零，之后不追溯补发。治理方另行提议 Router 为 Belly Spender，其七天时间锁从提案而非质押开放开始，激活可能更晚；
5. **周期结算与可领取分红**：达到 `rewardStartAt` 只会自动改变计奖资格，不会自动发交易或在该秒到账。首笔可领取奖励仍需此后一个含有效计奖时间的周期被 `advance()` 结算、Belly Spender 已激活，并完成对应奖励路线执行或回退结算；Keeper 应持续运行，但链上交易的出块时间不能保证精确到秒。

---

## 7. 测试、验证与免责声明 (Verification & Disclaimers)

### 7.1 可复现测试证据

仓库记录了多轮对抗性与操作面审查。测试总数会随 revision 与 RPC 端点变化，发布时必须附 commit、命令和证据工件，不能写成永恒不变的协议常数。本地非 fork 测试（`FOUNDRY_PROFILE=local forge test`）已通过；主网分叉结果仅对该次运行所固定的区块与 RPC 有效。

Foundry fuzz/invariant 与 Echidna 属于基于属性的测试，不等于形式化验证。权威覆盖矩阵是 [`contracts/doc/SECURITY_PROPERTIES.md`](../contracts/doc/SECURITY_PROPERTIES.md)：`[F]` 表示已编码进有状态属性测试，`[T]` 表示定向测试，`[D]` 表示仅文档化，`[U]` 表示未强制假设。该矩阵并未把 B1–V5 的所有属性标为已执行或已证明。

### 7.2 确定性边界与非目标声明 (Non-Goals)

1. **绝非固定收益产品（Not a Fixed-Income Product）**：本协议不公布预期年化收益率（APY）。交易手续费是设计中的奖励来源，直接捐入的 WBNB 也会进入已识别余额；两条路径都不会增发奖励代币；
2. **绝非锁仓（Not a Lockup）**：在受支持代币按预期转账且调用成功的前提下，质押者可在任意区块赎回全部账面本金，仅放弃当前开放周期；
3. **绝无资金体量杠杆（Zero Superlinear Bias）**：门槛之上的本金按线性比例计权。资历是唯一非本金的加权输入，每完成一个活跃协议周期加一，最高为 22；它不产生复利；
4. **绝非养老金（Not a Pension）**：在 §2 的零流入、每八小时按时推进等假设下，理想模型半衰期约为 4.735 天，30 天后剩余约 1.24%。真实路径还受已预留负债、推进时点、上限、无效餐次与舍入影响。

---

## 附录 A：数学符号与量纲定义速查表 (Notation & Dimensions Index)

下表汇总协议数学推导与智能合约实现中所使用的核心变量、取值范围与量纲标度：

| 符号 | 语义定义与物理概念 | 取值范围 / 约束 | EVM 内部量纲与精度标尺 |
|---|---|---|---|
| $m$ | 全局离散时钟推进区间序号 | $\mathbb{N}^+$（自 1 递增） | 无量纲离散标量（`uint256`，步长为 1） |
| $j_i$ | 仓位 $i$ 的激活生效区间序号（`activeFrom`） | $j_i = m_{\text{stake}} + 1$ | 无量纲离散标量（`uint256`） |
| $p_i$ | 仓位 $i$ 的质押本金（Staked Principal） | $\ge 100,000$ FATCAT | D18{FATCAT}（$10^{18}$ 精度） |
| $c_i(m)$ | 仓位 $i$ 在区间 $m$ 的资历系数（Seniority Notch） | 闭区间整数 $[1, 22]$ | 无量纲标量（`uint256`） |
| $w_i(m)$ | 仓位 $i$ 在区间 $m$ 的有效权重（Effective Weight） | $p_i \cdot c_i(m)$ | D18{weight}（$10^{18}$ 精度） |
| $W(m)$ | 全网有效资历总权重（Total Active Weight） | $\sum_i w_i(m)$ | D18{weight}（$10^{18}$ 精度） |
| $W_{\text{open}}(a, m)$ | 资产 $a$ 在区间 $m$ 开启时锁定的有效点餐分母 | $\sum_{a \in \text{MENU}} W_{\text{open}}(a) = W(m)$ | D18{weight}（$10^{18}$ 精度） |
| $P_{\text{climb}}$ | 爬坡期仓位集合之本金标量和 | $\sum_{i \in \text{Climb}} p_i$ | D18{FATCAT}（$10^{18}$ 精度） |
| $J_{\text{climb}}$ | 爬坡期加权激活序数标量和 | $\sum_{i \in \text{Climb}} (p_i \cdot j_i)$ | D18{FATCAT}（$10^{18}$ 精度） |
| $P_{\text{settled}}$ | 满级成熟仓位集合之本金标量和 | $\sum_{i \in \text{Settled}} p_i$ | D18{FATCAT}（$10^{18}$ 精度） |
| $W_{\text{exiting}}$ | 当期中途赎回仓位的残余退出权重 | $\sum_{i \in \text{Exited}} w_i$ | D18{weight}（$10^{18}$ 精度） |
| $\text{RAY}$ | 前缀累加器定标精度基数（Ray Scale） | 常数 $10^{27}$ | D27（定点数定标基数） |
| $\omega_{a, m}$ | 资产 $a$ 在区间 $m$ 的单位权重收益率标量 | $\lfloor \text{Share}_{a,m} \cdot \text{RAY} / W_{\text{open}}(a,m) \rfloor$ | D27（`uint256`） |
| $A_{a, m}$ | 资产 $a$ 资历前缀累加器 A | $\sum_{k \le m} (1 + k) \cdot \omega_{a, k}$ | D27（`uint256` 前缀和） |
| $B_{a, m}$ | 资产 $a$ 资历前缀累加器 B | $\sum_{k \le m} \omega_{a, k}$ | D27（`uint256` 前缀和） |
| $\alpha$ | The Belly 单次基准释放系数 | $\frac{\text{WINDOW}}{T_{\text{week}}} = \frac{8}{168} = \frac{1}{21}$ | 无量纲常数分数（$\approx 4.7619\%$） |
| $B_k$ | 第 $k$ 次开席前 The Belly 可用余额 | $\text{accounted} - \text{outstandingClaims}$ | D18{quote}（标准 WBNB） |
| $\text{BatchRate}$ | 批次代币采购兑现费率（Batch Rate） | $\lfloor \text{TokensReceived} \cdot \text{RAY} / \text{ClaimablePot} \rfloor$ | D27（定点比率） |
| $\text{liability}[a]$ | 资产 $a$ 待领取代币会计负债 | $\ge 0$ | D18{tok}（底层奖励代币数量） |
| $\text{quoteLiability}[a]$ | 资产 $a$ 待领取保底报价资产会计负债 | $\ge 0$ | D18{quote}（标准 WBNB 数量） |

---

## 附录 B：Solidity 向下截断界与偿付性前提 (Rounding and Solvency Bounds)

### B.1 整数除法向零截断性质 (Integer Floor Division)
在 EVM 架构中，无符号整数除法 `/` 严格执行向零向下取整截断（Floor Division）：
$$\forall a, b \in \mathbb{N}^+, \quad \left\lfloor \frac{a}{b} \right\rfloor = \frac{a - (a \pmod b)}{b} \le \frac{a}{b}$$
截断舍入误差定义为 $\epsilon = \frac{a}{b} - \left\lfloor \frac{a}{b} \right\rfloor = \frac{a \pmod b}{b}$，严格满足 $0 \le \epsilon < 1$。

### B.2 单批次兑现残渣非负性定理 (Non-negative Dust Theorem)
**定理**：设单次批次采购获得的代币总额为 $R$（D18{tok}），可领取 quote 资金池为 $S$（D18{quote}）。第 $i$ 位领取者的有效 quote 应得份额为 $x_i$，且满足 $\sum_{i=1}^N x_i \le S$。在经过双重定标整数除法结算下，所有领取者提取的代币总和恒小于等于实际采购代币储备 $R$：
$$\sum_{i=1}^N r_i \le R$$

**证明**：
1. 合约记录的批次兑现费率定义为：
   $$\text{Rate} = \left\lfloor \frac{R \cdot \text{RAY}}{S} \right\rfloor$$
2. 任意第 $i$ 位领取者的实时代币提取额为：
   $$r_i = \left\lfloor \frac{x_i \cdot \text{Rate}}{\text{RAY}} \right\rfloor$$
3. 由整数向下截断的不等式性质，去除外层取整符号：
   $$r_i \le \frac{x_i \cdot \text{Rate}}{\text{RAY}}$$
4. 对全池 $N$ 位领取者求和：
   $$\sum_{i=1}^N r_i \le \sum_{i=1}^N \frac{x_i \cdot \text{Rate}}{\text{RAY}} = \frac{\text{Rate}}{\text{RAY}} \cdot \sum_{i=1}^N x_i$$
5. 代入 $\sum_{i=1}^N x_i \le S$ 与 $\text{Rate} \le \frac{R \cdot \text{RAY}}{S}$：
   $$\sum_{i=1}^N r_i \le \frac{\text{Rate} \cdot S}{\text{RAY}} \le \frac{\left( \frac{R \cdot \text{RAY}}{S} \right) \cdot S}{\text{RAY}} = R \quad \blacksquare$$

**推论（物理残渣沉淀）**：
每次兑现产生的微量舍入残渣 $\Delta_{\text{dust}} = R - \sum_{i=1}^N r_i \ge 0$ 永久沉淀于分发器合约中，合约物理代币余额恒大于等于名义负债（$\text{Balance} \ge \text{Liability}$）。

### B.3 偿付性前提与代币模型边界 (Preconditions & Scope)
上述超额储备数学不变量（属性 D1）严格建立在以下工程假设之上：
1. **标准代币行为**：奖励代币必须为标准 ERC-20 代币（转账无转账税 fee-on-transfer，无负向弹性重基准 negative rebase）；
2. **负债记账单调性**：`finalize()` 与 `fallbackFinalize()` 必须原子化单调递增负债，`claim()` 必须原子化递减负债并执行转账；
3. **分发器无所有者**：分发器无清扫或提款权限，物理残渣无法被管理员提走，从而消除资金被外部抽离导致资不抵债的通道。

---

## 附录 C：EVM Gas 消耗基准实测表 (On-Chain Gas Profiling)

在 Foundry 确定性本地测试环境（`FOUNDRY_PROFILE=local`）下，核心函数在不同网络规模与批次跨度下的实测 Gas 开销基准如下：

| 核心操作 / 接口调用 | 典型调用角色 | 理论时间复杂度 | 实测 Gas 消耗 (Gas Units) | 架构与工程特性说明 |
|---|---|---|---|---|
| `StakingVault.stake()`（首次开仓） | 普通用户 | $O(1)$ | ~142,500 | 包含首次开仓 ERC-20 转账、仓位记录与环形槽位初始化 |
| `StakingVault.stakeWithCertificate()` | 凭据持有者 | $O(1)$ | ~168,000 | 锁定凭据并带入历史起跑倍数，豁免最低质押门槛 |
| `StakingVault.redeem()`（赎回本金） | 普通用户 | $O(1)$ | ~125,600 | 100% 赎回本金，记入当期退出并归零仓位资历权重 |
| `StakingVault.redeemAndIssueCertificate()` | 普通用户 | $O(1)$ | ~189,000 | 赎回本金并转入 100k FATCAT 至死地址，链上铸造 ERC-721 凭据 |
| `StakingVault.setDiet()` | 普通用户 | $O(1)$ | ~68,400 | 用户更新指定仓位次周期生效的 DIET 指针与槽位转移，成本与网络规模无关 |
| `IntervalController.advance()` | 任意人 / Keeper | $O(M_{\text{assets}})$ | ~185,000（基准 5 资产） | 推进时钟、环形缓冲区槽位常数移库；**开销与全网质押总人数 $N$ 严格无关** |
| `RewardDistributor.claim()`（单批次） | 普通用户 | $O(1)$ | ~88,300 | 提取单个已完成批次的代币奖励并更新仓位负债记账 |
| `RewardDistributor.claim()`（10 批次） | 普通用户 | $O(K)$ | ~164,800 | 跨越 10 个批次的线性累加提领；前缀差分为常数，循环消耗在批次遍历 |
| `RewardDistributor.claimThrough()` | 普通用户 | $O(K_{\text{bounded}})$ | ~195,000（分段上限） | 面对长期积压时提供有界分段提取，彻底消除区块 Gas 溢出风险 |
| `RewardDistributor.claimNative()` | 普通用户 | $O(K) + \text{Unwrap}$ | ~112,000（单批次） | 在内部保持 WBNB 一致记账的同时，自动为用户解包为原生 BNB 转账 |

---

## 附录 D：已验证主网合约组件清单 (Verified Contracts Schedule)

以下为 TheFatCat 部署于 BNB Chain 主网的核心合约矩阵架构，主网部署完成后将在此回填不可变十六进制地址与 BscScan 开源验证链接：

| 组件名称 (Component) | 部署网络 (Network) | 目标合约地址 (Contract Address) | 状态与验证说明 (Verification & Role) |
|---|---|---|---|
| **FATCAT 代币 (Token)** | BNB Chain 主网 | `0x... (待部署回填)` | 10 亿枚固定总量，无预留，不可变 BEP-20 实现指针 |
| **PancakeSwap V2 底池** | BNB Chain 主网 | `0x... (待毕业回填)` | 毕业后流动性交易对 (`FATCAT/WBNB`)，提供累计价格累加器 |
| **Flap 分账金库 (FatCatStakingVault)** | BNB Chain 主网 | `0x... (待部署回填)` | Flap V3 税收路由器；增量结算包装为 WBNB，分流 5/36 至运营 Safe，31/36 注入 Belly |
| **Flap 分账工厂 (FatCatStakingVaultFactory)** | BNB Chain 主网 | `0x... (待部署回填)` | 部署 Beacon 实例对接 Flap VaultPortal 系统的专属工厂 |
| **动力学金库 (The Belly)** | BNB Chain 主网 | `0x... (待部署回填)` | 指数阻尼蓄水池，窗口释放硬顶 $\le 16/168$，单次一次性 Spender 绑定 |
| **质押金库 (StakingVault)** | BNB Chain 主网 | `0x... (待部署回填)` | 隔离质押本金托管，100k 门槛，集成证书加成，`redeem()` 绝不响应暂停 |
| **闭式资历账本 (SeniorityLedger)** | BNB Chain 主网 | `0x... (待部署回填)` | $O(1)$ 闭式标量代数展开，22 槽位环形缓冲区，RAY 定标双前缀累加器 |
| **时钟控制器 (LaunchIntervalController)** | BNB Chain 主网 | `0x... (待部署回填)` | 生产时钟驱动引擎（$\ge 8$ 小时间隔），内嵌 7 天物理绝对冷启动蓄水窗口 |
| **创世奖励注册表 (InitialRewardAssetRegistry)** | BNB Chain 主网 | `0x... (待部署回填)` | 生产 MENU 白名单注册表，创世菜单签署豁免 5% 观察期额度上限 |
| **执行路由器 (ExecutionRouter)** | BNB Chain 主网 | `0x... (待部署回填)` | 永久单次绑定路由器，TWAP 防夹滑点保护市价批量兑换与回退兜底 |
| **奖励分发器 (RewardDistributor)** | BNB Chain 主网 | `0x... (待部署回填)` | 双重负债独立核算，严格向下取整超额储备保障定理 |
| **资历证书 (SeniorityCertificate ERC-721)** | BNB Chain 主网 | `0x... (待部署回填)` | 创世退出凭证；硬编码销毁 100k FATCAT 铸造，9,999 枚硬顶，由 Governor 多签一次性开放铸造，全链上 SVG |
| **证书渲染器 (SeniorityCertificateRenderer)** | BNB Chain 主网 | `0x... (待部署回填)` | 纯链上 SVG 动态生成器，实时计算排版矢量图形元数据 |
| **证书数据存储 (CertificateData)** | BNB Chain 主网 | `0x... (待部署回填)` | 纯字节码存储容器，内置压缩矢量字体与美术资源包 |
| **V2 TWAP 预言机 (PancakeV2TwapOracle)** | BNB Chain 主网 | `0x... (待部署回填)` | 读取 V2 Pair 价格累加器计算时间加权均价保护滑点 |
| **V3 路由适配器 (PancakeV3Adapter)** | BNB Chain 主网 | `0x... (待部署回填)` | 生产级执行适配器，支持跨 PancakeSwap V3 多跳流动性池市价兑换 |
| **V3 两跳 TWAP 预言机 (PancakeV3TwoHopTwapOracle)**| BNB Chain 主网 | `0x... (待部署回填)` | 两跳 V3 TWAP 预言机 (WBNB -> USDT -> bStock) 计算美股代币均价 |

---

## 附录 E：白帽负责任披露与安全通道 (Responsible Disclosure)

TheFatCat 核心团队将智能合约与用户资金安全置于绝对首位。我们欢迎全球安全研究员、白帽黑客与审计团队对协议代码进行独立审查与渗透测试：

1. **官方安全通报通道**：  
   请通过 [GitHub 私密安全通报通道](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new) 提交漏洞详情。
2. **安全通信与加密要求**：  
   在提交涉及资金安全、逻辑漏洞或越权风险的敏感技术细节时，亦可使用官方 PGP 密钥进行加密投递（PGP 密钥指纹将于主网部署时在官方 GitHub 与官网安全板块公布）。
3. **查阅与反馈机制**：  
   - **定期查阅与快速反馈**：安全团队将定期查阅提报的漏洞报告，并在核实后快速向报告者提供进度反馈；
   - **负责任披露公约**：在补丁完成开发、测试验证并通过治理安全迁移流程完成部署前，双方共同遵守严格的信息保密原则。
4. **白帽感谢与奖励**：  
   协议虽然不设机械化的固定金额赏金清单，但针对经过验证的严重（Critical）与高危（High）漏洞，治理多签将根据漏洞影响范围与推导质量，由 Ops 多签运营资金池酌情向报告人颁发去中心化感谢奖励。协议采用不可变代码架构，若需执行重大架构修复，治理多签将协同发布安全迁移与新合约部署指引。

---

*版权所有 © 2026 TheFatCat 协议核心贡献者。代码即法律，算术归大众。*
