# TheFatCat 用户文档

[English](README.md) | [简体中文](README.zh.md)

[TheFatCat](https://thefatcat.fun) 的官方用户文档。TheFatCat 是 BNB Chain 上的交易税路由与质押协议。

[![文档站](https://img.shields.io/badge/Docs-Live%20Website-success.svg?style=for-the-badge&logo=gitbook&logoColor=white)](https://thefatcatofficial.github.io/TheFatCat-docs/zh/)
[![官方网站](https://img.shields.io/badge/Web-thefatcat.fun-0e3b32.svg?style=for-the-badge)](https://thefatcat.fun)
[![网络：BNB Chain](https://img.shields.io/badge/Network-BNB%20Chain-F0B90B.svg?style=for-the-badge&logo=binance&logoColor=white)](https://bscscan.com)
[![许可证：MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 📖 **在线文档入口**：访问官方中文文档站 **[https://thefatcatofficial.github.io/TheFatCat-docs/zh/](https://thefatcatofficial.github.io/TheFatCat-docs/zh/)**。

本公开文档站仓库不保留 Git 历史记录，每次发布都会以最新快照强制覆盖 `main` 分支。

---

## 在线文档目录

查阅协议说明与用户指南：

| 分类 | 内容 | 在线链接 |
|:---|:---|:---|
| **概览与设计理念** | 项目背景、反射型代币的局限与系统拓扑 | [背景与设计哲学](https://thefatcatofficial.github.io/TheFatCat-docs/zh/background.html) • [系统拓扑](https://thefatcatofficial.github.io/TheFatCat-docs/zh/topology.html) |
| **用户操作指南** | 质押、食谱选择、凭证与紧急退出 | [质押与仓位](https://thefatcatofficial.github.io/TheFatCat-docs/zh/guides/staking.html) • [食谱与领取](https://thefatcatofficial.github.io/TheFatCat-docs/zh/guides/diets-and-claiming.html) • [时间资历凭证](https://thefatcatofficial.github.io/TheFatCat-docs/zh/guides/seniority-certificates.html) • [紧急退出说明](https://thefatcatofficial.github.io/TheFatCat-docs/zh/guides/emergency-exit.html) |
| **核心机制** | 储备分配、资历、有序结算与交易税路由 | [Belly 储备与释放](https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/belly.html) • [餐次与资历](https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/meals-and-seniority.html) • [采购与结算](https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/execution.html) • [税收路由与费用](https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/fees.html) |
| **安全性与治理** | 托管边界、取整限制、监控措施与风险 | [托管与记账边界](https://thefatcatofficial.github.io/TheFatCat-docs/zh/safety/custody.html) • [运行监控与应急响应](https://thefatcatofficial.github.io/TheFatCat-docs/zh/safety/monitoring.html) • [风险披露与运行条件](https://thefatcatofficial.github.io/TheFatCat-docs/zh/safety/risks-and-status.html) • [核心合约](https://thefatcatofficial.github.io/TheFatCat-docs/zh/deployment.html) |
| **参考资料** | 常见问题与官方链接 | [常见问题](https://thefatcatofficial.github.io/TheFatCat-docs/zh/faq.html) • [官方链接](https://thefatcatofficial.github.io/TheFatCat-docs/zh/links.html) |

交互前，请根据[核心合约](https://thefatcatofficial.github.io/TheFatCat-docs/zh/deployment.html)核对网络、部署地址及已验证源码。

---

## 协议机制

- **The Belly**：保留奖励资金，每个八小时窗口的出金上限为窗口开启时余额的 $16/168$。不设管理员提款或直接转出资金的功能。
- **仓位资历**：每个仓位随完成的活跃餐次从 1 档升至 22 档，仓位权重 = 本金 × 时间资历系数 × 所选资产的激励系数。
- **奖励食谱**：仓位可从链上已启用的菜单中选择奖励资产。权益记账与奖励采购分别进行；按全局顺序结算可能延后较新餐次的处理。
- **时间资历凭证**：计划在协议成熟时推出。持有质押仓位的用户将可销毁 `$FATCAT` 进行铸造，详细内容将在后续公布。
- **托管边界**：核心合约不设管理员直接转出资金的功能，本金赎回不受暂停开关限制。上游收入合约具有独立的升级与紧急资产恢复权限，详见[托管边界](https://thefatcatofficial.github.io/TheFatCat-docs/zh/safety/custody.html)。

---

## 安全与负责任披露

请通过 GitHub Security Advisories 私下提交漏洞详情：

- **安全通报**：[报告漏洞](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new)

---

## 许可证

本仓库中的全部文档内容与示意图均采用 [MIT 许可证](LICENSE)。
