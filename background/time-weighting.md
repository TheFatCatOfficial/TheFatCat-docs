---
layout: default
title: The Power of Staked Time
parent: Background & Philosophy
nav_order: 4
---

# The Power of Staked Time: Duration Weighting & The Time Variable

In conventional decentralized finance (DeFi) and dividend protocols, reward allocation is dominated by simplistic capital supremacy. TheFatCat establishes **"Staked Time"** as the protocol's primary innovation variable, restructuring on-chain dividend distribution through the product of capital and duration weighting.

---

## 1. Dilemmas of Traditional Architectures

### The TVL-Only Trap in Conventional DeFi
The vast majority of yield farming and reflection protocols rely exclusively on Total Value Locked (TVL) to determine reward shares. Under this paradigm, raw capital scale becomes an absolute tyrant: speculative hot capital can enter moments before a distribution boundary, capture an outsized share of rewards, and exit immediately. Long-term stakers who endure token price volatility and build protocol resilience see their payouts diluted by capital that spent zero time in the system.

### Coercive Lockups in Vote-Escrow (ve) Models
To incentivize long-term alignment, the industry developed vote-escrow (ve) architectures popularized by Curve. Users lock tokens for months or years in exchange for higher voting weight and boosted emissions. However, ve-tokenomics achieves this by **stripping users of principal liquidity sovereignty**: capital becomes frozen and illiquid, eliminating the user's ability to respond to extreme market shifts or sudden personal liquidity needs.

---

## 2. TheFatCat's Solution: Staked Time as a Variable

TheFatCat rejects both the predatoriness of TVL-only farming and the coercive rigidity of ve-lockups. Instead, it introduces **Staked Time** as the protocol's sole non-capital weighting input.

A staking position's effective allocation weight is determined by multiplying its staked principal by its accrued time multiplier:

$$\text{Effective Weight} = \text{Staked Principal} \times \text{Time Multiplier}, \quad \text{Time Multiplier} \in [1.0\times, 22.0\times]$$

### The Linear Ramp Mechanics
- **Entry Floor**: Stakers must deposit at least 100,000 FATCAT to open a staking position (an immutable entry floor that prevents dust spamming);
- **Baseline Start**: A newly opened standard position enters with a baseline multiplier of $1.0\times$;
- **Discrete Accrual**: For every completed active meal (8 hours) spent seated, the multiplier increases additively by $+1.0\times$;
- **Ceiling**: Stakers who remain continuously seated for 21 meals (exactly 7 days under standard cadence) reach the maximum $22.0\times$ multiplier ceiling.

---

## 3. Liquidity Sovereignty & Time Defense

### 100% Unlocked Principal (Zero Coercive Lockups)
Stakers retain sovereign custody of their capital at all times. Users may call `redeem()` at any arbitrary block to withdraw 100% of their principal. The smart contract deliberately bypasses the emergency pause mechanism for redemptions, ensuring user funds can never be held hostage by governance or protocol halts.

### Multiplier Forfeiture & Defense Moat
While stakers enjoy unconditional liquidity freedom, exiting immediately **resets the accrued time multiplier to zero**. Leaving an active meal forfeits only that single unfinalized interval.

This design achieves an elegant economic equilibrium between liquidity freedom and long-term loyalty:
- **Time as a Natural Moat**: Mercenary capital attempting sudden entries receives only the baseline $1.0\times$ notch due to a lack of duration history;
- **Rewarding Continuous Presence**: Seated stakers with 7 days of tenure hold a $22.0\times$ multiplier, capturing 22 times more yield per unit of capital than fresh arrivals. Large capital seeking maximum yield efficiency must also remain continuously seated alongside the community.

---

## 4. Respecting Capital Scale While Preserving Linearity

TheFatCat's philosophy does not oppose large capital. Stakers with large positions naturally retain their proportional economic weight:

- **Strict Capital Linearity**: Under identical time multipliers, $10\times$ principal earns exactly $10\times$ the effective weight. The protocol respects genuine capital commitment without quadratic scaling or whale-tier multipliers;
- **Capital Cannot Override Time**: Large capital enjoys its rightful linear return, but cannot bypass the duration ramp solely through sheer volume. On the time axis, all positions must spend 21 intervals climbing from $1.0\times$ to $22.0\times$.

---

## 5. Assetization of Duration: Time-Seniority Certificates (ERC-721)

Irreversible on-chain time is the protocol's most scarce and authentic asset. Real duration committed by seated stakers should not simply vanish upon exit.

The protocol incorporates an on-chain credential mechanism—the **Time-Seniority Certificate**:
- **Crystallizing Duration via Burning**: Exiting stakers can burn FATCAT upon retiring a position to permanently crystallize their accumulated duration into an on-chain credential;
- **Dual Economic Mechanisms**:
  - **Token Deflation**: Minting certificates permanently burns FATCAT out of circulation, generating continuous supply-side deflationary pressure;
  - **Treasury Accretion**: Secondary transfers and trades route exclusive transaction fees directly into The Belly reservoir, continuously bolstering rewards for active seated stakers;
- **Contract Constraints**: Capped at 9,999 total units (`MAX_SUPPLY`), with 5% ERC-2981 secondary royalties routed to `CertificateRevenueVault` and activation governed via `CERTIFICATE_BINDING_DELAY` in `StakingVault.sol`.
