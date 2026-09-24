---
title: 项目介绍
layout: default
nav_order: 1
---

# TheFatCat 文档中心

欢迎查阅 **TheFatCat** 官方开发者与协议技术文档 —— 这是一个部署在 BNB Chain 上的去中心化交易税路由协议，基于一阶指数平滑模型构建，并搭载具有数学闭式解（Closed-Form $O(1)$）的时间加权算法。协议不仅实现交易税的平滑路由，其产出资产更包含追踪实体核心股票资产价值的股票代币（bStocks），使质押者无需传统美股账户即可将质押分红直接结算为股票代币资产。

{: .warning }
TheFatCat 目前处于主网上线准备阶段。合约地址、部署哈希与链上验证链接将在创世部署完成后统一更新。

---

## 核心架构支柱

TheFatCat 不仅彻底重构了传统分红代币（Reflection Token）简单的“即入即抛”通道，更是一个结合了创新性时间加权与高度去中心化的协议，构建了一个具备自律物理特性的链上蓄水池：

1. **The Belly（平滑储备金库）**：交易税资金进入无特权的多代币蓄水金库，作为离散一阶指数平滑滤波器运行。资金释放受确定性释放率 $\alpha = 1/21 \approx 4.76\%$ 严格限流（每 8 小时餐次释放一次），将瞬时订单流波动转化为持久稳定的分红库存。
2. **食谱代币自选（Sovereign Multi-Asset Diets）**：质押者可自主指定结算资产（原生 BNB、股票代币 bStocks 或毕业后的 FATCAT）。份额分配核算与链上兑换执行在逻辑与时间上完全解耦：收益份额在离散餐次结算边界处代数锁定，将三明治夹子与抢跑攻击暴露面严格局限于时间加权聚合批次执行窗口之内。
3. **准入门槛与时间资历阶梯（Time-Seniority Ladder）**：开启质押仓位要求最低存入 100,000 FATCAT（不可篡改的合约硬性门槛，防范粉尘粉碎与垃圾调用）。分配权重随资金严格纯线性扩展，杜绝任何大户杠杆；持续在席时间按有效餐次（8小时）逐餐累进（每餐 $+1.0\times$），历经 21 餐次达到 $22.0\times$ 上限。提前退役仓位将立即脱离资历阶梯，并放弃当前未结算餐次的预期收益份额以反哺在席质押者。
4. **时间资历凭证（ERC-721）**：在仓位退出时通过销毁 FATCAT 将历史在席时间资产化的链上凭据标准，旨在将仓位解质押与代币通缩及二级版税金库路由深度绑定（受协议路线图治理）。

---

## 文档导航全览

文档中心包含以下板块：

### [1. 核心定义与符号体系]({% link zh/definitions.md %})
系统形式化代数符号定义、双轨术语映射对照与核心架构不变量：
- **[形式化代数符号表]({% link zh/definitions/notation.md %})**：全站符号定义、状态变量索引与严格量纲范围。
- **[双轨术语映射对照]({% link zh/definitions/terminology.md %})**：文化隐喻与智能合约底层组件的严密对照。
- **[核心底层架构不变量]({% link zh/definitions/invariants.md %})**：本金隔离、平滑释放与常数级计算形式化证明。

### [2. 架构总览]({% link zh/background.md %})
剖析传统税收代币的根本缺陷，理解 TheFatCat 采用物理蓄水池的设计哲学：
- [背景与设计哲学]({% link zh/background.md %})：从直通式管道走向指数平滑储备池。
- [参照协议与机制对照]({% link zh/background/prior-art.md %})：对比 Curve、Pendle 与 Synthetix 的详尽机制矩阵。
- [系统拓扑图]({% link zh/topology.md %})：端到端资金流向与协议状态机全景图。

### [3. 用户操作指南]({% link zh/guides.md %})
面向质押者与生态参与者的逐步操作指南：
- [质押与仓位管理]({% link zh/guides/staking.md %})：开仓规则、本金门槛以及独立仓位隔离原则。
- [食谱自选与收益提取]({% link zh/guides/diets-and-claiming.md %})：选择分红代币、多批次领取、以及原生 BNB 自动解包功能。
- [时间资历凭证]({% link zh/guides/seniority-certificates.md %})：通过燃烧铸造的链上时间资历凭证体系。
- [紧急退出通道]({% link zh/guides/emergency-exit.md %})：在前端不可用时的安全紧急退回指引。

### [协议去中心化维护]({% link zh/guides/community-keeper.md %})
任何人都可推进满足链上条件的 QQQB 兑换、到期餐次与奖励采购。本节说明一笔维护的执行边界、0.1% WBNB 转换推动奖励何时累计及如何领取。

### [4. 核心机制深度解析]({% link zh/protocol.md %})
协议底层数学模型与合约技术实现：
- [The Belly 动态释放机制]({% link zh/protocol/belly.md %})：离散释放公式、半衰期衰减与 7-窗口安全限额。
- [餐次周期与资历倍数]({% link zh/protocol/meals-and-seniority.md %})：22-槽位闭合环形缓冲区、$O(1)$ 复杂度的封闭式加权聚合计算法。
- [批量撮合与资产执行]({% link zh/protocol/execution.md %})：解耦记账模型、TWAP 滑点保护与免许可报价保护。
- [费用流向拓扑与费率]({% link zh/protocol/fees.md %})：4% 动态交易税、Flap 平台分成与协议运营维护收入分配。

### [5. 安全性与治理设计]({% link zh/safety.md %})
信任假设、权限隔离、不变量验证与缺陷复盘：
- [金库托管与偿付能力证明]({% link zh/safety/custody.md %})：整除截断向下取整定理、非负粉尘定理（$\sum r_i \le R$）与零管理员扫仓权限。
- [安全审计与缺陷加固复盘]({% link zh/safety/audits-and-hardening.md %})：PocAudit 测试套件针对关键边界漏洞的排查与加固证明。
- [运行监控与核心不变量]({% link zh/safety/monitoring.md %})：上游处理器轮询监控与紧急响应机制。
- [风险披露与项目状态]({% link zh/safety/risks-and-status.md %})：未完成范畴、外部依赖及重大风险披露。

### [6. 附录与参考资料]({% link zh/contracts.md %})
- [合约规范与地址]({% link zh/contracts.md %})：权威部署地址、字节码验证与不可篡改指针。
- [常见问题解答（FAQ）]({% link zh/faq.md %})：针对社区与质押者高频疑问的权威答疑。
- [学术白皮书]({% link zh/whitepaper.md %})：学术双栏 PDF 与 DOCX 官方版本下载。
- [法律声明]({% link zh/notices.md %})：非投资建议与去中心化法律边界。
- [官方导航与链接]({% link zh/links.md %})：协议门户、质押工坊、官方推特 X、电报与生态导航。

---

## 协议路线图与治理披露

目前处于研发设计或等待治理批准的特性与生产核心代码严格隔离：
- **二级市场凭证版税路由**：用于捕获时间资历 ERC-721 凭证在二级市场交易费用并反哺 The Belly 储备金库的合约钩子。具体规范与参数方案将在创世部署后由治理批准。
