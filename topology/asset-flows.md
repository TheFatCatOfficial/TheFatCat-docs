---
layout: default
title: Asset Flows
parent: System Topology
nav_order: 1
---

# Asset Flows

TheFatCat holds staking principal separately from trading-tax reward funds. The diagram shows the main route from protocol revenue to position rewards:

![TheFatCat Protocol Fund Flows]({{ '/assets/images/fig1-topology.svg' | relative_url }}?v=20261017u1)

[View full diagram (new tab)]({{ '/assets/images/fig1-topology.svg' | relative_url }}?v=20261017u1){:target="_blank" rel="noopener noreferrer"}
{: .tfc-figure-link }

---

## 1. Tax Inflow in QQQB

Eligible `$FATCAT` trades carry the configured 4% tax. After Flap deducts its platform fee, QQQB tax revenue enters the protocol's revenue-processing stage. After graduation, tax liquidation is batched; each trade does not necessarily create an immediate Belly inflow. Verify actual fees and receipts against [Core Contracts]({% link deployment.md %}) and on-chain transactions.

---

## 2. Dual-Route Conversion and Revenue Allocation

{% capture diagram_content %}QQQB tax revenue → Dual-route swap with price checks → WBNB
  → Eligible FEED conversion: 1/38 of output credited as a Feeder reward
  → Remaining net revenue: 85% to the Belly reward treasury
                            15% for development, operations and marketing{% endcapture %}
{% include components/diagram-frame.html tag="ASSET FLOW" title="QQQB Conversion and Revenue Allocation" content=diagram_content %}

Anyone can help through FEED when execution conditions permit, with official maintenance supplementing processing when needed. Participants pay gas and supply no personal QQQB; they cannot change the conversion route or revenue destination. Successful conversion and revenue allocation complete in the same transaction, with no duplicate operations deduction. Standalone conversion earns no Feeder reward.

Later advancement or purchase failures do not undo a successful FEED conversion or its eligible reward. The 85%/15% split applies to net proceeds after upstream fees, actual conversion costs and any earned Feeder reward, rather than trade value. See [Tax Routing & Fees]({% link protocol/fees.md %}) and [FEED & Decentralized Maintenance]({% link guides/community-keeper.md %}).

Upstream revenue processing and delegated-operation services have upgrade and emergency fund-handling permissions that can affect future revenue and delegated behavior. Their boundaries differ from the principal vault's. See [Custody & Accounting Boundaries]({% link safety/custody.md %}).

---

## 3. Principal and Rewards Are Held Separately

- **Staking Principal Vault**: Holds deposited `$FATCAT` principal, without using it for tax conversion or reward purchases.
- **Belly Reward Treasury**: Holds WBNB reward reserves and has no authority to withdraw users' staked principal.
- **Settled Rewards**: Recorded for each position after purchases or fallback complete, and claimed separately from principal redemption.
