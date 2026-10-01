---
layout: default
title: 双轨术语映射对照
parent: 核心定义与符号体系
nav_order: 2
---

# 双轨术语映射对照 (Dual-Track Terminology)

为保持社区品牌文化与工程数学表达的紧密映射，协议确立了产品隐喻与智能合约底层组件的明确对应关系：

| 产品概念隐喻 (Meme Anchor) | 形式化工程术语 (Formal Term) | 智能合约对象 / 变量 | 代数符号 | 核心实现不变量 |
|:---|:---|:---|:---|:---|
| **The Belly (大肚皮)** | 限速国库蓄水池 (Rate-Limited Treasury) | `Belly.sol` | $\mathcal{B}$ | 绑定唯一提款路由（`ExecutionRouter`），无特权，零管理员扫仓。 |
| **Meal (餐次)** | 离散记账周期 (Accounting Interval) | `IntervalController.sol` | $m$ ($\Delta t \ge 8\text{h}$) | 仅在 $\Delta t \ge 8\text{h}$ 时推进；权益在离散边界代数锁定。 |
| **Diet (食谱/自选分红)** | 收益分红资产标的 (Output Reward Asset) | `RewardDistributor` 白名单 `asset` | $a \in \mathcal{A}$ | 质押者自主设定；WBNB 兜底；核算与链上兑换完全解耦。 |
| **Seniority (时间资历阶梯)**| 单调加法时间乘数 (Additive Multiplier) | `SeniorityLedger.sol` 档位 | $c_i(m) \in [1, 22]$ | 纯加法逐餐爬升（$+1/\text{餐}$）；22 档封顶；拒绝指数复利。 |
| **Graduation Ring (毕业环)** | 22-槽位环形队列缓冲区 (Cohort Ring Buffer) | `graduatingPrincipal[m % 22]` | $P_{\text{settled}}, P_{\text{climb}}$ | 标量聚合计算，状态转移保持 $O(1)$ 常数 Gas，解耦质押人数 $N$。 |
| **Forfeit (未结算惩罚没收)** | 退仓未敲定权益放弃 (Unfinalized Surrender)| `forfeitedWeight` | $W_{\text{exiting}}$ | 餐次中间退仓将放弃当前未结餐次的分配，自动沉淀为幸存者红利。 |
| **Belly 流出限额** | 单窗口外流熔断上限 (Outflow Throttle) | `Belly.release(amount)` | $\text{OutflowLimit}_m$ | 单个 8 小时窗口提取上限 $\le U(m) \times 16/168 \approx 9.5238\%$。 |
