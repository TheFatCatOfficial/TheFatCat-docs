---
layout: default
title: 核心机制深度解析
nav_order: 7
has_children: true
---

# 核心机制与数学规范

深度剖析支撑 TheFatCat 协议运行的工程原理、代数闭式解公式与链上状态机。

---

## 机制索引

- **[The Belly 动态释放机制]({% link zh/protocol/belly.md %})**：一阶指数平滑储备模型、离散餐次释放比例、半衰期衰减轨迹与 7-窗口安全限额。
- **[餐次周期与资历阶梯]({% link zh/protocol/meals-and-seniority.md %})**：8 小时离散时钟、22-槽位闭合环形缓冲区、$O(1)$ 标量权重聚合算法与资历溢价边界。
- **[批量撮合与资产执行]({% link zh/protocol/execution.md %})**：权益核算与市场兑换的解耦模型、链上 TWAP 滑点保护与免许可报价保护。
- **[费用流向拓扑与费率]({% link zh/protocol/fees.md %})**：4% 动态交易税、Flap 平台代扣费用、分账金库分配（3/19 运营 vs. 16/19 Belly 金库）与 100 年代币税生命周期。
