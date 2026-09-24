---
layout: default
title: 形式化代数符号表
parent: 核心定义与符号体系
nav_order: 1
---

# 形式化代数符号表 (Notation Table)

下表定义了全站协议规范、智能合约接口注释及审计证明中采用的权威数学符号：

| 代数符号 | 概念全称 | 量纲 / 单位 | 严格定义与作用域 |
|:---|:---|:---|:---|
| $m$ | **离散记账餐次序号** | 离散自然数 $\mathbb{N}$ ($m \ge 0$) | 已结算周期的全局计数器（每周期 $\ge 8\text{h}$）；由免许可接口 `advance()` 触发递进。 |
| $t$ | **区块时间戳** | 秒 ($\text{s}$) | EVM 原生区块时间戳 `block.timestamp`。 |
| $\Delta t$ | **周期已流逝时间** | 秒 ($\text{s}$) | $\Delta t = t - t_{\text{lastAdvance}}$，底层门禁强制要求 $\Delta t \ge 28,800\text{ s}$（即 8 小时）。 |
| $p_i$ | **质押锁仓本金** | $D18\text{ \{FATCAT\}}$ | 仓位 $i$ 存入 `StakingVault.sol` 的 FATCAT 代币数量（满足开仓门槛 $p_i \ge 100,000 \cdot 10^{18}$）。 |
| $j_i$ | **仓位激活餐次序号** | 离散自然数 $\mathbb{N}$ | 仓位 $i$ 开始计入权重的有效起始餐次：$j_i = m_{\text{stake}} + 1$。 |
| $c_i(m)$ | **时间资历乘数系数** | 无量纲标量 ($[1, 22]$) | 单调加法时间乘数：当 $m \ge j_i$ 时，$c_i(m) = \min(1 + m - j_i, 22)$。 |
| $w_i(m)$ | **仓位有效资历权重** | $D18\text{ \{weight\}}$ | 仓位在餐次 $m$ 的实际加权权重：$w_i(m) = p_i \cdot c_i(m)$。 |
| $W(m)$ | **全局活跃总资历权重** | $D18\text{ \{weight\}}$ | 全网所有在席活跃仓位权重之和：$W(m) = \sum_{i \in \text{Active}(m)} w_i(m)$，以 $O(1)$ 常数计算。 |
| $\mathcal{B}$ | **The Belly 储备金库** | 智能合约实体 | 托管计价货币（WBNB）的无特权限速蓄水池（`Belly.sol`）。 |
| $B(t)$ | **金库已确认计价存量** | $D18\text{ \{WBNB\}}$ | 在时间戳 $t$ 时 The Belly 账面确认的 WBNB 总储备存量。 |
| $L(t)$ | **累计已保留负债额** | $D18\text{ \{WBNB\}}$ | 包含处理中采购批次、待结算申领及未敲定餐次在内的已冻结计价资金总额。 |
| $U(m)$ | **未保留可用净额** | $D18\text{ \{WBNB\}}$ | 可供本期进行平滑比例释放的净资金：$U(m) = \max(0, B(t) - L(t))$。 |
| $a \in \mathcal{A}$ | **分红资产标的** | 合约地址 (`address`) | 经 `InitialRewardAssetRegistry.sol` 授权准入的白名单分红资产。 |
| $W_a(m)$ | **资产组合计权总和** | $D18\text{ \{weight\}}$ | 在餐次 $m$ 中，所有指定资产 $a$ 作为产出标的的质押仓位权重之和。 |
| $A_a(m)$ | **资产分配预算额度** | $D18\text{ \{WBNB\}}$ | 在餐次 $m$ 中，分配给资产标的 $a$ 用于链上批处理采购的净计价资金。 |
| $\text{deviationBps}$ | **价格偏离容忍阈值** | 基点 ($10^{-4}$) | 由 `ExecutionRouter.sol` 强制执行的 TWAP 滑点保护门槛（默认 200 bps = 2.0%）。 |
| $\text{protocolMinOut}$ | **协议执行保底底线** | 资产最小单位 ($D_{\text{asset}}$) | 市场兑换的最低保底产出：$\lfloor \text{expectedOut} \cdot (10000 - \text{deviationBps}) / 10000 \rfloor$。 |
