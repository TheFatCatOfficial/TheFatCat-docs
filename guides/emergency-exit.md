---
layout: default
title: Emergency Exit (Without Front-End)
parent: User Guides
nav_order: 4
---

# Emergency Exit: Getting Out Without Front-End

A self-custody survival guide explaining how to redeem 100% of your staked principal directly from the blockchain using block explorers if the web interface ever becomes unavailable.

---

## 1. The Core Guarantee: Unpausable Redemption

In decentralized finance, true self-custody means you never have to trust the front-end website.

{: .important }
**Architectural Invariant**: In [`StakingVault.sol`]({% link contracts.md %}), the principal redemption function `redeem()` **deliberately ignores the contract's `paused` state**. 

Even if:
- The website domain `thefatcat.fun` goes offline;
- Front-end servers or Cloudflare are blocked;
- The protocol's emergency pause is triggered by governance;

**Your principal cannot be trapped.** No administrator, governor, or multi-sig has the technical ability to freeze your principal or redirect your tokens.

---

## 2. Step-by-Step Redemption on BscScan

If the official front-end is down, you can execute your redemption directly on **BscScan**:

### Step 1: Obtain Your Position ID
1. Look up your wallet address on [BscScan](https://bscscan.com).
2. Filter your transaction history for your original `stake` transaction to the `StakingVault`.
3. In the **Transaction Details**, click on **Logs**.
4. The `Staked(uint256 indexed id, address indexed owner, uint256 principal, address diet)` event emits your numeric position `id` in **Topic 1** (Topic 2 is the owner address).

### Step 2: Open the Staking Vault Contract
1. Navigate to the verified [`StakingVault` contract page on BscScan]({% link contracts.md %}).
2. Click on the **Contract** tab, then select **Write Contract**.
3. Click **Connect to Web3** and connect the wallet holding your position (e.g. MetaMask, Binance Web3 Wallet, OKX Wallet, Trust Wallet, or WalletConnect).

### Step 3: Execute `redeem`
1. Locate function `redeem`:
   ```solidity
   redeem(uint256 id)
   ```
2. Enter your numeric position `id` in the input field.
3. Click **Write** and confirm the transaction in your wallet.
4. Upon block inclusion, **100% of your staked FATCAT principal is returned directly to your wallet**.

---

## 3. Why a Stalled Keeper Cannot Trap You

In some protocols, closing an accounting cycle is mandatory before capital can exit. In TheFatCat:

- `redeem()` **does not call or depend on `advance()`**.
- Even if all keeper bots crash or gas prices spike to extreme levels, your principal can be withdrawn instantly at any second.
- The only effect of redeeming mid-meal is that you forfeit the single currently open interval; all previously completed intervals and settled rewards remain yours forever.

---

## 4. Claiming Rewards Directly from BscScan

To claim your accrued reward tokens without the website:

1. Navigate to the verified [`RewardDistributor`]({% link contracts.md %}) contract on BscScan.
2. Under **Write Contract**, connect your wallet.
3. Locate function `claimNative` (for native BNB unwrapping) or `claim` (for other diet tokens):
   - `id`: Enter your position ID.
   - `asset`: Enter the diet asset address (e.g. canonical WBNB contract address for BNB).
   - `gen`: Enter the generation index for this asset (typically `0` for positions that have not redirected diets).
4. For positions with extensive backlogs seeking bounded gas consumption, use `claimThrough` or `claimNativeThrough`:
   - Pass `id`, `asset`, `gen`, and `toBatch` (the highest batch index to claim up to).
5. Click **Write** and confirm.

---

## 5. Direct On-Chain Staking (Advanced)

If the web application is offline or if you are automating deposits programmatically, positions can also be opened directly via the verified [`StakingVault`]({% link contracts.md %}) contract on BscScan:

1. Under the FATCAT token contract on BscScan, call `approve(stakingVaultAddress, amount)`.
2. Navigate to `StakingVault` -> **Write Contract** -> locate `stake`:

```solidity
function stake(
    uint256 principal,
    address diet
) external returns (uint256 id);
```

- `principal`: Token amount in wei (must be $\ge 100{,}000 \times 10^{18}$ FATCAT).
- `diet`: Target reward asset address (canonical WBNB contract address for default BNB rewards).
- *Certificate Entry*: To stake with an unencumbered Seniority Certificate (lending its permanent starting multiplier), call the dedicated `stakeWithCertificate(uint256 principal, address diet, uint256 certificateId)` function.
