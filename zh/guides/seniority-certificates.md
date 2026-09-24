---
layout: default
title: 时间资历凭证（ERC-721）
parent: 用户操作指南
nav_order: 3
---

# 时间资历凭证（ERC-721）

全面解析 TheFatCat 链上时间资历凭证的技术架构与操作规则，涵盖时间资产化、代币通缩销毁与二级版税金库路由机制。

---

## 1. 规范与合约架构

在 TheFatCat 的经济拓扑中，在席时长是系统唯一的非本金加权变量。时间资历凭证（[`SeniorityCertificate.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/src/SeniorityCertificate.sol)）提供了一套不可篡改的链上凭证标准：

- **标准支持**：原生 ERC-721 标准，集成链上动态 SVG 元数据（[ERC-4906](https://eips.ethereum.org/EIPS/eip-4906)）、标准版税信号（[ERC-2981](https://eips.ethereum.org/EIPS/eip-2981)）以及可租赁用户角色接口（[ERC-4907](https://eips.ethereum.org/EIPS/eip-4907)）。
- **发行总量硬顶**：合约底层硬编码固定上限 **9,999** 枚（`MAX_SUPPLY = 9_999`），绝不可超发或增发。
- **二级版税金库路由**：固定 500 bps（5.0%）的二级市场交易版税（`ROYALTY_BPS = 500`），版税收入全额自动路由至 [`CertificateRevenueVault.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/src/CertificateRevenueVault.sol)，随后注入 The Belly 储备金库。
- **链上矢量徽章**：由 [`SeniorityCertificateRenderer.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/src/SeniorityCertificateRenderer.sol) 完全从 EVM 字节码即时计算并生成去中心化 SVG 图像，不依赖任何中心化服务器或外部 IPFS。

---

## 2. 核心经济支柱

### 1. 燃烧铸造（Burn-to-Mint）与时间资产化
当质押者在 `StakingVault` 中退役并赎回长期仓位时，该仓位在整个生命周期中沉淀的历史真实在席时间与资历倍数，可通过**燃烧销毁 FATCAT 代币**的方式铸造为永久的链上 NFT 凭证。只有通过真实的代币物理销毁，历史时间才能被资产化沉淀。

### 2. 双重飞轮：通缩与金库反哺
1. **供应端通缩沉淀**：铸造凭证所销毁的 FATCAT 将被永久移出流通量，为代币建立不可逆的硬性通缩消耗场景。
2. **金库增收飞轮（The Belly Accretion）**：遵循 ERC-2981 标准的二级市场交易，其 5% 版税收入将自动汇入 `CertificateRevenueVault`。金库将收益转换为计价资产并注入 The Belly，通过指数平滑释放模型持续反哺当前在席的活跃质押者。

---

## 3. 协议绑定与时间锁治理

为防止管理员随意注入恶意 NFT 合约或篡改凭证逻辑，`StakingVault.sol` 在底层实施了严密的两阶段时间锁绑定机制：

```solidity
// StakingVault.sol: 两阶段绑定管线
function proposeCertificate(address candidate) external;  // 仅 Governor 多签可提案
function activateCertificate() external;                  // 必须等待 CERTIFICATE_BINDING_DELAY 延迟
```

1. **确定性静态校验**：候选合约必须通过接口校验（`supportsInterface(0x80ac58cd)`）、验证其绑定的金库指向当前金库（`nft.vault() == address(this)`），并确认其具备不可变的发行总量硬顶。
2. **强制时间锁延迟**：提案发起后，必须等待完整的 `CERTIFICATE_BINDING_DELAY` 延迟期满方可被正式激活。
3. **单次写入不可篡改**：一旦激活绑定完成，该凭证集合将永久锁定于金库中，不可被替换、升级或重置。

---

## 4. 技术规范参数对照表

| 维度 | 参数值 | 合约标识符 | 约束性质 |
| :--- | :--- | :--- | :--- |
| **资产标准** | ERC-721 / ERC-2981 / ERC-4907 / ERC-4906 | `SeniorityCertificate.sol` | 完全链上 SVG 渲染 |
| **发行上限** | `9,999` 枚 | `MAX_SUPPLY` | 不可篡改数学常量 |
| **二级版税** | `500` bps (5.0%) | `ROYALTY_BPS` | 自动路由至 `CertificateRevenueVault` |
| **金库目标** | The Belly 储备金库 | `royaltyReceiver` | 持续反哺在席质押者分红库存 |
| **绑定机制** | 两阶段时间锁提案 | `CERTIFICATE_BINDING_DELAY` | 全生命周期仅限单次绑定 |
