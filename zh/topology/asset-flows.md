---
layout: default
title: 双轨资产拓扑与金库隔离
parent: 系统拓扑与资金流
nav_order: 1
---

# 双轨资产流转拓扑与金库隔离

TheFatCat 将质押本金与交易税奖励资金分别保管。下图展示从收入进入协议到仓位领取奖励的主要路径：

![TheFatCat 协议资金流向]({{ '/assets/images/fig1-topology.zh.svg' | relative_url }}?v=20261010u1)

---

## 1. QQQB 税费流入

合规 FATCAT 交易适用配置的 4% 交易税。Flap 扣除平台费用后，QQQB 税收收入进入协议的收入处理环节。毕业后税费按批次清算，并非每笔交易都会立即形成 Belly 流入；实际费率和收款情况以官方部署记录及链上交易为准。

---

## 2. 固定兑换与收入分配

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">ASSET FLOW</span>
    <span class="tfc-diagram-title">QQQB 税费兑换与收入分配</span>
  </div>
  <pre class="tfc-diagram-content"><code>QQQB 税收收入 → 沿固定路线兑换为 WBNB
  → 合资格 FEED 转换：先记本次产出的 1/38 为推动奖励
  → 其余净收入：85% 进入 Belly 奖励国库
                15% 用于项目开发、运营和营销</code></pre>
</div>

任何人都可在执行条件允许时通过 FEED 参与维护，官方维护可在需要时补充处理。参与者只付 Gas，无需提供自己的 QQQB；不能改变兑换路线或收入去向。成功转换和收入分配在同一笔交易中完成，不重复扣取运营分账。独立转换不产生推动奖励。

后续推进或采购失败，不撤销已成功的 FEED 转换和合资格推动奖励。85%／15% 的计算基数为扣除上游费用、实际兑换成本及已产生推动奖励后的净收入，并非交易额。详见[税收与费用]({% link zh/protocol/fees.md %})和[FEED 机制]({% link zh/guides/community-keeper.md %})。

上游收入处理及代操作服务存在升级和应急资金处置权限，可能影响未来收入和代操作行为。其权限与用户本金金库的边界不同，详见[托管与记账边界]({% link zh/safety/custody.md %})。

---

## 3. 本金与奖励分别保管

- **质押本金金库**：保管用户存入的 FATCAT 本金，不用于交易税兑换或奖励采购。
- **Belly 奖励国库**：保管 WBNB 奖励储备，不具有提取用户质押本金的权限。
- **已结算奖励**：采购或回退完成后，按仓位记录供用户领取，与本金赎回分别处理。
