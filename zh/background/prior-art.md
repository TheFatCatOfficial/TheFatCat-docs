---
layout: default
title: 相关机制与参考资料
parent: 背景与设计哲学
nav_order: 2
---

# 相关机制与参考资料

储备分配、时间权重和累计奖励索引解决不同问题。比较时需要一致的记账单位、参与边界和资产假设；使用相同的舍入操作，并不足以证明安全性等价。

| 主题 | TheFatCat 的方式 | 详情 |
|:---|:---|:---|
| 记账节奏 | 每餐至少八小时，每次推进最多结束一餐。 | [餐次规则]({% link zh/protocol/meals-and-seniority.md %}) |
| 仓位权重 | 本金乘以已积累的资历系数。 | [餐次与资历]({% link zh/protocol/meals-and-seniority.md %}) |
| 领取 | 已结算奖励记录保留各仓位的历史权益，供之后领取。 | [托管与记账]({% link zh/safety/custody.md %}) |
| 舍入 | 奖励整数计算向下取整，余数留在分发器。 | [核算约束]({% link zh/definitions/invariants.md %}) |
| 市场执行 | 采购检查 TWAP、流动性和最低输出，并提供有条件的 WBNB 回退。 | [执行]({% link zh/protocol/execution.md %}) |

## 参考资料

- [Curve 投票托管文档](https://curve.readthedocs.io/dao-vecrv.html)：锁定时长计入投票权重的参考。
- [Pendle 文档](https://docs.pendle.finance/)：协议机制及分版本的代币经济学。
- [Synthetix V3 概览](https://blog.synthetix.io/a-quick-explainer-on-synthetix-v3/)：资金池、抵押品和奖励分发器架构。

资料来源为公开路径，只描述各自系统。本项目不声称 TheFatCat 独一无二、比其他协议更安全或已经形式化验证。源码核对与测试结论都依赖被检查的版本和行为。
