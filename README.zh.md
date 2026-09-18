# TheFatCat 协议官方文档

[English](README.md) | [简体中文](README.zh.md)

[TheFatCat](https://thefatcat.fun) 官方开发者与协议技术文档仓库 —— 部署于 BNB Chain 上、具备自适应动力学阻尼与 $O(1)$ 闭式资历权重的去中心化交易税路由协议。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/文档站-在线运行-success.svg)](https://thefatcatofficial.github.io/TheFatCat-docs/)
[![Network: BNB Chain](https://img.shields.io/badge/网络-BNB%20Chain-F0B90B.svg)](https://bscscan.com)

---

## 协议总览 (Overview)

TheFatCat 将传统的 Meme 币交易税直通管道重构为无特权的物理动力学蓄水池系统。协议并不直接将瞬时交易税粗暴砸向质押者，而是将税收汇入 **The Belly**，并通过确定性时钟以一阶指数阻尼比例（标准 8 小时开席释放 $\alpha \approx 4.76\%$）平滑释放，将瞬态市场波动转化为长期持久的质押资产库存。

### 核心架构特性：
- **动力学金库 (The Belly)**：具备窗口额度上限防护的一阶指数阻尼蓄水池，无任何管理提款、清扫（Sweep）或救援（Rescue）路径。
- **$O(1)$ 闭式资历账本 (Seniority Ledger)**：依托 22 槽位环形缓冲区实现常数级移库，在 $O(1)$ 常数 Gas 开销下精确计算全网质押资历权重。
- **主权自选餐单 (Multi-Asset Diets)**：质押者独立选择心仪的奖励资产（BNB、代币化美股/bStocks、毕业后 FATCAT），记账与市价采购执行彻底解耦。
- **资历证书规划 (Seniority Certificates ERC-721)**：后续版本路线图功能，计划支持退出的仓位销毁 100,000 FATCAT 至黑洞地址 `0x...dEaD`，将达到的资历阶梯（1–22）永久印刻为全链上 SVG 凭证并在后续开仓时继承起始阶梯。
- **严格非托管架构 (Strict Non-Custodial Architecture)**：金库无管理员资金清扫（Sweep）或提款权限，执行器采用时间锁一次性激活，且用户质押本金赎回机制永远不可被暂停。

---

## 文档目录结构 (Documentation Structure)

文档按照五大核心板块系统化组织：

1. **概览与哲学 (Overview & Philosophy)**：架构背景、传统直通税币的三重困境剖析与协议全景资金拓扑图。
2. **用户实操指南 (User Guides)**：涵盖质押开仓、100k 门槛、自选餐单与自动解包提领、资历证书规划，以及脱离前端直接在 BscScan 强退的急救指南。
3. **协议底层机制 (Core Mechanics)**：深入剖析 The Belly 动力学释放公式、22 槽位环形缓冲区原理、TWAP 防夹滑点采购与 4% 交易税流向模型。
4. **安全与治理 (Security & Governance)**：非托管原则、应急暂停边界、向下取整超额偿付数学证明（$\sum r_i \le R$）以及链上监控机制。
5. **速查与参考 (Reference & FAQ)**：15 大主网已验证合约矩阵、高频排坑问答、白皮书双语下载专页与法律免责声明。

---

## 本地开发与预览 (Local Development)

按照以下步骤在本地运行与预览官方文档站：

### 环境依赖
- Ruby 3.1+
- Bundler (`gem install bundler`)

### 本地启动
```bash
# 克隆仓库
git clone https://github.com/TheFatCatOfficial/TheFatCat-docs.git
cd TheFatCat-docs

# 安装依赖
bundle install

# 启动本地开发服务
bundle exec jekyll serve
```

本地服务启动后，即可在浏览器访问 `http://localhost:4000/TheFatCat-docs/`。

---

## 安全与负责任披露 (Security & Responsible Disclosure)

我们高度重视智能合约与协议资金安全。如果您发现了潜在的脆弱性或安全漏洞，请通过 GitHub 官方私密通道进行安全提报：

- **私密漏洞提报通道**：[Report a Vulnerability](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new)

---

## 开源协议 (License)

本仓库内的所有文档内容与矢量架构图均遵循 [MIT 开源许可证](LICENSE)。
