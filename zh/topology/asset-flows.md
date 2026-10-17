---
layout: default
title: 资产流向
parent: 系统拓扑与资金流
nav_order: 1
---

# 资产流向

TheFatCat 将质押本金与交易税奖励资金分别保管。下图展示从收入进入协议到仓位领取奖励的主要路径：

![TheFatCat 协议资金流向]({{ '/assets/images/fig1-topology.zh.svg' | relative_url }}?v=20261017u1)

[查看完整图（新标签页）]({{ '/assets/images/fig1-topology.zh.svg' | relative_url }}?v=20261017u1){:target="_blank" rel="noopener noreferrer"}
{: .tfc-figure-link }

---

## 1. QQQB 税费流入

符合条件的 `$FATCAT` 交易适用配置的 4% 交易税。Flap 扣除平台费用后，QQQB 税收收入进入协议的收入处理环节。毕业后税费按批次清算，并非每笔交易都会立即形成 Belly 流入；实际费率和收款情况以官方部署记录及链上交易为准。

---

## 2. 双路由兑换与收入分配

{% capture diagram_content %}QQQB 税收收入 → 双路由兑换与价格检查 → WBNB
  → 符合条件的 FEED 兑换：先记本次产出的 1/38 为推动奖励
  → 其余净收入：85% 进入 Belly 奖励金库
                15% 用于项目开发、运营和营销{% endcapture %}
{% include components/diagram-frame.html tag="ASSET FLOW" title="QQQB 税费兑换与收入分配" content=diagram_content %}

任何人都可在执行条件允许时通过 FEED 参与维护，官方维护可在需要时补充处理。参与者只付 Gas，无需提供自己的 QQQB；不能改变兑换路线或收入去向。成功兑换和收入分配在同一笔交易中完成，运营分账只扣一次。单独兑换不产生推动奖励。

后续推进或采购失败，不撤销已成功的 FEED 兑换和符合条件的推动奖励。85% / 15% 的计算基数为扣除上游费用、实际兑换成本及已产生推动奖励后的净收入，并非交易额。详见[税收路由与费用]({% link zh/protocol/fees.md %})和[FEED 机制与去中心化维护]({% link zh/guides/community-keeper.md %})。

上游收入处理及代操作服务存在升级和应急资金处置权限，可能影响未来收入和代操作行为。其权限与用户本金金库的边界不同，详见[托管与记账边界]({% link zh/safety/custody.md %})。

---

## 3. 本金与奖励分别保管

- **质押本金金库**：保管用户存入的 `$FATCAT` 本金，不用于交易税兑换或奖励采购。
- **Belly 奖励金库**：保管 WBNB 奖励储备，不具有提取用户质押本金的权限。
- **已结算奖励**：采购或回退完成后，按仓位记录供用户领取，与本金赎回分别处理。
