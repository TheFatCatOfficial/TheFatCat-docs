---
layout: default
title: 双轨资产拓扑与金库隔离
parent: 系统拓扑与资金流
nav_order: 1
---

# 双轨资产流转拓扑与金库隔离

TheFatCat 在智能合约层实施质押本金与税收分红金库的严格合约隔离。下图详细展示了资金流转全景：

![TheFatCat 协议资金流向与状态拓扑图]({{ '/assets/images/fig1-topology.zh.svg' | relative_url }}?v=20260923p6)

---

## 1. QQQB 税费流入

合规 FATCAT 交易适用配置的 4% 交易税。Flap 扣除平台费用后，将 QQQB 收入送入 `FatCatQqqbVault`。毕业后 FATCAT 税费代币按批次清算，不代表每笔交易都会立即产生下游流入；最终发射必须核验实际费率、计价资产和接收路线。

---

## 2. 固定兑换路径与原接收器

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">ASSET FLOW</span>
    <span class="tfc-diagram-title">QQQB 税收清算与分账流向管道</span>
  </div>
  <pre class="tfc-diagram-content"><code>Flap QQQB 收入
  -> FatCatQqqbVault：QQQB -> USDT -> WBNB
     -> 符合资格的推动者：实际 WBNB 总产出的 0.1% 记为可领取奖励
  -> 收益分账：
     -> 剩余 WBNB 的 3/19 至 Ops Safe
     -> 余款（16/19）至 Belly</code></pre>
</div>

链上条件满足时，任何人都可通过公开的一笔维护或独立入口推进，官方在需要时兜底。调用者仅支付 gas，不提供自己的 QQQB；接收方、路线和价格保护由合约执行。转换与收益分配在同笔交易中自动完成。兑换层不再分取一次 Ops 份额。下游比例按扣除上游费用、市场兑换成本及已产生推动奖励后的实际所得计算，不是按交易额计算。详见[税费路由]({% link zh/protocol/fees.md %})和[去中心化维护]({% link zh/guides/community-keeper.md %})。

上游 QQQB 金库使用 Beacon 代理。Factory 持有 Beacon，仅 Flap Guardian 可通过 Factory 升级或永久锁定。BNB 接收器是固定实现的克隆合约，奖励核心独立存在。

---

## 3. 金库严格边界隔离

- **质押本金金库 (`StakingVault.sol`)**：严格托管 100% 质押者存入的 FATCAT 本金。合约内绝无任何交易税流入，亦无任何代币兑换逻辑。
- **分红储备金库 (`Belly.sol`)**：仅托管计价资产（WBNB）税收储备。没有任何途径能够访问、转移或侵占质押者的 FATCAT 本金。
