---
layout: default
title: 紧急退出说明（脱离前端交互）
parent: 用户操作指南
nav_order: 5
---

# 紧急退出说明：脱离前端的链上自主赎回

本指南说明网页不可用时，如何通过区块浏览器赎回普通质押本金、领取已结算奖励。示例须以官方部署记录和验证合约为前提；本文不提供生产地址。

---

## 1. 核心保障：暂停期间仍可赎回本金

质押本金保存在链上合约中。官网无法访问时，您仍可使用持有仓位的钱包直接操作。

{: .important }
**本金赎回独立可用**：普通赎回不受协议暂停限制，也不需要维护者批准。

即使发生以下极端情况：
- 官网域名 `thefatcat.fun` 发生故障或不可访问；
- 前端服务器遭遇阻断；
- 协议治理触发了相应合约的紧急暂停开关；

交易成功仍需要链可用、仓位核验及 FATCAT 转账正常完成。请使用持有仓位的所有者钱包，并核对官方部署记录中的网络、地址和验证源码。

---

## 2. 在 BscScan 浏览器上逐步赎回本金

若官方前端发生离线，您可直接在 **BscScan** 上完成赎回：

### 第一步：获取您的仓位编号（Position ID）
1. 在 [BscScan](https://bscscan.com) 搜索并打开您的钱包地址。
2. 在交易历史中找到您最初向 `StakingVault` 发起质押的 `stake` 交易记录。
3. 点击进入 **交易详情（Transaction Details）**，切换到 **Logs（日志）** 标签页。
4. 在 `Staked(uint256 indexed id, address indexed owner, uint256 principal, address diet)` 事件中，查阅 **Topic 1** 即为您的数字仓位编号 `id`（Topic 2 为所有者地址）。

### 第二步：进入质押金库合约页面
1. 从官方部署记录取得 StakingVault 地址，再打开 BscScan 上相应的验证合约页面。
2. 点击 **Contract（合约）** 标签，随后选择 **Write Contract（写入合约）**。
3. 点击 **Connect to Web3**，连接持有该仓位的所有者钱包（如 MetaMask、Binance Web3 钱包、OKX 钱包、Trust Wallet 或 WalletConnect）。

### 第三步：调用 `redeem` 函数
1. 在函数列表中找到 `redeem`：
   ```solidity
   redeem(uint256 id)
   ```
2. 在输入框中填入您的数字仓位编号 `id`。
3. 点击 **Write** 并在钱包中确认该笔交易。
4. 交易成功并经区块确认后，**您质押的 100% FATCAT 本金将原路即时退回您的个人钱包**。

---

## 3. 为什么维护延迟不会卡住本金

在某些传统分红协议中，退出资金前必须先结算当期会计周期。而在 TheFatCat 中：

- 本金赎回**无需先推进餐次或完成奖励采购**。
- 即使暂时无人推进维护，或网络 Gas 费上涨，赎回本金也不必等待餐次推进。
- 餐次中途赎回退仓时，您仅放弃当前开放餐次尚未结算的份额；此前的历史奖励权益仍保留，没有协议到期日。

---

## 4. 直接在 BscScan 上提取收益代币

若网页不可用，需领取已结算的分红代币：

1. 从官方部署记录取得 RewardDistributor 地址，打开 BscScan 上相应的验证合约页面。
2. 在 **Read Contract** 中通过 `generationCount(id, asset)` 与 `generationAt(id, asset, i)` 核对该资产的领取世代。编号从 `0` 开始；切换后再次选择同一食谱，可能产生新的世代。通过 `batchCount(asset)` 查询已结算批次数量，最大批次下标为数量减一；数量为零时暂无批次可领取。再进入 **Write Contract**，连接仓位所有者钱包。
3. `claimNative` 可将符合条件的 WBNB 解包为原生 BNB；`claim` 则领取奖励代币与未解包的 WBNB。钱包或合约无法接收原生 BNB 时，可用 `claim` 或 `claimThrough`：
   - `id`：填入您的仓位编号。
   - `asset`：填入食谱代币合约地址（默认 BNB 请填入标准 WBNB 合约地址）。
   - `gen`：填入核对后的仓位及资产世代编号，不要默认所有领取都填 `0`。
4. 若历史积压批次过多导致单笔 Gas 过高，可调用 `claimThrough` 或 `claimNativeThrough`：
   - 额外填入 `toBatch`（目标提取截止的批次下标，按需分段领取）。
5. 点击 **Write** 并在钱包中确认即可。

{: .note }
领取只处理已结算奖励，不会替您完成尚未结束的采购或回退。若历史记录较长，应先模拟较小的领取范围，再逐段处理；不要反复重发状态不明的交易。
