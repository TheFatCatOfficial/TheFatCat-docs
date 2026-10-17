---
title: 项目介绍
layout: default
nav_order: 1
---

# TheFatCat 文档中心

TheFatCat 是一个实验性 DeFi 收入协议，将 Meme 文化与交易税路由机制结合在一起。

质押 `$FATCAT`，按时间资历系数获得 BNB、bStocks 或精选 Meme 代币奖励。

[代币发射与功能开放流程]({% link zh/guides/launch-stages.md %})：了解三个开放阶段与全协议统一的七天积累期。

## 使用文档

- [质押指南]({% link zh/guides/staking.md %})
- [选择奖励资产]({% link zh/guides/diets-and-claiming.md %}#2-如何切换食谱)
- [领取奖励]({% link zh/guides/diets-and-claiming.md %}#3-领取已结算奖励)
- [紧急退出说明]({% link zh/guides/emergency-exit.md %})
{: .tfc-start-links }

## 运行方式

- **收入与分配**：`$FATCAT` 的 4% 交易税以 QQQB 接收。扣费、兑换及扣除已产生的推动奖励后，净 WBNB 的 85% 进入 Belly，15% 用于项目开发、运营和营销。正常 8 小时餐次最多分配未预留资金的 1/21；分配本身不转移资金。
- **质押权重**：最低开仓本金为 100,000 `$FATCAT`。普通仓位从下一餐生效，时间资历系数从 1× 起步，每个有效餐次增加 1×，最高 22×。仓位权重 = 本金 × 时间资历系数 × 当前资产的激励系数。
- **结算与领取**：采购按全局餐次顺序推进，并检查价格和流动性。符合回退条件的失败采购可用 WBNB 结算。已结算奖励可以保留并领取，待采购奖励可能延迟。
- **退出**：普通赎回无退出费，且不检查协议暂停标记。退出后停止未来计权，并放弃进行中餐次尚未结算的权益；此前已结算的奖励保留。

## 进一步了解

- **维护**：[FEED 机制与去中心化维护]({% link zh/guides/community-keeper.md %})

- **机制**：[机器如何运转]({% link zh/protocol/how-the-machine-runs.md %})、[Belly 分配]({% link zh/protocol/belly.md %})、[资历]({% link zh/protocol/meals-and-seniority.md %})、[执行]({% link zh/protocol/execution.md %})、[费用]({% link zh/protocol/fees.md %})

- **架构**：[拓扑]({% link zh/topology.md %})、[定义]({% link zh/definitions.md %})、[设计背景]({% link zh/background.md %})

- **风险与核验**：[安全]({% link zh/safety.md %})、[风险边界]({% link zh/safety/risks-and-status.md %})

- **参考**：[FAQ]({% link zh/faq.md %})、[白皮书]({% link zh/whitepaper.md %})、[声明]({% link zh/notices.md %})、[官方链接]({% link zh/links.md %})

## 限制与部分未来路线图

奖励取决于实际收入、维护和市场执行，不承诺固定收益。TWAP 检查限制执行条件，不能消除 MEV、代币、发行方或流动性风险。链可用性与代币行为也会影响退出和领取。

[时间资历凭证]({% link zh/guides/seniority-certificates.md %})会在协议成熟的时机推出。
