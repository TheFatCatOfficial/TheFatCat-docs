---
layout: default
title: 核心底层架构不变量
parent: 核心定义与符号体系
nav_order: 3
---

# 核心底层架构不变量 (Core Architecture Invariants)

TheFatCat 系统的每一个子模块均受制于经过全套差分与状态模糊测试严密验证的代数不变量：

1. **本金绝对隔离不变量 (`StakingVault.sol`)**：
   $$\text{balanceOf}(\text{StakingVault}) \ge \sum_{i \in \text{Stakers}} p_i$$
   质押本金金库与外部交易税收完全绝缘，零税款流入，零管理扫仓特权。本金赎回接口（`redeem()`）永久绕过暂停机制，在任何极端环境下均保障用户的自由提款权。

2. **离散比例限速不变量 (`Belly.sol`)**：
   $$\text{Emission}(m) \le U(m) \times \frac{\min(\Delta t, 16\text{h})}{168\text{h}}$$
   金库绝不允许在单笔交易或单个区块内将积累资金 100% 倾倒。资金释放速率由以 168 小时（1周）为时间基准的一阶指数阻尼物理算子严格决定。

3. **常数级时间计算不变量 (`SeniorityLedger.sol`)**：
   $$\text{GasCost}(\text{advance}()) = \mathcal{O}(|\mathcal{A}|), \quad \text{与全网质押人数 } N \text{ 绝对无关}$$
   餐次推进状态机彻底消除了任何针对个体用户的循环遍历。全局总权重通过标量前缀和在常数时间内闭式求解。

4. **非负粉尘超额偿付不变量 (`RewardDistributor.sol`)**：
   $$\sum_{i} \text{claimable}_i(a) \le \text{liability}(a) \le \text{balanceOf}(a)$$
   在分红计算中，由于整除截断产生的数学粉尘一律向下取整（不利于申领方），整数余数永久沉淀在分发金库内，从数学底层保证协议净资产恒大于或等于总用户负债。
