---
layout: default
title: 系统拓扑与资金流
nav_order: 3
has_children: true
---

# 系统拓扑与资金流转架构

全面剖析 TheFatCat 的资金流动路径、智能合约状态机模型以及生命周期状态迁移。

---

## 章节导览

系统了解 TheFatCat 的端到端资金管线与确定性状态引擎：

- **[双轨资产拓扑与金库隔离]({% link zh/topology/asset-flows.md %})**：DEX 二级市场交易税收、原子级分账金库（5/36 协议运营 vs 31/36 The Belly 储备池）以及质押本金金库与分红金库的严格物理绝缘。
- **[离散状态机与餐次推进时钟]({% link zh/topology/state-machine.md %})**：确定性 8 小时餐次时钟、免许可推进机制、边界权重代数锁定与 22-槽位闭合环形缓冲区常数级步进。
- **[资产采购与分红分发管道]({% link zh/topology/claim-pipeline.md %})**：防 MEV 链上批量兑换撮合、TWAP 滑点保护、双重负债结算会计与原生 BNB 自动解包极速提取。
