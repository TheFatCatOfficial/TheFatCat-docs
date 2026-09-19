# TheFatCat 协议官方文档

[English](README.md) | [简体中文](README.zh.md)

[TheFatCat](https://thefatcat.fun) 官方开发者与协议技术文档仓库 —— 部署于 BNB Chain 上、具备自适应动力学阻尼与 $O(1)$ 闭式资历权重的去中心化交易税路由协议。

[![文档站](https://img.shields.io/badge/在线文档-正式发布-success.svg?style=for-the-badge&logo=gitbook&logoColor=white)](https://thefatcatofficial.github.io/TheFatCat-docs/zh/)
[![官网主站](https://img.shields.io/badge/官网-thefatcat.fun-0e3b32.svg?style=for-the-badge)](https://thefatcat.fun)
[![网络: BNB Chain](https://img.shields.io/badge/网络-BNB%20Chain-F0B90B.svg?style=for-the-badge&logo=binance&logoColor=white)](https://bscscan.com)
[![开源协议: MIT](https://img.shields.io/badge/协议-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 📖 **在线官方文档入口**：请直接访问全套交互式官方中英文文档站 **[https://thefatcatofficial.github.io/TheFatCat-docs/zh/](https://thefatcatofficial.github.io/TheFatCat-docs/zh/)**。

---

## 在线文档导航全览

直接通过下方链接查阅各核心板块的在线技术文档：

| 核心板块 | 涵盖内容 | 在线阅读直达链接 |
|:---|:---|:---|
| **概览与哲学** | 架构背景、传统直通税币的三重困境剖析与协议全景资金拓扑图 | [背景与设计哲学](https://thefatcatofficial.github.io/TheFatCat-docs/zh/background.html) • [系统架构与资金拓扑](https://thefatcatofficial.github.io/TheFatCat-docs/zh/topology.html) |
| **用户实操指南** | 质押开仓、100k 门槛、自选餐单与自动解包提领、资历凭据、以及脱离前端直接在 BscScan 强退的急救指南 | [质押与开仓指南](https://thefatcatofficial.github.io/TheFatCat-docs/zh/guides/staking.html) • [餐单自选与分红提领](https://thefatcatofficial.github.io/TheFatCat-docs/zh/guides/diets-and-claiming.html) • [资历证书凭据](https://thefatcatofficial.github.io/TheFatCat-docs/zh/guides/seniority-certificates.html) • [链上急救直退指南](https://thefatcatofficial.github.io/TheFatCat-docs/zh/guides/emergency-exit.html) |
| **协议底层机制** | The Belly 动力学释放公式、22 槽位环形缓冲区原理、TWAP 防夹滑点采购与 4% 交易税流向模型 | [大肚皮动力学](https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/belly.html) • [餐次推进与资历阶梯](https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/meals-and-seniority.html) • [批量采购与市价执行](https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/execution.html) • [税收流向与数学模型](https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/fees.html) |
| **安全与治理** | 非托管原则、应急暂停边界、向下取整超额偿付数学证明（$\sum r_i \le R$）以及链上监控机制 | [资金托管与偿付证明](https://thefatcatofficial.github.io/TheFatCat-docs/zh/safety/custody.html) • [运维监控体系](https://thefatcatofficial.github.io/TheFatCat-docs/zh/safety/monitoring.html) • [风险披露与发射状态](https://thefatcatofficial.github.io/TheFatCat-docs/zh/safety/risks-and-status.html) |
| **速查与参考** | 主网创世 17 项生产合约矩阵规范、高频排坑问答、白皮书双语下载专页与官方生态链接导航 | [生产合约矩阵验证](https://thefatcatofficial.github.io/TheFatCat-docs/zh/contracts.html) • [常见问题与限制说明](https://thefatcatofficial.github.io/TheFatCat-docs/zh/faq.html) • [白皮书下载专页](https://thefatcatofficial.github.io/TheFatCat-docs/zh/whitepaper.html) • [官方生态链接导航](https://thefatcatofficial.github.io/TheFatCat-docs/zh/links.html) |

---

## 协议核心亮点

- **动力学金库 (The Belly)**：具备窗口额度上限防护（每窗口 $\le 16/168$）的一阶指数阻尼蓄水池，无任何管理提款、资金清扫（Sweep）或后门路径。
- **$O(1)$ 闭式资历账本 (Seniority Ledger)**：依托 22 槽位环形缓冲区实现常数级移库，在 $O(1)$ 常数 Gas 开销下精确计算全网质押资历权重。
- **主权自选餐单 (Multi-Asset Diets)**：质押者独立选择心仪的奖励资产（BNB、代币化美股/bStocks、毕业后 FATCAT），代数记账与市价兑换彻底解耦。
- **资历凭据证书 (Seniority Certificates ERC-721)**：创世阶段与核心协议同步部署，退出成熟仓位时可通过销毁 100,000 FATCAT 铸造纯链上矢量 SVG 凭据勋章（硬顶 10,000 枚，21 天冷却期）。
- **严格非托管架构 (Strict Non-Custodial Architecture)**：金库无管理员资金清扫或提款权限，执行器采用时间锁一次性激活，且用户质押本金赎回机制永远不可被暂停（`redeem()` 刻意绕过暂停）。

---

## 安全与负责任披露 (Security & Responsible Disclosure)

我们高度重视智能合约与协议资金安全。如果您发现了潜在的脆弱性或安全漏洞，请通过 GitHub 官方私密通道进行安全提报：

- **私密漏洞提报通道**：[Report a Vulnerability](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new)

---

## 开源协议 (License)

本仓库内的所有文档内容与矢量架构图均遵循 [MIT 开源许可证](LICENSE)。
