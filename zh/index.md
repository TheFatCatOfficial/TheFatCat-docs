---
title: 项目介绍
layout: default
nav_order: 1
---

# TheFatCat 文档中心

欢迎查阅 **TheFatCat** 官方开发者与协议技术文档 —— 这是一个部署在 BNB Chain 上的去中心化交易税路由协议，基于一阶指数平滑模型构建，并搭载具有数学闭式解（Closed-Form $O(1)$）的资历阶梯加权算法。

{: .warning }
TheFatCat 目前处于主网上线准备阶段。合约地址、部署哈希与链上验证链接将在创世部署完成后统一更新。

---

## 核心架构支柱

TheFatCat 彻底重构了传统分红代币（Reflection Token）简单的“即入即抛”通道，构建了一个具备自律物理特性的去中心化蓄水池：

1. **The Belly（指数平滑储备池）**：交易税资金进入一个无管理员特权的蓄水金库。它基于一阶指数衰减模型，并不即时倾倒给质押者，而是以每餐次（8小时）$\alpha = 8/168 \approx 4.7619\%$ 的速率动态平滑释放，将短期的剧烈市场波动转化为平稳、持久的资产库存。
2. **食谱代币自选（Sovereign Multi-Asset Diets）**：质押者可自主指定偏好的分红收益代币（BNB、美股代币化资产 bStocks、毕业后的 FATCAT、或未来由治理批准上市的新资产）。分红核算与链上兑换完全解耦：分红在餐次结算点通过代数闭式解瞬时锁定，彻底规避三明治夹子与抢跑攻击。
3. **线性资本与资历倍数加权（Seniority Weighting）**：凡超过 100,000 FATCAT 门槛的仓位，权重对本金严格呈线性缩放（$w_i = p_i \times c_i$）。资历系数按有效餐次（8小时）以加法累进（每餐 $+1$），最高可达 22 倍上限（$22\times$），在数学层面上坚定偏好长期耐心资本，杜绝闪电游资吸血。
4. **资历凭据（ERC-721 规划）**：在协议后续规划中，质押者在退出成熟仓位时，可选择销毁一定数量的 FATCAT，将累积的资历铸造为链上原生 SVG 凭据勋章。

---

## 文档导航全览

文档中心涵盖五大核心板块：

### [1. 架构总览]({% link zh/background.md %})
剖析传统税收代币的根本缺陷，理解 TheFatCat 采用物理蓄水池的设计哲学：
- [背景与设计哲学]({% link zh/background.md %})：从直通式管道走向指数平滑储备池。
- [系统拓扑图]({% link zh/topology.md %})：端到端资金流向与协议状态机全景图。

### [2. 用户操作指南]({% link zh/guides.md %})
面向质押者与生态参与者的逐步操作指南：
- [质押与仓位管理]({% link zh/guides/staking.md %})：开仓规则、本金门槛以及独立仓位隔离原则。
- [食谱自选与收益提取]({% link zh/guides/diets-and-claiming.md %})：选择分红代币、多批次领取、以及原生 BNB 自动解包功能。
- [资历凭据（ERC-721）]({% link zh/guides/seniority-certificates.md %})：链上资质凭据的概念解析与未来上线规划。
- [紧急退出通道]({% link zh/guides/emergency-exit.md %})：在前端不可用时的安全紧急退回指引。

### [3. 核心机制深度解析]({% link zh/protocol.md %})
协议底层数学模型与合约技术实现：
- [The Belly 动态释放机制]({% link zh/protocol/belly.md %})：离散释放公式、半衰期衰减与 7-窗口安全限额。
- [餐次周期与资历倍数]({% link zh/protocol/meals-and-seniority.md %})：22-槽位闭合环形缓冲区、$O(1)$ 复杂度的封闭式加权聚合计算法。
- [批量撮合与资产执行]({% link zh/protocol/execution.md %})：解耦记账模型、TWAP 滑点保护与免许可报价保护。
- [费用流向拓扑与费率]({% link zh/protocol/fees.md %})：4% 动态交易税、Flap 平台费（仅联合曲线阶段）与运营分配。

### [4. 安全性与治理设计]({% link zh/safety.md %})
信任假设、权限隔离与不变量验证：
- [金库托管与偿付能力证明]({% link zh/safety/custody.md %})：整除截断向下取整定理、非负粉尘定理（$\sum r_i \le R$）与零管理员扫仓权限。
- [运行监控与核心不变量]({% link zh/safety/monitoring.md %})：上游处理器轮询监控与紧急响应机制。
- [风险披露与项目状态]({% link zh/safety/risks-and-status.md %})：未完成范畴、外部依赖及重大风险披露。

### [5. 附录与参考资料]({% link zh/contracts.md %})
- [合约规范与地址]({% link zh/contracts.md %})：权威部署地址、字节码验证与不可篡改指针。
- [常见问题解答（FAQ）]({% link zh/faq.md %})：针对社区与质押者高频疑问的权威答疑。
- [学术白皮书]({% link zh/whitepaper.md %})：学术双栏 PDF 与 DOCX 官方版本下载。
- [法律声明]({% link zh/notices.md %})：非投资建议与去中心化法律边界。
