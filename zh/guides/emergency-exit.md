---
layout: default
title: 紧急退出（脱离前端交互）
parent: 用户操作指南
nav_order: 4
---

# 紧急退出指南：脱离前端的链上自主赎回

面向自我托管（Self-Custody）用户的实战生存指南：当官方网站前端离线、服务器故障或遭遇外部封锁时，如何直接在 BscScan 区块链浏览器上 100% 安全赎回您的质押本金。

---

## 1. 核心底层保障：不可暂停的本金赎回（Unpausable）

在真正的去中心化金融中，绝对的自我托管意味着您永远无需盲目信任前端网页。

{: .important }
**底层架构不变量**：在 [`StakingVault.sol`]({% link zh/contracts.md %}) 合约中，本金赎回函数 `redeem()` **被刻意设计为完全忽略合约的 `paused` 紧急暂停状态**。

即使发生以下极端情况：
- 官网域名 `thefatcat.fun` 发生故障或不可访问；
- 前端服务器或 Cloudflare 遭遇阻断；
- 协议多签治理触发了全局紧急暂停开关；

**您的本金绝对无法被冻结或扣留。** 全网没有任何管理员、治理团队或多签私钥拥有冻结您本金或篡改代币流向的技术特权。

---

## 2. 在 BscScan 浏览器上逐步赎回本金

若官方前端发生离线，您可直接在 **BscScan** 上完成赎回：

### 第一步：获取您的仓位编号（Position ID）
1. 在 [BscScan](https://bscscan.com) 搜索并打开您的钱包地址。
2. 在交易历史中找到您最初向 `StakingVault` 发起质押的 `stake` 交易记录。
3. 点击进入 **交易详情（Transaction Details）**，切换到 **Logs（日志）** 标签页。
4. 在 `Staked(uint256 indexed id, address indexed owner, uint256 principal, address diet)` 事件中，查阅 **Topic 1** 即为您的数字仓位编号 `id`（Topic 2 为所有者地址）。

### 第二步：进入质押金库合约页面
1. 打开官方已开源验证的 [`StakingVault` 合约页面]({% link zh/contracts.md %})。
2. 点击 **Contract（合约）** 标签，随后选择 **Write Contract（写入合约）**。
3. 点击 **Connect to Web3**，连接持有该仓位的所有者钱包（如 MetaMask、Binance Web3 钱包、OKX 钱包、Trust Wallet 或 WalletConnect）。

### 第三步：调用 `redeem` 函数
1. 在函数列表中找到 `redeem`：
   ```solidity
   redeem(uint256 id)
   ```
2. 在输入框中填入您的数字仓位编号 `id`。
3. 点击 **Write** 并在钱包中确认该笔交易。
4. 交易被区块打包确认后，**您质押的 100% FATCAT 本金将原路即时退回您的个人钱包**。

---

## 3. 为什么 Keeper 离线无法卡住您的资金

在某些传统分红协议中，退出资金前必须先结算当期会计周期。而在 TheFatCat 中：

- `redeem()` **完全不调用也不依赖 `advance()` 时钟推进**。
- 即使全网所有 Keeper 机器人宕机，或网络 Gas 费飙升至极端水平，您的本金在任意区块、任意秒数均可随调随取。
- 餐次中途赎回退仓的唯一影响是：您仅放弃当前正在开放结算的这单个餐次收益；所有此前已结算的历史餐次与代币收益依然永久归您所有。

---

## 4. 直接在 BscScan 上提取收益代币

若需在脱网环境下提取已累积的分红代币：

1. 打开 BscScan 上已验证的 [`RewardDistributor`]({% link zh/contracts.md %}) 合约页面。
2. 在 **Write Contract** 界面连接钱包。
3. 找到 `claimNative`（适用于默认 BNB 收益并自动解包为原生币）或 `claim`（适用于其他食谱代币）：
   - `id`：填入您的仓位编号。
   - `asset`：填入食谱代币合约地址（默认 BNB 请填入标准 WBNB 合约地址）。
   - `gen`：填入当前资产的世代编号（若未重定向过食谱，填 `0`）。
4. 若历史积压批次过多导致单笔 Gas 过高，可调用 `claimThrough` 或 `claimNativeThrough`：
   - 额外填入 `toBatch`（目标提取截止的批次下标，按需分段领取）。
5. 点击 **Write** 并在钱包中确认即可。

---

## 5. 直接在区块链上进行开仓质押（资深模式）

若官方 Web 应用不可用，或您希望通过编写脚本实现自动化质押，亦可直接通过 BscScan 上的已验证 [`StakingVault`]({% link zh/contracts.md %}) 合约开立仓位：

1. 先在 BscScan 的 FATCAT 代币合约上，调用 `approve(stakingVaultAddress, amount)` 授权额度。
2. 前往 `StakingVault` -> **Write Contract** -> 找到 `stake` 函数：

```solidity
function stake(
    uint256 principal,
    address diet
) external returns (uint256 id);
```

- `principal`：以 wei 为单位的代币数量（必须 $\ge 100{,}000 \times 10^{18}$ FATCAT）。
- `diet`：目标分红资产合约地址（默认 BNB 分红请填入规范 WBNB 合约地址）。
- *凭证开仓*：若持有空闲资历凭证希望继承固定起跑倍数，请调用独立函数 `stakeWithCertificate(uint256 principal, address diet, uint256 certificateId)`。
