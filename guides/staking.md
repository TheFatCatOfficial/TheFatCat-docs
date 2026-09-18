---
title: Staking & Positions
parent: User Guides
nav_order: 1
---

# Staking & Position Management

A comprehensive guide to opening positions, adding principal, and climbing the seniority ladder in TheFatCat.

---

## 1. Prerequisites & The Entry Threshold

To open a position in TheFatCat's [`StakingVault`]({% link contracts.md %}):

- **Minimum Principal**: **100,000 FATCAT** (representing exactly 0.01% of the 1,000,000,000 total supply).
- **Approved FATCAT**: You must approve the `StakingVault` contract to spend your FATCAT tokens.
- **Gas**: A small amount of native BNB for transaction fees on BNB Chain.

{: .note }
The 100,000 FATCAT entry threshold is an immutable parameter passed to the contract's constructor. It acts as an anti-spam barrier, ensuring the state tree remains gas-efficient for all participants.

---

## 2. How to Open a Position

### Method A: Via the Web Application
1. Connect your Web3 wallet (MetaMask, Rabby, WalletConnect) at [thefatcat.fun](https://thefatcat.fun).
2. Enter the amount of FATCAT you wish to stake ($\ge 100,000$).
3. Select your desired initial **Diet** (Default is WBNB).
4. *(Optional)* If you hold an unencumbered [Seniority Certificate]({% link guides/seniority-certificates.md %}), you may link it to start with an elevated notch.
5. Click **Approve** and confirm the token allowance.
6. Click **Stake** and confirm the transaction.

### Method B: Directly on the Blockchain
You can call [`StakingVault.sol`]({% link contracts.md %}) directly:

```solidity
function stake(
    uint256 amount,
    address dietAsset,
    uint256 certificateTokenId
) external returns (uint256 positionId);
```

- `amount`: Token amount in wei (must be $\ge 100{,}000 \times 10^{18}$).
- `dietAsset`: Target reward asset address (e.g. WBNB address).
- `certificateTokenId`: `0` for standard entry (starting at Notch 1), or your Seniority Certificate token ID.

---

## 3. Position Activation Lifecycle

Staking does not grant retroactive rewards for the meal currently in progress:

```
Block Timestamp: T_now ────────► Meal Closes (advanceInterval) ────────► Next Meal Closes
[ User Calls stake() ]           [ Position Becomes Active (j_i) ]       [ First Rewards Earned ]
(During Interval m)              (Notch = 1, Weight = p_i × 1)           (Notch climbs to 2)
```

1. **Pending Interval ($m$)**: When you stake during interval $m$, your deposit is recorded in the vault immediately, but your effective weight in the currently active meal is 0.
2. **Active From ($j_i = m + 1$)**: When the keeper or any caller triggers `advanceInterval()`, your position activates at **Notch 1**.
3. **Climbing the Ladder**: For every subsequent 8-hour meal completed, your seniority notch automatically increases by $+1$ until reaching the maximum of 22 (after 21 completed active meals).

{: .important }
**The 7-Day Pre-Launch Ramp**: When the protocol is first launched, rewards are deliberately disabled for the first 21 intervals (approx. 7 days). This allows all early stakers to climb from Notch 1 to Notch 22 in a level playing field, ensuring fair reward distribution before trading taxes begin releasing.

---

## 4. Adding Principal to an Existing Position

If you already own an active position and wish to deposit additional FATCAT, you can call:

```solidity
function addPrincipal(uint256 positionId, uint256 additionalAmount) external;
```

### Key Rules for Incremental Deposits:
- **Seniority Inheritance**: The additional principal immediately adopts the existing position's seniority notch.
- **Effective Timing**: Just like initial staking, the added principal takes effect at the **next meal roll** ($m + 1$), preventing flash-deposit front-running.
- **Linear Scaling**: Your total effective weight becomes:
  
  $$\text{New Weight} = (p_{\text{old}} + p_{\text{additional}}) \times c_i(m)$$
