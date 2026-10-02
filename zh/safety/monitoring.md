---
layout: default
title: 运行监控与应急演练
parent: 安全性与治理设计
nav_order: 3
---

# 运行监控与应急响应体系

说明 QQQB 收入通道的部署基线、不同的升级与暂停权限，以及恢复检查。

---

## 1. QQQB 收入依赖与审核基线

生产监控必须绑定真实部署与明确审核过的基线；本地测试通过不等于生产监控服务已经运行。

- **Flap 处理器路由**：对照已审核发射记录，检查实际处理器所有者、创作者收入目标（`FatCatQqqbVault`）、支付币种 QQQB、平台接收方及费率配置。P2 观测为 `feeRate = 500`，即税费的 5%；这不是平台永不变化的保证。
- **金库 Beacon 基线**：QQQB watcher 检查 Vault 代理、Beacon、当前实现及代码哈希、Factory 绑定、规范 Flap Guardian 和升级锁定状态。锁定前 Beacon 所有者应为 Factory，锁定后应为零地址；所有者与最终升级授权方是两个角色。
- **发行人策略**：当前接入决策信任 QQQB 发行人权限。发行角色或代币实现变化不会自动让官方转换服务进入等待状态；正常转账、实际余额变化、流动性及受保护的执行仍需成立。

发现基线不符或审核基线不可用时，官方维护服务停止自己的 QQQB 兑换调用并等待核验。它**不会**发送链上暂停交易，也不会自动阻止公众调用。审核后批准新基线可解除链下等待，但不会撤销升级或已完成的交易。

### 升级与暂停权限

| 操作 | 授权角色 | 范围 |
|---|---|---|
| Factory `upgradeVaultImplementation(address)` | 仅 Flap Guardian | 同一 Factory 下的上游 QQQB 金库实现 |
| Factory `lockVaultUpgrades()` | 仅 Flap Guardian | 永久关闭上述升级能力，不可逆 |
| QQQB Vault `pause()` | 项目 governor、项目 guardian 或 Flap Guardian | 暂停当前实现的兑换 |
| QQQB Vault `unpause()` | 项目 governor 或 Flap Guardian | 执行检查全部通过后恢复兑换 |

项目 guardian 可以暂停，但不能恢复或升级该金库。Factory 的升级入口不改变固定 BNB 接收器、Belly 或质押合约。链上暂停生效时，官方和公众的兑换调用都受限制，待处理 QQQB 留在上游。

---

## 2. 紧急暂停与恢复机制

协议内置了健全的多层事故应急响应防线：

- **紧急暂停开关（Emergency Pause）**：协议多签治理以及专设的 `Guardian` 防御地址均拥有瞬时冻结 The Belly 资金外流的熔断权限。
- **暂停影响范畴**：暂停仅冻结奖池释放与链上市场兑换，有效阻止资金失窃。它 **被刻意设计为绝不暂停** `StakingVault.sol` 中的本金赎回。
- **解除暂停演练（Unpause Recovery）**：解除暂停需要多签治理的权威授权。团队建立了经过充分演练与测试验证的恢复流程，确保在真实主网异常事件中能够敏捷、稳健地完成恢复。

---

## 3. 负责任披露与白帽赏金通道

TheFatCat 诚挚欢迎独立安全研究员与白帽黑客进行安全审视：

- **漏洞提交通道**：请通过 [GitHub 私密安全通报通道](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new) 提交漏洞详情。
- **查阅与反馈**：安全响应团队将定期查阅提报的漏洞报告，并进行快速评估与反馈。
- **社区安全赏金**：经评估确认属于严重（Critical）或高危（High）级别的有效安全漏洞，有资格获得由社区金库直接发放的去中心化安全赏金。
