---
layout: default
title: 理论与数学架构摘要
parent: 学术白皮书
nav_order: 2
---

# 理论与数学架构摘要

TheFatCat 官方白皮书（v1.0）核心数学突破与理论模型摘要：

---

## 1. The Belly 指数平滑储备池动力学
基于免许可的离散餐次时钟运行（$\Delta t \ge 8\text{h}$）。每期平滑释放未保留计价资金余额的 $\alpha = 8/168 = 1/21 \approx 4.7619\%$，在理想零外部流入模型下的理论半衰期为 4.735 天。资金外流速率受到单窗口 $16/168 \approx 9.5238\%$ 的严格物理限制，即使遭遇顶格连续提取，消耗 50% 储备也需要至少 7 个独立窗口期（48 至 56 小时）。

---

## 2. $O(1)$ 闭式解资历账本（SeniorityLedger）
线性代数正交分解将质押者群体拆分为攀爬中仓位（$m - j_i < 21$）与沉淀满级仓位（$m - j_i \ge 21$），在 $O(1)$ 标量算术下求解全局总有效权重：

$$W(m) = (1 + m) P_{\text{climb}} - J_{\text{climb}} + 22 P_{\text{settled}} + W_{\text{exiting}}$$

资历毕业由 22-槽位闭合环形缓冲区高效管理。通过基于 $\text{RAY} = 10^{27}$ 高精度的双重前缀累加器（$A_{a, m}, B_{a, m}$），在常数 Gas 下实现跨历史周期的秒级分红结算。

---

## 3. 主权食谱代币自选（Sovereign Diets）
每个仓位独立指定偏好的分红资产。在代数层面，用户应得分红比例直接满足：

$$\text{Share}_{i, a} = Q_{\text{total}} \cdot \frac{w_i}{W_{\text{total}}}$$

---

## 4. 已验证的超额偿付能力不变量
保守的整除向下取整截断算法在数学层面保证了绝对的去中心化偿付安全：

$$\sum_{i=1}^N r_i \le R, \quad \Delta_{\text{dust}} = R - \sum_{i=1}^N r_i \ge 0$$

合约的双重负债（`liability[asset]` 与 `quoteLiability[asset]`）始终被物理金库储备 100% 充盈覆盖。
