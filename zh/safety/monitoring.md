---
layout: default
title: 运行监控与应急演练
parent: 安全性与治理设计
nav_order: 3
---

# 运行监控与应急响应体系

深入了解 TheFatCat 如何常态化监控上游税收处理器存储槽位、开展暂停/恢复实战演练，以及执行安全 SLA 标准。

---

## 1. 上游 Flap 依赖与自动化监控哨兵

在 BNB Chain 上，交易税收处理器由 Flap 工厂系统部署与管辖。虽然 FATCAT 代币克隆合约的实现指针不可篡改，但外部税收处理器保留有费用路由配置权限。

为捍卫质押者的资产安全，TheFatCat 部署了常态化链上哨兵：

### `watch-processor.sh` 哨兵脚本
位于主仓库 [`contracts/ops/watch-processor.sh`](https://github.com/TheFatCatOfficial/TheFatCat/blob/main/contracts/ops/watch-processor.sh)，该工具实时持续轮询四大核心链上存储槽位：
1. **目标金库地址（Target Vault）**：核验分账目标始终精确指向 TheFatCat 的 Forwarding Vault。
2. **费率配置参数（Fee Rates）**：核验税率维持在规定常数。
3. **清算触发阈值（Liquidation Threshold）**：监控 AMM 卖单清算前的 FATCAT 代币累积量。
4. **主流动性交易对（Primary Pair）**：核验证券化征税交易池地址。

一旦探测到任何未授权的路由偏移或参数篡改，自动化报警系统将在数秒内唤醒核心安全贡献者。

---

## 2. 紧急暂停与恢复演练

协议内置了健全的多层事故应急响应防线：

- **紧急暂停开关（Emergency Pause）**：协议多签治理以及专设的 `Guardian` 防御地址均拥有瞬时冻结 The Belly 资金外流的熔断权限。
- **暂停影响范畴**：暂停仅冻结奖池释放与链上市场兑换，有效阻止资金失窃。它 **被刻意设计为绝不暂停** `StakingVault.sol` 中的本金赎回。
- **解除暂停演练（Unpause Drills）**：解除暂停需要多签治理的权威授权。代码库配备了完整的离线演练脚本（`run-pause-drill.zsh`）与测试套件，确保在真实主网事故发生时能够敏捷、稳健地完成恢复。

---

## 3. 负责任披露与白帽赏金通道

TheFatCat 诚挚欢迎独立安全研究员与白帽黑客进行安全审视：

- **漏洞提交通道**：请通过 [GitHub 私密安全通报通道](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new) 提交漏洞详情。
- **SLA 响应承诺**：
  - **24 小时内确认**：在收到报告后 24 小时内确认接收。
  - **48 小时内定级**：在 48 小时内完成初步漏洞严重性评估与分级。
- **社区安全赏金**：确认属于严重（Critical）或高危（High）级别的安全漏洞，有资格获得由社区金库直接发放的去中心化安全赏金。
