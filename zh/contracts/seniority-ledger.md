---
layout: default
title: 资历与账本数学合约
parent: 合约规范与地址
nav_order: 3
---

# 资历账本与底层数学合约

TheFatCat 的数学引擎在底层提供了常数 Gas 消耗（$O(1)$）的标量权重聚合、离散资历毕业环形管理以及绝对偿付能力证明：

---

## 1. 资历账本合约 (`SeniorityLedger.sol`)

- **架构职责**：在每次餐次推进时，快速计算全网所有食谱资产下的有效权重总和。
- **核心不变量**：
  - **$O(1)$ 闭式解权重正交分解**：将全体质押者拆分为攀爬仓位与沉淀满级仓位：
    $$W(m) = (1 + m) P_{\text{climb}} - J_{\text{climb}} + 22 P_{\text{settled}} + W_{\text{exiting}} - H_{\text{opening}}$$

    其中 $j_i$ 是计权参考餐次 `effectiveFrom`，实际参与资格从 `activeFrom` 才开始。$H_{\text{opening}}$ 对应账本的 `headOpening`，用于扣除开仓当餐尚未生效的计权。普通仓位 `effectiveFrom = activeFrom`，开仓校正项为零。

  - **22-槽位闭合环形缓冲区**：无需对数万个地址进行循环遍历，仅通过单步旋转即可完成资历毕业。
  - **禁止追加本金或合并仓位**：已达高资历的成熟仓位绝不可吸纳新增本金，从根源上杜绝资历洗钱漏洞。

---

## 2. 收益分发器合约 (`RewardDistributor.sol`)

- **架构职责**：负责双重负债结算会计与质押者的分红权益核销提取。
- **核心不变量**：
  - **RAY 极高精度累加器**：采用 $\text{RAY} = 10^{27}$ 高精度定点数引擎，驱动双重前缀累加器（$A_{a, m}, B_{a, m}$）。
  - **非负粉尘超额偿付定理**：整除向下取整截断从数学定理上严格保证总提现绝不超过可用库存：
    $$\sum r_i \le R_{\text{available}}$$
  - **原生 BNB 一键提取**：内置 `claimNative()` 接口，在底层合约中自动调用 `WBNB.withdraw()` 将收益转为原生 BNB。

---

## 3. 时间资历凭证与链上渲染器

- **时间资历凭证 (`SeniorityCertificate.sol`)**：ERC-721 凭据合约，退役仓位时通过燃烧 FATCAT 铸造，通过 ERC-2981 标示 5% 二级交易版税；市场实际支付的 BNB/WBNB 可经 `CertificateRevenueVault.sol` 的 flush 进入 The Belly。
- **凭据资产数据 (`CertificateData.sol`)**：凭证子系统独立部署的纯字节码存储容器，内置压缩矢量字体与美术资源包。
- **凭据渲染器 (`SeniorityCertificateRenderer.sol`)**：100% 纯链上原生矢量 SVG 动态渲染引擎，不依赖任何中心化服务器或 IPFS 外部托管。


## 可持续菜单生命周期

活动菜单容量和 FEED 批次分别治理；归档资产退出结算循环，但历史索引、最终快照和奖励债权保留。详见[菜单生命周期及上限]({% link zh/protocol/execution.md %})。
