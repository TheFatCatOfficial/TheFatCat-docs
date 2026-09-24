---
layout: default
title: 官方导航与链接
nav_order: 12
---

# 官方导航与生态链接

TheFatCat 协议官方应用门户、质押工坊、社交媒体、智能合约与开源代码仓库的权威导航总表。

{: .warning }
在连接 Web3 钱包或签署任何链上交易前，请务必核对浏览器地址栏域名。协议贡献者绝不会主动私聊向您索取助记词、私钥或要求进行未经验证的授权。

---

## 核心应用与官方通道

<div class="tfc-portal-grid">
  <div class="tfc-portal-card">
    <div class="tfc-portal-badge live">在线运行</div>
    <div class="tfc-portal-icon">🌐</div>
    <h3 class="tfc-portal-title">协议官方主站</h3>
    <p class="tfc-portal-desc">TheFatCat 官方门户网站，包含协议架构总览、代币经济学动力学流体仿真器与创世启动背景说明。</p>
    <a href="https://thefatcat.fun" target="_blank" rel="noopener noreferrer" class="tfc-portal-btn">
      访问官方主站 &rarr;
    </a>
    <div class="tfc-portal-url">https://thefatcat.fun</div>
  </div>

  <div class="tfc-portal-card highlight">
    <div class="tfc-portal-badge live">核心工坊</div>
    <div class="tfc-portal-icon">🥣</div>
    <h3 class="tfc-portal-title">质押工坊（The Belly）</h3>
    <p class="tfc-portal-desc">质押 FATCAT、配置 5 种自选 Diet 资产（WBNB、BTCB、ETH、SOL、DOGE）、监控饱食度（Hunger）与领取餐食分红的独立专属交互入口。</p>
    <a href="https://thefatcat.fun/belly" target="_blank" rel="noopener noreferrer" class="tfc-portal-btn primary">
      前往质押工坊 &rarr;
    </a>
    <div class="tfc-portal-url">https://thefatcat.fun/belly</div>
  </div>

  <div class="tfc-portal-card">
    <div class="tfc-portal-badge live">官方认证</div>
    <div class="tfc-portal-icon">𝕏</div>
    <h3 class="tfc-portal-title">官方 X（推特）</h3>
    <p class="tfc-portal-desc">第一时间发布技术里程碑、主网部署进展、智能合约验证状态、社区 AMA 与创世启动公告。</p>
    <a href="https://x.com/TheFatCatFi" target="_blank" rel="noopener noreferrer" class="tfc-portal-btn">
      关注 @TheFatCatFi &rarr;
    </a>
    <div class="tfc-portal-url">https://x.com/TheFatCatFi</div>
  </div>

  <div class="tfc-portal-card muted">
    <div class="tfc-portal-badge pending">创世筹备中</div>
    <div class="tfc-portal-icon">✈️</div>
    <h3 class="tfc-portal-title">官方 Telegram 社群</h3>
    <p class="tfc-portal-desc">官方社区交流群组与通知频道。为防范冒充钓鱼，正式社群链接将在创世部署前夕统一切换公布。</p>
    <a href="javascript:void(0);" class="tfc-portal-btn disabled" aria-disabled="true">
      即将推出（创世前夕统一公布）
    </a>
    <div class="tfc-portal-url">t.me/ (创世前夕统一公布)</div>
  </div>
</div>

---

## 技术与验证通道

供开发者、审计机构与集成方查验的核心公开通道：

| 渠道 / 资源 | 访问地址 | 说明与验证 |
| :--- | :--- | :--- |
| **官方技术文档站** | [thefatcatofficial.github.io/TheFatCat-docs/](https://thefatcatofficial.github.io/TheFatCat-docs/) | 权威数学规范、状态机模型与操作指南 |
| **文档开源仓库** | [github.com/TheFatCatOfficial/TheFatCat-docs](https://github.com/TheFatCatOfficial/TheFatCat-docs) | 基于 Jekyll 的开源技术文档仓库 |
| **BNB Chain 浏览器** | [bscscan.com](https://bscscan.com) | 创世部署合约链上源码与交易验证 |
| **安全通报通道** | [GitHub 私密安全通报通道](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new) | 负责任漏洞披露通道（定期查阅与快速反馈） |

---

## 防钓鱼安全核查清单

在与协议发生任何链上资金交互前，请务必执行以下安全核对：

1. **核对浏览器完整域名**：确保域名为 `https://thefatcat.fun` 或 `https://thefatcat.fun/belly`。谨防使用形近字符或添加前缀/后缀的仿冒钓鱼域名。
2. **核对合约部署地址**：在钱包签名转账或授权前，务必在 [权威合约规范表]({% link zh/contracts.md %}) 交叉验证合约地址哈希。
3. **警惕免费空投陷阱**：协议未设置任何需要签名 `Permit` 离线授权或索取无限授权的“免费领币”活动。
