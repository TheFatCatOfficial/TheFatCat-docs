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

---

## 6. 绕过前端推进协议运行

自托管同样适用于结算侧。当 keeper 还没有运行时，**任何人**都可以在链上直接完成它的步骤：所有结算入口均为免许可，调用者无法改变任何资金去向，而时机未到的调用只会无害地 revert。你唯一消耗的是 gas——即便如此，仍请使用专用钱包。

合约地址在创世广播后公布于[合约]({% link zh/contracts.md %})页面；网页应用展示同样的接线关系。以下步骤的顺序与项目自有 keeper 完全一致。

### 第一步：结束当前餐次

在 **Interval Controller** 上调用：

```solidity
function advance() external;
```

结束已完成的 8 小时餐次并开启下一餐。不足八小时会以 `TooEarly` revert——稍后再试即可，没有任何异常。

```sh
cast send $CONTROLLER "advance()" --rpc-url $RPC --private-key $KEY
```

### 第二步：为待处理份额采购奖励资产

在 **Execution Router** 上调用：

```solidity
function execute(address asset, uint256 quoteIn, uint256 callerMinOut) external returns (uint256 received);
```

- `asset`：要采购的奖励资产（来自菜单）。
- `quoteIn`：本次花费的报价数量。先在 Interval Controller 上读取 `pendingQuote(asset)`；路由会自动将其钳制到池子余量、该资产的最低/最高边界（registry `entry(asset)`）以及当前批次边界。
- `callerMinOut`：可选的个人下限。填 `0` 即可——链上 TWAP 下限始终额外生效。如需收紧，请按 Router 与 Distributor 上的 `previewMinOut(asset, spendFor(asset, quoteIn))` 取值。

如果别人已经执行过该份额，或金额低于资产下限，调用会无害地 revert——没有任何东西移动。

```sh
cast call $CONTROLLER "pendingQuote(address)(uint256)" $ASSET --rpc-url $RPC
cast send $ROUTER "execute(address,uint256,uint256)" $ASSET $QUOTE_IN $MIN_OUT --rpc-url $RPC --private-key $KEY
```

### 第三步：将停滞份额以 BNB 结算

若某奖励资产已被禁用，或其份额等待时间超过暂存上限（三天），任何人都可以在 **Execution Router** 上将该份额以原生 BNB 结算：

```solidity
function fallbackFinalize(address asset) external returns (uint256 quoteIn);
```

```sh
cast send $ROUTER "fallbackFinalize(address)" $ASSET --rpc-url $RPC --private-key $KEY
```

### 第四步：转发收入中继（可选）

费用先落在收入中继金库，再进入 The Belly。若唤醒调用尚未送达，任何人都可以转发全部待处理余额——它会自动在运营 Safe 与 The Belly 之间分配：

```solidity
function flush() external;
function sync() external;
```

```sh
cast send $VAULT "flush()" --rpc-url $RPC --private-key $KEY
```

### 第五步：刷新过期价格窗口

若 `execute` 因预言机过期而 revert（价格窗口约一小时），先在该资产的 TWAP 预言机上调用 `update()`，然后重复第二步。

---

以上所有步骤对赎回都永非必需。第一节在任何一秒、任何暂停状态、所有 keeper 离线的情况下都照常工作。
