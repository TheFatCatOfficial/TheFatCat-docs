---
layout: default
title: Emergency Exit Guide (Without Front-End)
parent: User Guides
nav_order: 5
---

# Emergency Exit Guide: Getting Out Without Front-End

A guide to redeeming ordinary staking principal and claiming settled rewards through a block explorer when the web interface is unavailable. These examples require an official deployment record and verified contracts; this documentation does not supply production addresses.

---

## 1. The Core Guarantee: Redemption During a Pause

Staking principal is held by an on-chain contract. When the website is unavailable, you can still act directly using the wallet that owns the position.

{: .important }
**Independent Principal Redemption**: Ordinary redemption remains available during a protocol pause without a maintainer's approval.

Even if:
- The website domain `thefatcat.fun` goes offline;
- Front-end servers are blocked;
- The protocol's emergency pause is triggered by governance;

Completion still requires an available chain, successful position checks and a successful FATCAT transfer. Use the position owner's wallet and verify the network, address and source against the official deployment record.

---

## 2. Step-by-Step Redemption on BscScan

If the official front-end is down, you can execute your redemption directly on **BscScan**:

### Step 1: Obtain Your Position ID
1. Look up your wallet address on [BscScan](https://bscscan.com).
2. Filter your transaction history for your original `stake` transaction to the `StakingVault`.
3. In the **Transaction Details**, click on **Logs**.
4. The `Staked(uint256 indexed id, address indexed owner, uint256 principal, address diet)` event emits your numeric position `id` in **Topic 1** (Topic 2 is the owner address).

### Step 2: Open the Staking Vault Contract
1. Use the official deployment record to find the StakingVault address, then open its verified contract page on BscScan.
2. Click on the **Contract** tab, then select **Write Contract**.
3. Click **Connect to Web3** and connect the wallet holding your position (e.g. MetaMask, Binance Web3 Wallet, OKX Wallet, Trust Wallet, or WalletConnect).

### Step 3: Execute `redeem`
1. Locate function `redeem`:
   ```solidity
   redeem(uint256 id)
   ```
2. Enter your numeric position `id` in the input field.
3. Click **Write** and confirm the transaction in your wallet.
4. After successful execution and block confirmation, **100% of your staked FATCAT principal is returned directly to your wallet**.

---

## 3. Why Delayed Maintenance Cannot Trap Your Principal

In some protocols, closing an accounting cycle is mandatory before capital can exit. In TheFatCat:

- Principal redemption **does not require a meal advance or completed reward purchases first**.
- Even if no one runs maintenance or gas prices spike, your principal can be withdrawn without waiting for a meal advance.
- Redeeming mid-meal forfeits that open meal's unsettled share. Historical reward entitlements remain recorded without a protocol expiry.

---

## 4. Claiming Rewards Directly from BscScan

To claim your accrued reward tokens without the website:

1. Find RewardDistributor in the official deployment record and open that address's verified contract page on BscScan.
2. Under **Read Contract**, check `generationCount(id, asset)` and `generationAt(id, asset, i)` to identify the asset's claim generations. Indexes start at `0`; a later return to the same diet can create another generation. Use `batchCount(asset)` to find the number of settled batches; the highest batch index is the count minus one, and there is no batch to claim when the count is zero. Then connect the position owner's wallet under **Write Contract**.
3. Use `claimNative` to unwrap eligible WBNB into native BNB, or `claim` to receive reward tokens and WBNB without unwrapping. If your wallet or contract cannot receive native BNB, use `claim` or `claimThrough`:
   - `id`: Enter your position ID.
   - `asset`: Enter the diet asset address (e.g. canonical WBNB contract address for BNB).
   - `gen`: Enter the verified generation index for this position and asset; do not assume every claim uses `0`.
4. For positions with extensive backlogs seeking bounded gas consumption, use `claimThrough` or `claimNativeThrough`:
   - Pass `id`, `asset`, `gen`, and `toBatch` (the highest batch index to claim up to).
5. Click **Write** and confirm.

{: .note }
Claiming handles settled rewards only; it does not finish pending purchases or fallback settlement. For a long history, simulate a smaller claim range before processing it progressively. Resolve uncertain transaction status before resubmitting.
