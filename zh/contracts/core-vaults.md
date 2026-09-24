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
  - **严格受控释放**：资金离开 The Belly 的唯一途径是调用 `release(amount)`，且调用者**严格且仅限唯一写入一次绑定的授权提款方（`ExecutionRouter`）**。`IntervalController` 仅作为计算时钟与推进额度记账，本身绝不持有 Belly 权限，亦从不直接调用 Belly。

---

## 3. QQQB 收入接入体系

- **`FatCatQqqbVaultFactory`**：向 Flap 提供的入口工厂，接入预先部署的上游实现，创建 Beacon、QQQB 金库代理及固定 BNB 接收器，声明发射计价资产为 QQQB。Belly 和奖励核心独立部署，Factory 地址不是整个协议所有合约地址的别名。
- **`FatCatQqqbVault`**：接收协议 QQQB，在链上价格、金额和额度检查通过后，执行固定 QQQB → USDT → WBNB 路线，再将兑换所得送入已配置的接收器。公众调用无需提供或授权自己的 QQQB，也不能重定向兑换所得。Governor 与 Flap Guardian 可通过 `setConversionLimit(newLimit)` 动态调节限额、桶容量与补充速率（下限 10 QQQB）。
- **`FatCatMaintenanceRewards`**：托管符合资格的转换调用者按 WBNB 总产出 0.1% 累计的推动奖励，直到其主动领取。该模块每个金库各有一份，不受 Beacon 升级。
- **`FatCatStakingVault`**：固定实现的 BNB 接收器，在兑换的同一笔交易内处理所得。其 `flush()` 将剩余 BNB 包装为 WBNB，3/19 分给 Ops、16/19 进入 Belly，整数余数留给 Belly。运营分账仅在此执行一次；该接收器和奖励核心都不受上游 Beacon 升级控制。

### Beacon 所有权与升级授权

Factory 持有 Beacon，但只有规范 Flap Guardian 能调用 Factory 的 `upgradeVaultImplementation(address)` 或 `lockVaultUpgrades()`。`beaconImplementation()` 查询当前实现，`isVaultUpgradesLocked()` 查询是否已永久关闭升级。部署者和项目多签没有通过这些入口升级的权限。

部署默认保留升级能力。**主动执行永久锁定后不可恢复。** 锁定前 Guardian 的升级可以改变同一 Factory 下所有上游 QQQB 金库的执行行为，包括尚未兑换资产的处理方式；该权限不能升级固定接收器、Belly 或质押本金合约。切回旧代码不会撤销已执行交易，也不能保证修复已改变的存储。详见[监控与暂停范围]({% link zh/safety/monitoring.md %})。
