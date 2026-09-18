---
title: FAQ & Limitations
nav_order: 8
---

# Frequently Asked Questions (FAQ) & Limitations

Clear, honest answers to high-frequency community and technical questions regarding TheFatCat protocol.

---

## Staking & Seniority

### Why is there no published APY or APR?
Because TheFatCat is an authentic decentralized trading tax routing protocol, not an inflationary ponzi or lending protocol. Rewards depend entirely on actual trading volume, the current Belly balance, active staker weights, and individual diet choices. Any fixed yield number would be an artificial marketing fabrication.

### Why are there zero reward emissions during the first 7 days?
During the initial 21 intervals (approx. 7 days at 8-hour cadence), the protocol runs a fair-launch **Seniority Ramp Period**. Trading volume accumulates in The Belly, but reward emissions are paused so that all early stakers climb simultaneously from Notch 1 to Notch 22. This eliminates unfair early-block skimming and ensures long-term stakers establish full weight before the first meal is distributed.

### What happens if I redeem my principal?
You may call `redeem()` at any block to withdraw 100% of your principal. There is zero exit fee or lockup penalty. The only trade-off is that redeeming forfeits the single currently open interval and ends that position's seniority. Any rewards settled in previous intervals remain permanently yours to claim in the distributor.

### If I change my Diet, does my seniority notch reset?
**No.** Your seniority notch is tied to your position's tenure in the pool, not your choice of asset. Changing your diet takes effect at the next meal boundary and preserves 100% of your accumulated seniority notch.

---

## Seniority Certificates (NFTs)

### What is a Seniority Certificate, and why does it require burning 100,000 FATCAT?
A [Seniority Certificate]({% link guides/seniority-certificates.md %}) is an on-chain ERC-721 credential minted upon full position exit. Burning 100,000 FATCAT to the dead address (`0x...dEaD`) ensures proof-of-sacrifice, directly shrinking circulating token supply and proving genuine commitment. The certificate permanently imprints the notch (1–22) you achieved.

### Can I chain multiple Seniority Certificates together?
**No.** Under the protocol's strict **Anti-Chaining Invariant**, a position that was opened using a certificate cannot mint another certificate upon exit. Certificates cannot be perpetually recycled to create infinite credential cascades.

---

## The Belly & Mechanics

### Why doesn't The Belly payout match the exact trading fees from the last 8 hours?
The Belly operates as an **exponential damping reservoir**, not a direct pass-through pipe. Each meal releases a proportional slice of its net unreserved balance ($\approx 4.76\%$), not the raw fees of that specific interval. Spikes in volume are absorbed and smoothed across weeks, ensuring payments continue even when trading enters quiet periods.

### Why is The Belly balance reading zero early on?
On BNB Chain, Flap's upstream tax processor accumulates FATCAT tax tokens and liquidates them for WBNB only when the liquidation threshold (~400,000 FATCAT) is crossed and an eligible sell trade occurs. Before the first threshold liquidation, the on-chain vault reads zero while fees accrue upstream.

---

## Security & Custody

### What happens if the website goes offline?
Your principal does not depend on our website. Staking contracts are fully permissionless and verifiable on BscScan. Follow our [Emergency Exit Guide]({% link guides/emergency-exit.md %}) to redeem your principal directly on-chain.

### Can an administrator freeze my principal?
**No.** In [`StakingVault.sol`]({% link contracts.md %}), the `redeem()` function intentionally ignores the contract's `paused` variable. Even during emergency governance pauses, the path that returns your principal can never be obstructed.

### Can an administrator or developer rug pull or drain user funds?
**No.** StakingVault and The Belly have zero sweep, withdrawal, or migration functions. Once deployed, no account—administrative or otherwise—has code paths to withdraw stakers' principal or unallocated reward capital. Outflows are strictly bound by the interval clock and mathematical release formulas.
