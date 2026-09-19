---
layout: default
title: 餐次周期与资历阶梯
parent: 核心机制深度解析
nav_order: 2
---

# 餐次周期与资历阶梯机制

揭秘 TheFatCat 如何利用 22-槽位闭合环形缓冲区与 RAY 精度双重前缀累加器，在 $O(1)$ 常数时间复杂度下追踪数以百万计的质押仓位。

---

## 1. 22-槽位毕业环形缓冲区（Graduation Ring Buffer）

在 EVM 交易中，若通过 `for` 循环遍历 $N$ 个质押者来累增资历，会瞬间打满区块 Gas 上限。TheFatCat 彻底消除了任何循环遍历，采用 **22-槽位闭合环形缓冲区（22-Slot Circular Graduation Ring）** 对质押群体进行代数分解：

![22-槽位毕业环形缓冲区架构]({{ '/assets/images/fig3-graduation-ring.svg' | relative_url }})

### 数学分组架构
在任意离散餐次 $m$，所有活跃仓位被代数拆分为两个集合：
1. **攀爬群体（Climbing Cohort）**（$m - j_i < 21$）：资历尚未达到 22 级的成长中仓位。
2. **沉淀群体（Settled Cohort）**（$m - j_i \ge 21$）：已完成满 21 次餐次晋升、达到满级 22 级的成熟仓位。

全局活跃总资历权重 $W(m)$ 仅需通过标量变量在 **$O(1)$ 常数 Gas 消耗下** 瞬时求解：

$$W(m) = (1 + m) P_{\text{climb}} - J_{\text{climb}} + 22 P_{\text{settled}} + W_{\text{exiting}}$$

其中：
- $P_{\text{climb}} = \sum_{i \in \text{Climb}} p_i$（所有攀爬中仓位的本金总和）
- $J_{\text{climb}} = \sum_{i \in \text{Climb}} (p_i \cdot j_i)$（加权激活起始餐次标量总和）
- $P_{\text{settled}} = \sum_{i \in \text{Settled}} p_i$（所有已达满级仓位的本金总和）
- $W_{\text{exiting}}$：在餐次中间提前赎回退出仓位的剩余权重。

当调用 `advance()` 推进时，当前槽位缓冲区 `graduatingPrincipal[m % 22]` 从 $P_{\text{climb}}$ 划入 $P_{\text{settled}}$，全过程仅涉及一条代数减法与加法，Gas 消耗与全网质押人数完全解耦。

---

## 2. 资历倍数与相对优势曲线

资历仅单调增加权重，绝不产生指数复利。下图展示了单调递增的资历台阶以及稳态下的相对优势倍数分布：

![资历倍数与相对优势曲线]({{ '/assets/images/fig4-seniority-premium.svg' | relative_url }})

### 资历档位与倍数阶梯
- **1 档（$1\times$）**：新激活的起始仓位（$j_i = m_{\text{stake}} + 1$）。
- **2 档至 21 档（$2\times \dots 21\times$）**：每度过一个活跃餐次，资历倍数严格以加法累增 $+1$。
- **22 档（$22\times$）**：完成 21 次完整餐次后达到满级封顶（在标准节奏下历时 7 天）。

### 实际实现的相对超额优势（$22 / \bar{c}$）
社区常有一种误解，以为达到 22 档就意味着永远比全池多赚 22 倍。在实际博弈中：

$$\text{沉淀群体实际相对优势} = \frac{22}{\bar{c}}, \quad \text{其中 } \bar{c} = \frac{\sum p_i c_i}{\sum p_i}$$

- **下限（$1\times$）**：在所有质押者均已满级（$\bar{c} = 22$）的稳态水池中，所有参与者完全按本金比例线性分红，资历溢价完全消退为 1.0x。
- **均匀分布稳态**：若未满级仓位在各档位之间呈均匀分布（$\bar{c} = 11.5$），满级老仓位的相对收益乘数约为 $22 / 11.5 \approx \mathbf{1.913\times}$。
- **理论上限（$22\times$）**：仅在与刚进场 1 档的新仓位进行单对单瞬时对比时才成立。

---

## 3. RAY 精度双重前缀累加器

为了在 $O(1)$ 复杂度下跨不同资历曲线结算收益，`SeniorityLedger` 维护了基于 $\text{RAY} = 10^{27}$ 高精度的双重前缀累加器：

$$A_{a, m} = A_{a, m-1} + (1 + m) \cdot \omega_{a, m}$$

$$B_{a, m} = B_{a, m-1} + \omega_{a, m}$$

其中 $\omega_{a, m} = \lfloor \text{Share}_{a, m} \cdot \text{RAY} / W_{\text{open}}(a, m) \rfloor$。

对于任意处于攀爬期、在餐次 $[j_i, k]$ 期间活跃的仓位 $i$，其累计应得的分红计价份额可通过标量代数在 $O(1)$ 复杂度下秒级求得：

$$\text{应得份额}_i = p_i \cdot \left[ (A_{a, k} - A_{a, j_i - 1}) - j_i \cdot (B_{a, k} - B_{a, j_i - 1}) \right] / \text{RAY}$$

对于满级 22 档仓位，算法更加精简，直接由本金乘以区间前缀差值 $\Delta B$ 再乘以常量 22 即可，消除了任何跨期历史循环。
