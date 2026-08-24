---
title: Fees and the Belly
parent: Protocol
nav_order: 1
---

# Fees and the Belly

## Fee split

Every buy and sell carries a total 5% trading fee.

| Share | Destination | Purpose |
|:--|:--|:--|
| 4.0% | The Belly | Reward capital |
| 0.7% | Operations | Art, hosting, keepers, review and gas |
| 0.3% | Launch platform | Platform fee |

Wallet-to-wallet transfers are not trades and are not part of this fee path.

## Release rule

A valid meal releases:

```
Belly balance × elapsed hours ÷ 168 hours
```

Meals have an eight-hour minimum. An eight-hour meal therefore releases 8/168,
or about 4.762%, of the eligible balance. A late roll can release more elapsed
time, subject to the protocol's safety cap.

Because each release is proportional, a volume spike raises the Belly and is
spread across later meals. When volume stops, the Belly decays instead of
emptying in one payment. It is a shock absorber, not a guaranteed income stream.

## What the Belly is not

- It is not an operations wallet.
- It is not a pool an administrator may sweep.
- Its balance is not immediately owed to current positions.
- It does not create a fixed or annualised rate.
