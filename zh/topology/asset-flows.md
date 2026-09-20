---
layout: default
title: 双轨资产拓扑与金库隔离
parent: 系统拓扑与资金流
nav_order: 1
---

# 双轨资产流转拓扑与金库隔离

TheFatCat 在智能合约层实施质押本金与税收分红金库的严格合约隔离。下图详细展示了资金流转全景：

![TheFatCat 协议资金流向与状态拓扑图]({{ '/assets/images/fig1-topology.zh.svg' | relative_url }})

---

## 1. DEX 交易税流入与批处理清算

1. **DEX 二级市场交易**：在联合曲线或 PancakeSwap V2 交易池中的每笔合规交易，均附带 **4% 动态 FATCAT 交易税**。
2. **Flap 平台代扣**：Flap 发射平台代扣 **10% 平台服务费**（折合交易额约 0.4%）。其余 90%（折合交易额约 3.6%）在达到清算阈值后，随卖单自动打入分账金库（Forwarding Vault）。

---

## 2. 分账金库（Forwarding Vault）记账与 `flush()` 分流

分账金库在接收到原生 BNB 税款时进行安全记账，随后由 Keeper 或任意调用者执行 `flush()`，将累积的原生 BNB 包装为 WBNB 并按不可篡改的数学比例自动分拨（可参考[帮协议跑起来]({% link zh/guides/community-keeper.md %})亲自执行）：
- **5/36（折合交易额约 0.5%）** $\rightarrow$ **协议运营储备（Protocol Operations）**：用于社区艺术、服务器托管、Keeper 自动化激励、常态化安全审计以及底层基础设施 Gas。该账户对质押金库与核心合约拥有零管理特权。
- **31/36 + 整数取整余数（折合交易额约 3.1%）** $\rightarrow$ **The Belly（指数平滑储备池）**：直接打入无管理特权的分红储备池。

---

## 3. 金库严格边界隔离

- **质押本金金库 (`StakingVault.sol`)**：严格托管 100% 质押者存入的 FATCAT 本金。合约内绝无任何交易税流入，亦无任何代币兑换逻辑。
- **分红储备金库 (`Belly.sol`)**：仅托管计价资产（WBNB）税收储备。没有任何途径能够访问、转移或侵占质押者的 FATCAT 本金。
