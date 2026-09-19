---
layout: default
title: 安全性与治理设计
nav_order: 6
has_children: true
---

# 安全性与治理架构设计

全面审视 TheFatCat 的非托管金库不变量、链上偿付能力数学证明以及常态化运行监控体系。

---

## 安全索引

- **[金库托管与偿付能力证明]({% link zh/safety/custody.md %})**：无特权金库、零管理员扫仓/提取接口、以及非负粉尘数学定理（$\sum r_i \le R$）。
- **[运行监控与应急机制]({% link zh/safety/monitoring.md %})**：上游税收处理器核心指标监控、守护者多签与紧急响应机制。
- **[风险披露与上线前状态]({% link zh/safety/risks-and-status.md %})**：重大外部依赖、预言机信任模型与主网上线检查清单。
