---
layout: default
title: 核心协议金库合约
parent: 合约规范与地址
nav_order: 1
---

# 核心协议金库合约

TheFatCat 的底层存储与资金托管层在合约代码层面强制实施质押本金与分红储备的严格合约隔离：

---

## 1. 质押本金金库 (`StakingVault.sol`)

- **架构职责**：完全隔离托管 100% 质押者存入的 FATCAT 本金代币。
- **核心不变量**：
  - **零税收流入**：合约绝不接收任何交易税或二级市场兑换资金。
  - **100,000 FATCAT 最低门槛**：拒绝低于门槛的碎片小额开仓，杜绝粉尘女巫粉碎攻击。
  - **不可暂停的本金赎回**：`redeem()` 赎回函数故意绕过紧急暂停状态机，确保在任何极端行情或治理停摆情境下，质押者对本金的绝对提款权不受任何限制。
  - **零管理员扫仓特权**：合约内未编写任何 `sweepToken()`、`emergencyWithdraw()` 或强制转移后门。

---

## 2. Belly 分红金库 (`Belly.sol`)

- **架构职责**：托管由二级市场交易税清算所得的计价货币（WBNB）储备。
- **核心不变量**：
  - **无特权去中心化蓄水池**：全网没有任何管理员私钥能够随意抽干或挪用金库资金。
  - **7-窗口资金流出安全限额**：在任意单个 8 小时间隔内，累计划转额度受到严格硬编码限制：
    $$\text{单窗口限额} = \text{未保留余额} \times \frac{16}{168} \approx 9.5238\%$$
    即使遭遇极端漏洞攻击，抽干 50% 储备也至少需要 7 个完整餐次（48–56 小时），为防御提供了充裕的安全响应时间。
  - **严格受控释放**：资金离开 The Belly 的唯一途径是调用 `release(amount)`，且调用者**严格且仅限唯一写入一次绑定的授权提款方（`ExecutionRouter`）**。`IntervalController.advance()` 会调用 `Belly.sync()` 对账并登记分配额度；它不能调用 `release()` 提款，实际出金由 Router 在采购或回退结算时执行。

---

## 3. QQQB 收入接入体系

- **`FatCatQqqbVaultFactory`**：向 Flap 提供的入口工厂，接入预先部署的上游实现，创建 Beacon、QQQB 金库代理及固定 BNB 接收器，声明发射计价资产为 QQQB。Belly 和奖励核心独立部署，Factory 地址不是整个协议所有合约地址的别名。
- **`FatCatQqqbVault`**：接收协议 QQQB，在链上价格、金额和额度检查通过后，执行固定 QQQB → USDT → WBNB 路线，再将兑换所得送入已配置的接收器。公众调用无需提供或授权自己的 QQQB，也不能重定向兑换所得。初始单笔转换范围为 0.1–50 QQQB，没有每小时或每日累计额度。Governor 与 Flap Guardian 可通过 `setConversionLimit(newLimit)` 修改单笔上限；最低可设置的上限是 10 QQQB，并非最小转换额。修改单笔上限不会启用累计额度。收入转换使用一小时 TWAP、300 bps 偏离边界，与奖励采购的初始 200 bps 边界分开。
- **`FatCatMaintenanceRewards`**：托管符合资格的 FEED 调用者成功转换后，按 `floor(WBNB 总产出 / 38)` 累计的推动奖励（名义目标为所对应交易额的 0.1%），直到其主动领取；后续推进或采购失败不撤销此奖励。该模块每个金库各有一份，不受 Beacon 升级。
- **`FatCatStakingVault`**：固定实现的 BNB 接收器，在兑换的同一笔交易内处理所得。其 `flush()` 将剩余 BNB 包装为 WBNB，85% 进入 Belly 奖励国库、15% 转入 Ops Safe 作为项目开发、运营和营销资金（精确比例为 17/20 与 3/20），整数余数留给 Belly。运营分账仅在此执行一次；该接收器和奖励核心都不受上游 Beacon 升级控制。

### Beacon 所有权与升级授权

Factory 持有 Beacon，但只有规范 Flap Guardian 能调用 Factory 的 `upgradeVaultImplementation(address)` 或 `lockVaultUpgrades()`。`beaconImplementation()` 查询当前实现，`isVaultUpgradesLocked()` 查询是否已永久关闭升级。部署者和项目多签没有通过这些入口升级的权限。

部署默认保留升级能力。**主动执行永久锁定后不可恢复。** 锁定前 Guardian 的升级可以改变同一 Factory 下所有上游 QQQB 金库的执行行为，包括尚未兑换资产的处理方式；该权限不能升级固定接收器、Belly 或质押本金合约。升级不会撤销已执行交易，也不保证自动修复已改变的存储。详见[监控与暂停范围]({% link zh/safety/monitoring.md %})。
