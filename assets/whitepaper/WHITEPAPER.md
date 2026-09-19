# TheFatCat Whitepaper

### Decentralized Trading-Tax Routing Protocol with Adaptive Damping and Seniority-Weighted Allocation

**Version: 1.0 Official Release | Date: September 15, 2026**
*Derived from Project Plan v0.5 and checked against the current contract source and launch configuration. Equations identified as analytical models state their assumptions explicitly. The ordinary production path assumes no seniority head start; the current worktree's explicitly non-deployable `stakeWithHead` experiment is outside this specification and must not ship in the release build. This document contains no projected returns or promises of yield.*

---

## Abstract

Common decentralized trading-tax (dividend / reflection) designs use a shared reward configuration, pass fees through with little or no time buffer, and allocate by capital without a seniority input. These are properties of the upstream pattern compared here, not claims about every tax-token implementation.

TheFatCat combines the following mechanisms in one protocol architecture:
1. **The Belly Kinetic Reservoir**: A permissionlessly advanced damping reservoir that can allocate once at least 8 hours have elapsed. At the nominal cadence it allocates $\frac{1}{21} \approx 4.7619\%$ of unreserved quote balance per interval, producing an idealized zero-inflow half-life of 4.735 days;
2. **$O(1)$ Closed-Form Seniority Ledger**: Linear scalar decomposition aggregates dynamic seniority coefficients (levels 1 through 22) across arbitrary numbers of stakers without iterating over positions. End-to-end claims remain linear in the execution batches traversed and can be bounded with `claimThrough`;
3. **Sovereign Diet Architecture**: Each position chooses its procurement asset. Ignoring probation caps and integer dust, the gross quote budget attributable to a position depends on its share of total weight; asset choice still affects execution, market value, issuer exposure, and outside incentives;
4. **Dual-Liability Accounting & Conservative Rounding**: Canonical WBNB is the default and fallback quote asset. Batch accounting, exact-delivery checks, and downward rounding maintain tested solvency invariants under the supported token model.

---

## 1. Introduction & Paradigm Shift

### 1.1 The Triple Structural Dilemma of Traditional Pass-Through Tax Tokens

In existing Automated Market Maker (AMM) ecosystems, many dividend-bearing tokens rely on pass-through pipelines: taking a percentage fee from swaps, converting it into a configured reward token, and streaming it to holders. The upstream template used for this comparison has three limitations:

1. **Shared Reward Configuration**: One reward asset or basket is configured for all eligible holders; the upstream path does not expose a distinct choice per staking position;
2. **Unbuffered Timing**: New fee income falls with new trading volume. A direct pass-through transmits that change quickly instead of metering an accumulated reservoir over later intervals;
3. **No Seniority Input**: Allocation follows capital share and assigns no additional coefficient to holding duration. Short-lived capital can dominate current distributions when it supplies most of the eligible balance, although it does not thereby acquire rewards already assigned before entry.

### 1.2 The Reservoir Model: Damping Flow into Sticky Inventory

TheFatCat transforms the pass-through pipe into a self-damped physical reservoir—**The Belly**. Out of the 4.0% trading tax, Flap withholds 10% (~0.4%), the forwarding vault splits its proceeds at 5/36 (~0.5%) atomically to an operations Safe, and the remaining 31/36 (~3.1%) is injected as potential energy into the reservoir, released by a deterministic clock. Transient volatility is converted into cross-interval inventory.

![Figure 1: Protocol Capital Flow & State Transition Topology](assets/figures/fig1-topology.svg)

---

## 2. The Belly Hydrodynamics & Time-Proration

### 2.1 First-Order Exponential Decay and Steady-State Watermark Equation

The Belly rejects fixed-quota emissions. Allocation is computed from **unreserved quote balance**: `accounted - outstandingClaims`, not from the gross token balance alone.

Under nominal conditions, the protocol advances its state clock at a minimum interval $\Delta t_{\min} = 8\text{ hours}$, normalized against a weekly denominator ($T_{\text{week}} = 168\text{ hours}$). The nominal allocation coefficient $\alpha$ per meal is:

$$\alpha = \frac{\Delta t_{\min}}{T_{\text{week}}} = \frac{8}{168} = \frac{1}{21} \approx 4.7619\%$$

Let $B_k$ denote unreserved quote balance immediately before nominal settlement interval $k$. If external inflow is zero, every interval closes exactly eight hours apart, each meal is valid, every allocation is executed immediately, and integer dust is ignored, the analytical model follows a discrete first-order exponential decay:

$$B_{k+1} = B_k \cdot (1 - \alpha) = B_k \cdot \left(\frac{20}{21}\right)$$

By mathematical induction, the remaining treasury capital after $k$ settlement intervals satisfies:

$$B(k) = B_0 \cdot \left(\frac{20}{21}\right)^k$$

If the external market injects fees at a constant rate $I$ per 8-hour window, the system achieves dynamic equilibrium when $B_{\text{eq}} \cdot \alpha = I$:

$$B_{\text{eq}} = \frac{I}{\alpha} = 21 \cdot I$$

**Idealized steady state**: Under the same cadence and execution assumptions, a constant inflow of $I$ per eight-hour interval produces a pre-settlement equilibrium of $21I$, equivalent to seven days of that modeled inflow. Live balances vary with lumpy fee arrivals, delayed advances, unexecuted claims, caps, invalid meals, and integer rounding.

### 2.2 Analytical Derivation of Half-Life

Setting $B(k) = \frac{1}{2} B_0$, we derive the number of distribution cycles $k_{1/2}$ required for treasury capital to halve:

$$\left(\frac{20}{21}\right)^{k_{1/2}} = \frac{1}{2} \implies k_{1/2} = \frac{\ln(0.5)}{\ln(20/21)} = \frac{-\ln 2}{\ln 20 - \ln 21} \approx \frac{-0.693147}{-0.048790} \approx 14.207 \text{ cycles}$$

Converting cycles into absolute physical time $t_{1/2}$:

$$t_{1/2} = k_{1/2} \times 8 \text{ hours} \approx 113.65 \text{ hours} \approx 4.735 \text{ days}$$

#### Decay Trajectory under Zero-Volume Regime

| Physical Elapsed Time ($V=0$) | Cycles Elapsed ($k$) | Theoretical Balance Ratio $B(k)/B_0$ | Discrete Exact Value |
|---|---|---|---|
| **Day 1** (24 hours) | 3 | $(20/21)^3$ | **86.38%** |
| **Day 3** (72 hours) | 9 | $(20/21)^9$ | **64.46%** |
| **Day 7** (168 hours) | 21 | $(20/21)^{21}$ | **35.89%** |
| **Day 14** (336 hours) | 42 | $(20/21)^{42}$ | **12.88%** |
| **Day 30** (720 hours) | 90 | $(20/21)^{90}$ | **1.24%** |

Within this ideal model, a quiet week does not mathematically exhaust the reservoir, while 30 zero-inflow days leave only about 1.24% of the starting balance. The mechanism is a damping reservoir, not a perpetual source of value.

### 2.3 Dynamic Time-Proration and Windowed Outflow Rate-Limiting

In production, block timestamps fluctuate, and external keepers may experience temporary downtime. The clock controller compensates for elapsed duration via linear proration, bound by two physical circuit breakers:

1. **Maximum Allocation Span Cap (`CAP_SPAN`)**:
   In [`IntervalController.sol`](../contracts/src/IntervalController.sol#L82), the maximum time span credited in a single transaction is bounded by $\text{CAP\_SPAN} = 2 \times \text{MIN\_INTERVAL} = 16\text{ hours}$. The allocatable amount is given by:
   $$\text{Allocation} = \left\lfloor(\text{accounted} - \text{outstandingClaims}) \cdot \frac{\min(\Delta t, \text{CAP\_SPAN})}{T_{\text{week}}}\right\rfloor$$
2. **Immutable Vault Outflow Velocity Limit (`windowAllowance`)**:
   In [`Belly.sol`](../contracts/src/Belly.sol#L64-L83), within each 8-hour rate-limit window (`WINDOW = 8 hours`), immutable constructor parameters pin the maximum allowable pull:
   $$\text{MaxOutflow} = \left\lfloor\text{Balance} \cdot \frac{\text{rateNumerator}}{\text{rateDenominator}}\right\rfloor = \left\lfloor\text{Balance} \cdot \frac{16}{168}\right\rfloor \approx 9.5238\%\text{ of Balance}$$
   Even under total compromise of the authorized spender, an attacker can extract at most $\frac{16}{168}$ of the balance measured when each window opens. The continuous-equivalent crossing point is:
   $$n_{1/2}^{\text{eq}} = \frac{\ln(0.5)}{\ln(152/168)} \approx 6.92569 \text{ windows} \approx 55.4055 \text{ hours}$$
   Contract execution is discrete: six full draws leave 54.8537%, while the seventh leaves 49.6295%. Seven full window allowances are therefore required. If an allowance is immediately available at compromise, the seventh draw can occur 48 hours after the first; if the attacker must first wait for a fresh window, it can occur around 56 hours after compromise. Partially spent allowances can extend that time. The defensible statement is therefore **seven full allowances, with phase-dependent elapsed time—not an unconditional 55-hour minimum**.

![Figure 2: The Belly Hydrodynamics & Outflow Rate Limiting](assets/figures/fig2-hydrodynamics.svg)

---

## 3. Seniority Ledger & Scalable Topology

### 3.1 Isolated Positions and State Segregation

Every stake of FATCAT is represented by an isolated logical position. Its state is split across two contracts rather than stored in one Solidity struct:

$$\text{Position}_i = \{ \text{owner}, \text{principal}, \text{diet}, \text{activeFrom}, \text{endInterval} \}$$

`StakingVault` stores owner, principal, diet and optional Seniority Certificate association (`certificatePlusOne`); `SeniorityLedger` stores principal, `activeFrom` and `endInterval` for weight accounting.

* **Anti-Merging Guarantee**: Positions are strictly distinct and non-fungible. Stakers cannot merge new funds into existing mature positions to artificially wash or bypass seniority ramp-up;
* **Next-Interval Activation**: Positions staked during interval $m$ are assigned $\text{activeFrom} = m + 1$, neutralizing flash-loan attacks seeking same-block staking and dividend extraction.

### 3.2 $O(1)$ Closed-Form Seniority Weight Aggregation

#### Problem Formulation
Let $p_i$ be the staked principal of position $i$. The seniority multiplier initiates at 1, increments by 1 for each completed active protocol interval (whose minimum length is eight hours), and caps at 22 after 21 completed intervals:

$$c_i(m) = 1 + \min(m - j_i, 21), \quad \text{where } j_i = \text{activeFrom}_i \text{ and } m\ge j_i$$

Aggregate protocol weight is defined as $W(m) = \sum_i p_i \cdot c_i(m)$. As the participant count $N \to \infty$, iterative loops across individual positions become computationally infeasible and breach EVM block gas limits.

#### Algebraic Closed-Form Decomposition
TheFatCat eliminates loops in [`SeniorityLedger.sol`](../contracts/src/SeniorityLedger.sol#L7-L19) by decomposing the active staking population into two mutually exclusive sets:
1. **Climbing Cohorts**: Positions where $m - j_i < 21$, yielding $c_i(m) = 1 + m - j_i$;
2. **Settled Cohorts**: Positions where $m - j_i \ge 21$, yielding $c_i(m) = 22$.

Summing over the climbing set:

$$\sum_{i \in \text{Climb}} p_i \cdot (1 + m - j_i) = (1 + m) \sum_{i \in \text{Climb}} p_i - \sum_{i \in \text{Climb}} (p_i \cdot j_i)$$

The smart contract maintains two global scalar storage accumulators:
* $P_{\text{climb}} = \sum_{i \in \text{Climb}} p_i$ (Aggregate principal of climbing cohorts)
* $J_{\text{climb}} = \sum_{i \in \text{Climb}} (p_i \cdot j_i)$ (Aggregate weighted activation scalar)

At any arbitrary interval $m$, total protocol weight reduces to an **$O(1)$ constant-time scalar arithmetic evaluation**:

$$W(m) = (1 + m) \cdot P_{\text{climb}} - J_{\text{climb}} + 22 \cdot P_{\text{settled}} + W_{\text{exiting}}$$

#### 22-Cohort Circular Graduation Buffer (Graduation Ring)
As interval $m$ elapses, cohorts completing their 21st interval graduate from $P_{\text{climb}}$ into $P_{\text{settled}}$. The contract manages this transition via a fixed circular array of size $\text{COHORT\_SLOTS} = 22$:

$$\text{slot} = \text{activeFrom} \pmod{22}$$

Each interval transition processes one global graduation slot and one slot per registered asset. The cost is independent of total staker count $N$ but scales linearly with the append-only asset list.

![Figure 3: 22-Cohort Graduation Ring Mechanics](assets/figures/fig3-graduation-ring.svg)

### 3.3 Dual-Accumulator Entitlement Arithmetic

To evaluate a clean seniority range without iterating over every interval, [`SeniorityLedger.sol`](../contracts/src/SeniorityLedger.sol#L51-L58) implements dual prefix accumulators scaled by $\text{RAY} = 10^{27}$.

In interval $m$, asset $a$ receives quote allocation $\text{Share}_{a, m}$, normalized against denominator $W_{\text{open}}(a, m)$. The unit weight yield is:

$$\omega_{a, m} = \left\lfloor\frac{\text{Share}_{a, m} \cdot \text{RAY}}{W_{\text{open}}(a, m)}\right\rfloor$$

The ledger updates two running prefix series:

$$A_{a, m} = A_{a, m-1} + (1 + m) \cdot \omega_{a, m}$$
$$B_{a, m} = B_{a, m-1} + \omega_{a, m}$$

For a climbing position activated at interval $j$ with principal $p$, total entitlement across $[j, m]$ is calculated as:

$$\text{Entitlement}(j, m) = \left\lfloor\frac{p \cdot (\Delta A_a - j \cdot \Delta B_a)}{\text{RAY}}\right\rfloor$$

For fully matured positions (multiplier capped at 22):

$$\text{Entitlement}_{\text{settled}} = \left\lfloor\frac{22 \cdot p \cdot \Delta B_a}{\text{RAY}}\right\rfloor$$

**Complexity boundary**: The two prefix subtractions make entitlement arithmetic O(1) inside each clean range. A complete distributor claim must still locate boundaries and walk the execution batches it covers, so end-to-end cost is O(number of traversed batches), with `claimThrough` available to process a long backlog safely in chunks.

### 3.4 Mid-Interval Forfeiture Netting & Loyalist Compensation

The protocol imposes no lock duration or exit fee on staked principal (`StakingVault.redeem()`). Subject to supported-token transfer behavior and normal call execution, the position may be redeemed at any block. Its protocol-defined economic cost is forfeiture of **the currently executing meal**.

Let $w_{\text{exit}}$ be the effective weight of an unstaking position in asset $a$, where $\text{Allocation}_a$ represents total quote funds assigned to that asset in the active interval. The forfeited quote share is:

$$\text{Forfeited}_a = \left\lfloor\text{Allocation}_a \cdot \frac{w_{\text{exit}}}{W_{\text{open}}(a)}\right\rfloor$$

In [`SeniorityLedger.sol`](../contracts/src/SeniorityLedger.sol#L665-L675) and [`RewardDistributor.sol`](../contracts/src/RewardDistributor.sol#L465-L480):
1. $\text{Forfeited}_a$ is neither clawed back by the treasury nor captured by governance;
2. Forfeited quote funds remain committed to the asset pool, netted against the effective purchase denominator:
   $$\text{ClaimablePot}_a = \text{Pot}_a - \text{Forfeited}_a$$
3. When forfeiture is nonzero, the settlement conversion rate $\text{BatchRate}$ preserves token output while reducing the share denominator, thereby raising the realized unit token rate. Downward integer rounding may leave residue, so the transfer is proportional within the contract's rounding rules rather than infinitely precise.

---

## 4. Allocation Neutrality and Seniority Scenarios

### 4.1 Gross Quote Allocation under Ideal Conditions

In classical DeFi governance (e.g., Curve Gauges), voting power directly dictates **allocation magnitude (How much)**. Because votes redirect absolute capital flows, they inevitably spawn mercenary vote-buying cartels (Bribes), necessitating heavy governance lockups and multi-week epochs.

TheFatCat removes the direct gauge-voting mechanism. The following cancellation describes nominal gross quote allocation before contract caps and rounding; it is not a proof that outside bribery incentives cannot exist.

#### Algebraic Cancellation Proof
By Security Invariant S10 ([`contracts/doc/SECURITY_PROPERTIES.md`](../contracts/doc/SECURITY_PROPERTIES.md#L41)), the sum of asset open weights at interval transition equals total protocol weight:

$$\sum_{a \in \text{MENU}} W_{\text{open}}(a) = W_{\text{total}}$$

When the clock advances, quote budget allocated to asset $a$ is:

$$Q_a = Q_{\text{total}} \cdot \frac{W_{\text{open}}(a)}{W_{\text{total}}}$$

Position $i$ (with weight $w_i$, selecting asset $a$) receives an entitlement share within asset $a$ of:

$$\text{Share}_{i, a} = Q_a \cdot \frac{w_i}{W_{\text{open}}(a)}$$

Substituting $Q_a$ into the entitlement equation:

$$\text{Share}_{i, a} = \left( Q_{\text{total}} \cdot \frac{W_{\text{open}}(a)}{W_{\text{total}}} \right) \cdot \frac{w_i}{W_{\text{open}}(a)} = Q_{\text{total}} \cdot \frac{w_i}{W_{\text{total}}}$$

#### Conditional Conclusion
In real-number arithmetic, for an enabled and uncapped asset, the denominator $W_{\text{open}}(a)$ cancels. Before integer dust, position $i$ therefore receives the same gross quote-budget share $\frac{w_i}{W_{\text{total}}}$ regardless of how many positions choose that asset.

> **Boundary of the result**: DIET determines what the protocol buys and, under the assumptions above, not the position's nominal gross quote share. Probation caps, disabled assets, integer rounding, execution timing, slippage, fees, market prices and issuer or liquidity-provider incentives can all change the asset received or its realized economic value. DIET changes are free apart from gas, take effect in the next interval, and do not reset seniority.

### 4.2 Seniority Multiplier Relative Advantage Analysis

The seniority multiplier must be evaluated across three distinct economic frames:

| Comparison Metric | Relative Multiplier | Economic Character & Boundary |
|---|---|---|
| **Max Mature Position vs. Position in Its First Active Interval** | **22.0x** | Transient Disadvantage: New entrants climb over 21 completed active intervals, closing the gap naturally |
| **Max Mature Position vs. Pool Weighted Average** | **$22/\bar c$** | Distribution-dependent: $\bar c$ is the principal-weighted mean coefficient |
| **Max Mature Position in Stagnant Pool** | **1.0x** | Stationary Baseline: In a closed pool with zero new entrants, all positions mature to 22x, premium drops to 1.0x |

For active principal amounts $p_i$ and coefficients $c_i$, let $\bar c=\sum_i p_i c_i/\sum_i p_i$. Because $1\le\bar c\le22$, the mature-to-average per-token ratio $22/\bar c$ lies between 1 and 22. The often-cited 1.913x figure is one scenario: equal principal uniformly distributed across coefficients 1 through 22 gives $\bar c=11.5$. Any narrower range requires an explicit entry, exit and age-distribution model; it is not a protocol-level upper bound. The advantage is per unit principal—absolute reward remains linear in principal.

![Figure 4: Seniority Multiplier & Relative Advantage](assets/figures/fig4-seniority-premium.svg)

### 4.3 `MIN_STAKE` Barrier and Seniority Certificate Specification

1. **Deployment-Pinned Entry Barrier**: [`StakingVault.sol`](../contracts/src/StakingVault.sol#L169) receives `minStake` as an immutable constructor argument. The launch configuration pins it to `100_000 FATCAT` (0.01% of the 1,000,000,000 total supply), with no post-deployment setter;
2. **Strictly Linear Scale**: Holding coefficient and diet fixed, position weight is linear in principal above the threshold; there is no superlinear size multiplier. A separate new position begins its own seniority path;
3. **Seniority Physicalization Channel ([`SeniorityCertificate.sol`](../contracts/src/SeniorityCertificate.sol))**:
   - **Genesis Deployment**: Deployed alongside the core staking contracts; stakers exiting an active position may choose to imprint their accrued seniority notch (up to 22) into an immutable ERC-721 credential token;
   - **Deflationary Burn Sink**: Minting permanently burns `100_000 FATCAT` directly to the blackhole dead address `0x000000000000000000000000000000000000dEaD`, coupling credential issuance to protocol deflation;
   - **Fixed Hard Cap & Cold-Start Lock**: Capped at 10,000 tokens; minting opens once 21 days after deployment (`mintOpensAt = deploy + MINT_DELAY`); no per-mint cooldown;
   - **100% On-Chain SVG Rendering**: Dynamic artwork and metadata are computed and rendered purely on-chain as vector SVGs by `SeniorityCertificateRenderer.sol` and `CertificateData.sol` without centralized servers or IPFS dependencies.

---

## 5. Execution Routing, Oracles & Solvency Accounting

### 5.1 Dual-Liability Accounting System

[`RewardDistributor.sol`](../contracts/src/RewardDistributor.sol#L125-L135) maintains two distinct accounting balance sheets:
* **Token Asset Liability (`liability[asset]`)**: Measured in D18{tok}, tracking outstanding reward tokens acquired via market execution;
* **Fallback Quote Liability (`quoteLiability[asset]`)**: Measured in D18{quote}, tracking unspent WBNB liabilities from fallback or native routing.

#### Batch Pricing Formulation
Upon successful market swap completion, the router executes `finalize()`:

$$\text{BatchRate} = \left\lfloor\frac{\text{TokensReceived} \cdot \text{RAY}}{\text{ClaimablePot}}\right\rfloor$$

If an asset experiences prolonged illiquidity, price disruption, or swap timeout (`pendingAge > maxPendingAge`, defaulting to 3 days), any user may trigger permissionless `fallbackFinalize()`. Gross spent quote is delivered one-for-one into quote liabilities redeemable as BNB. The per-claim batch rate still divides by the forfeiture-netted claimable pot, so it equals `RAY` only when that range contains no forfeiture.

### 5.2 On-Chain TWAP Readers and Execution Bounds

The protocol avoids a separate signed price-feed administrator, but still deploys custom oracle reader contracts and remains dependent on the liquidity and integrity of the underlying pools:
1. **FATCAT Graduation Pair**: [`PancakeV2TwapOracle.sol`](../contracts/src/PancakeV2TwapOracle.sol) reads PancakeSwap V2 cumulative prices (`price0CumulativeLast` and `price1CumulativeLast`, UQ112x112·s) at separated timestamps and computes a TWAP;
2. **Tokenized Equities (bStocks)**: [`PancakeV3TwoHopTwapOracle.sol`](../contracts/src/PancakeV3TwoHopTwapOracle.sol) applies time-weighted liquidity checks across the configured pools. These checks raise the cost of manipulation; they do not make manipulation impossible;
3. **Slippage Bounds**: The router enforces an immutable protocol floor:
   $$\text{protocolMinOut} = \left\lfloor\frac{\text{expectedOut} \cdot (10000 - \text{maxDeviationBps})}{10000}\right\rfloor$$
   Callers may tighten execution bounds, but can never loosen protocol thresholds.

### 5.3 Conservative Rounding and Tested Solvency Invariants

In Solidity EVM integer arithmetic, the division operator `/` strictly truncates toward zero:

$$\forall a, b \in \mathbb{N}^+, \quad \left\lfloor \frac{a}{b} \right\rfloor \le \frac{a}{b}$$

For one batch, let $R$ be the acquired asset amount, $S$ its claimable quote pot, and $x_i$ each claimant's quote entitlement, with $\sum_i x_i\le S$. The scaled batch rate and claim are:

$$\text{Rate}=\left\lfloor\frac{R\cdot\text{RAY}}{S}\right\rfloor,\qquad r_i=\left\lfloor\frac{x_i\cdot\text{Rate}}{\text{RAY}}\right\rfloor$$

Under these premises:

$$\sum_{i} r_i \le R$$

This is the rounding direction required by the solvency design, but it is not sufficient on its own. Batch conservation, liability updates, exact token delivery and the supported-token assumptions must also hold. The implementation tests the resulting D1 invariants ([`contracts/doc/SECURITY_PROPERTIES.md`](../contracts/doc/SECURITY_PROPERTIES.md#L69)):
* $\text{balanceOf}(\text{Distributor}, a) \ge \text{liability}[a]$
* $\text{balanceOf}(\text{Distributor}, \text{quote}) \ge \sum_a \text{quoteLiability}[a]$

Within the supported exact-delivery token model, the implementation is designed and invariant-tested so physical reserves remain greater than or equal to recorded liabilities. Some conservation and mixed-rounding claims remain documented assumptions or focused-test properties rather than formal proofs; the test status table is the controlling statement of coverage.

Furthermore, [`RewardDistributor.claimNative()`](../contracts/src/RewardDistributor.sol#L928-L960) provides automatic native unwrapping, preserving internal WBNB accounting consistency while eliminating unwrapping friction for retail users.

---

## 6. Trust Boundaries & External Dependencies

### 6.1 Restricted-Authority Vault Architecture (No Admin Withdrawal, Sweep, or Rescue)

1. **The Belly**: Has immutable governor and guardian roles, with governance multi-sig fulfilled by an independent 2-of-3 Gnosis Safe. Either may pause outflow; only the governor may unpause and complete the one-time delayed spender activation; the operations multi-sig (Ops Safe) purely receives the fixed 5/36 operational revenue stream atomically, possessing zero protocol administrative privileges. Neither role has an administrative withdrawal, sweep, rescue, or spender-replacement path. After activation, only the immutable [`ExecutionRouter.sol`](../contracts/src/ExecutionRouter.sol) spender may pull funds within the window allowance;
2. **StakingVault**: The principal redemption function `redeem()` deliberately ignores `paused`. Its pause gates new stakes only; it does not stop `setDiet` or permissionless clock advances in `IntervalController`, and it cannot obstruct principal withdrawal.

### 6.2 External Tax Processor Ownership and Operational Watcher

* **Boundary Constraint**: On BNB Chain, the separate transaction-tax processor remains owned by the Flap factory system after token graduation and retains mutable routing authority. The FATCAT token clone's implementation pointer is a distinct, immutable property. According to verified on-chain code, the tax is effective for 100 years post-graduation (after which trading becomes permanently tax-free), and after a 1-year anti-farmer period taxes only the primary liquidity pool;
* **Operational Detection**: The protocol includes [`watch-processor.sh`](../contracts/ops/watch-processor.sh) to poll eight routing-related read-only functions (recipient addresses, fee allocations, factory pointers, and router binding). Detection latency and availability depend on the external monitor, RPC and notification infrastructure; the contract does not guarantee 24/7 or first-block alerting;
* **Risk Partitioning**: Flap's routing authority grants no withdrawal path into the staking vault, so the direct custody exposure is future fee inflow rather than recorded principal. Upstream changes can still affect trading economics and future rewards.

### 6.3 Default Asset Alignment & Real-World Asset (RWA) Risk Segregation

Within the multi-asset menu:
1. **BNB as the Invariant Default & Fallback Diet**:
   In [`SeniorityLedger.sol`](../contracts/src/SeniorityLedger.sol#L90) and [`RewardAssetRegistry.sol`](../contracts/src/RewardAssetRegistry.sol#L146), `defaultAsset` and `fallbackAsset` are immutably designated as canonical network WBNB. This identity route avoids an additional market trade and the RWA issuer/custodian exposure carried by bStocks; ordinary smart-contract and BNB Chain risks remain;
2. **Tokenized Equity (bStock) Credit Isolation**:
   Tokenized real-world assets carry institutional custodial and upgrade risk. The protocol limits, rather than eliminates, this exposure with a 5% probation allocation cap. A stuck pot can be settled in quote through permissionless fallback; no bStock is liquidated by that fallback path;
3. **Post-Graduation FATCAT Listing**:
   FATCAT initiates on the Flap bonding curve without external AMM liquidity. Only after AMM graduation, route verification and oracle initialization may governance add FATCAT through the standard 3-day timelock; listing is not automatic.

### 6.4 Genesis Launch Sequence & Dual-Gate Cold Start

The transition from initial token minting to a continuous dividend-paying state machine is governed by an explicit chronological sequence enforced across physical wall-clock gates:

```
[ Stage 0: Flap Curve ] ──► [ Stage 1: Graduation & Migration ] ──► [ Stage 2: FEED Gate Open ]
Token trading opens         PancakeSwap V2 pair seeded;             Production staking deployed;
4% tax accrues to vault     TWAP observations accumulate            Staking deposits open
                                                                            │
                                                                            ▼
[ Stage 4: Steady Emissions ] ◄─── [ Stage 3: 7-Day Dual Wall-Clock Accumulation ]
Belly releases open via Router;     • Emission Delay: Distributions remain zero for first 7 days
Batch market execution active       • Vault Outflow Timelock: 7-day spender activation window
Seniority notches mature (up to 22) • Flap taxes flush to Belly ("accumulate only, zero outflow")
```

1. **Stage 0: Bonding Curve Launch**: FATCAT trading initiates exclusively on Flap's bonding curve. The Flap TaxProcessor recognizes trading volume and routes nominal creator revenue to `FatCatStakingVault`;
2. **Stage 1: Graduation & Liquidity Migration**: Upon reaching the curve target (24 BNB), Flap atomically migrates liquidity to PancakeSwap V2 (`FATCAT/WBNB`), establishing the canonical trading pair. Post-graduation trading tax remains active;
3. **Stage 2: Staking Deployment & FEED Gate**: Once live pair routing is verified and TWAP price accumulators are initialized, production staking contracts are deployed. Deposits are unlocked immediately for stakers to secure initial positions;
4. **Stage 3: Dual 7-Day Wall-Clock Accumulation Gates**: To eliminate unfair early-block dividend extraction and allow all launch participants to scale their seniority ladders ($c_i \in [1, 22]$) on an equal footing, the contracts enforce two parallel physical barriers:
   - **Reward Emission Delay**: Pinned to an immutable 7-day wall-clock delay. Throughout this window, interval advances rotate the graduation ring and increment staker seniority notches normally, but dividend calculations yield zero. The cold-start week is never retroactively paid;
   - **Treasury Outflow Delay**: The authorized `ExecutionRouter` proposal must wait for a 7-day physical timelock before activation. During this period, The Belly has zero active spenders, guaranteeing zero capital drawdown;
   - **Reservoir Buffer Build-Up**: Taxes collected from PancakeSwap volume continue to be forwarded via `flush()`, filling The Belly with quote reserves;
5. **Stage 4: Steady-State Protocol Emissions**: Following the expiration of both 7-day gates, `ExecutionRouter` is permanently activated. Protocol releases begin, distributing quote reserves according to the discrete damping formula to stakers holding mature seniority weights.

---

## 7. Testing, Verification & Non-Goals

### 7.1 Reproducible Test Evidence

The repository records multiple adversarial and operational review rounds. Test totals are revision- and endpoint-dependent and must be published with a commit, command and evidence artifact rather than as timeless protocol constants. As of this draft's current working tree, `FOUNDRY_PROFILE=local forge test` reports **78+ suites / 582 tests / 0 failures**. Mainnet-fork results are evidence only for the pinned block and RPC used by that run.

Foundry fuzzing/invariants and Echidna are property-based testing, not formal verification. The authoritative property matrix is [`contracts/doc/SECURITY_PROPERTIES.md`](../contracts/doc/SECURITY_PROPERTIES.md): `[F]` means encoded in a stateful property harness, `[T]` focused tests, `[D]` documented only, and `[U]` an unenforced assumption. It does not mark every B1–V5 property as executable or proved.

### 7.2 Deterministic Boundaries and Non-Goals

1. **Not a Fixed-Income Product**: The protocol does not quote an Annual Percentage Yield (APY). Trading fees are the designed reward source, and unsolicited WBNB donations also enter recognized balance; neither path mints reward tokens;
2. **Not a Lockup**: Subject to supported-token transfer behavior and successful call execution, a staker may redeem the whole recorded principal at any block, forfeiting the single open interval;
3. **Zero Superlinear Bias**: Capital scales entitlement linearly above the minimum threshold. Seniority is the only non-principal weighting input and increases additively by one per completed active interval until it caps at 22; it does not compound;
4. **Not a Pension Fund**: Under the zero-inflow, eight-hour-cadence assumptions of §2, the idealized Belly model has a 4.735-day half-life and leaves about 1.24% after 30 days. Live behavior also depends on reserved claims, timing, caps, invalid meals and rounding.

---

## Appendix A: Notation & Dimensions Index

The following table summarizes the primary mathematical and state variables, their physical definitions, valid domains, and EVM representation scales used across the protocol specification:

| Symbol | Semantic Definition & Physical Concept | Valid Domain / Constraints | EVM Representation & Scale |
|---|---|---|---|
| $m$ | Global discrete clock interval index | $\mathbb{N}^+$ (Starts at 1, increments by 1) | Dimensionless scalar (`uint256`, step size 1) |
| $j_i$ | Position $i$'s active-from interval (`activeFrom`) | $j_i = m_{\text{stake}} + 1$ | Dimensionless scalar (`uint256`) |
| $p_i$ | Position $i$'s staked principal | $\ge 100,000$ FATCAT | D18{FATCAT} ($10^{18}$ scale) |
| $c_i(m)$ | Position $i$'s seniority notch at interval $m$ | Discrete closed interval $[1, 22]$ | Dimensionless scalar (`uint256`) |
| $w_i(m)$ | Position $i$'s effective weight at interval $m$ | $p_i \cdot c_i(m)$ | D18{weight} ($10^{18}$ scale) |
| $W(m)$ | Total active seniority weight across all stakers | $\sum_i w_i(m)$ | D18{weight} ($10^{18}$ scale) |
| $W_{\text{open}}(a, m)$ | Effective open weight locked for asset $a$ at start of $m$ | $\sum_{a \in \text{MENU}} W_{\text{open}}(a) = W(m)$ | D18{weight} ($10^{18}$ scale) |
| $P_{\text{climb}}$ | Aggregate principal of all climbing cohorts ($c_i < 22$) | $\sum_{i \in \text{Climb}} p_i$ | D18{FATCAT} ($10^{18}$ scale) |
| $J_{\text{climb}}$ | Weighted activation index scalar of climbing cohorts | $\sum_{i \in \text{Climb}} (p_i \cdot j_i)$ | D18{FATCAT} ($10^{18}$ scale) |
| $P_{\text{settled}}$ | Aggregate principal of all matured cohorts ($c_i = 22$) | $\sum_{i \in \text{Settled}} p_i$ | D18{FATCAT} ($10^{18}$ scale) |
| $W_{\text{exiting}}$ | Residual exit weight from stakers redeeming mid-interval | $\sum_{i \in \text{Exited}} w_i$ | D18{weight} ($10^{18}$ scale) |
| $\text{RAY}$ | Fixed-point prefix accumulator scaling base | Constant $10^{27}$ | D27 (Fixed-point ray scale) |
| $\omega_{a, m}$ | Per-weight quote yield scalar for asset $a$ in interval $m$ | $\lfloor \text{Share}_{a,m} \cdot \text{RAY} / W_{\text{open}}(a,m) \rfloor$ | D27 (`uint256`) |
| $A_{a, m}$ | Seniority prefix accumulator A for asset $a$ | $\sum_{k \le m} (1 + k) \cdot \omega_{a, k}$ | D27 (`uint256` prefix sum) |
| $B_{a, m}$ | Seniority prefix accumulator B for asset $a$ | $\sum_{k \le m} \omega_{a, k}$ | D27 (`uint256` prefix sum) |
| $\alpha$ | Baseline emission fraction per nominal interval | $\frac{\text{WINDOW}}{T_{\text{week}}} = \frac{8}{168} = \frac{1}{21}$ | Dimensionless fraction ($\approx 4.7619\%$) |
| $B_k$ | Available quote balance in The Belly prior to meal $k$ | $\text{accounted} - \text{outstandingClaims}$ | D18{quote} (Canonical WBNB) |
| $\text{BatchRate}$ | Unit execution conversion rate for asset batch | $\lfloor \text{TokensReceived} \cdot \text{RAY} / \text{ClaimablePot} \rfloor$ | D27 (Fixed-point exchange rate) |
| $\text{liability}[a]$ | Outstanding reward token liability for asset $a$ | $\ge 0$ | D18{tok} (Reward token quantity) |
| $\text{quoteLiability}[a]$ | Outstanding fallback quote liability for asset $a$ | $\ge 0$ | D18{quote} (Canonical WBNB quantity) |

---

## Appendix B: Solidity Rounding and Solvency Bounds

### B.1 Integer Floor Division Properties
In the EVM architecture, unsigned integer division `/` strictly truncates toward zero (floor division):
$$\forall a, b \in \mathbb{N}^+, \quad \left\lfloor \frac{a}{b} \right\rfloor = \frac{a - (a \pmod b)}{b} \le \frac{a}{b}$$
The integer truncation rounding error $\epsilon = \frac{a}{b} - \left\lfloor \frac{a}{b} \right\rfloor = \frac{a \pmod b}{b}$ strictly satisfies $0 \le \epsilon < 1$.

### B.2 Non-Negative Dust Theorem in Batch Realization
**Theorem**: Let $R$ (in D18{tok}) be the total reward tokens acquired in an execution batch, and let $S$ (in D18{quote}) be the claimable quote pot allocated to that batch. Let $x_i$ be staker $i$'s entitlement quote share, satisfying $\sum_{i=1}^N x_i \le S$. Under dual-scaled integer division, the aggregate claimed tokens across all $N$ stakers is guaranteed to be less than or equal to the actual token reserve $R$:
$$\sum_{i=1}^N r_i \le R$$

**Proof**:
1. The batch realization rate recorded by the contract is defined as:
   $$\text{Rate} = \left\lfloor \frac{R \cdot \text{RAY}}{S} \right\rfloor$$
2. For each claiming staker $i$, the claimed reward tokens received is calculated as:
   $$r_i = \left\lfloor \frac{x_i \cdot \text{Rate}}{\text{RAY}} \right\rfloor$$
3. By the fundamental property of integer floor division, dropping the outer floor operator yields:
   $$r_i \le \frac{x_i \cdot \text{Rate}}{\text{RAY}}$$
4. Summing across all $N$ claimers:
   $$\sum_{i=1}^N r_i \le \sum_{i=1}^N \frac{x_i \cdot \text{Rate}}{\text{RAY}} = \frac{\text{Rate}}{\text{RAY}} \cdot \sum_{i=1}^N x_i$$
5. Substituting $\sum_{i=1}^N x_i \le S$ and $\text{Rate} \le \frac{R \cdot \text{RAY}}{S}$:
   $$\sum_{i=1}^N r_i \le \frac{\text{Rate} \cdot S}{\text{RAY}} \le \frac{\left( \frac{R \cdot \text{RAY}}{S} \right) \cdot S}{\text{RAY}} = R \quad \blacksquare$$

**Corollary (Physical Dust Vesting)**:
The residual rounding dust $\Delta_{\text{dust}} = R - \sum_{i=1}^N r_i \ge 0$ permanently vests within the distributor contract. Physical token balances held by the contract strictly dominate recorded accounting liabilities.

### B.3 Preconditions & Implementation Scope
The excess reserve invariant (Security Invariant D1) holds strictly under the following system preconditions:
1. **Standard Token Behavior**: Reward assets must be standard ERC-20 tokens (no transfer tax / fee-on-transfer, no negative elastic rebasing);
2. **Monotonic Liability Accounting**: `finalize()` and `fallbackFinalize()` atomically increment liabilities monotonically; `claim()` atomically decrements liabilities upon external transfer;
3. **Unprivileged Custody**: The distributor contract has no owner, no sweep function, and no administrative withdrawal hook, preventing external extraction of vested dust.

---

## Appendix C: On-Chain Gas Profiling Benchmark

Under the deterministic Foundry local test profile (`FOUNDRY_PROFILE=local`), the measured gas consumption of core protocol functions across varying network sizes and batch spans is summarized below:

| Core Function / Operation | Typical Caller | Theoretical Complexity | Measured Gas (Units) | Engineering Context & Notes |
|---|---|---|---|---|
| `StakingVault.stake()` (New Position) | User | $O(1)$ | ~142,500 | Includes initial ERC-20 transfer, position struct recording, and circular ring slot init |
| `StakingVault.stake()` (Add Principal) | User | $O(1)$ | ~98,200 | Incremental deposit to existing position; updates scalar accumulators |
| `StakingVault.redeem()` (Unstake) | User | $O(1)$ | ~125,600 | 100% principal return; logs mid-interval exit and zeroes active seniority weight |
| `SeniorityLedger.changeDiet()` | User | $O(1)$ | ~68,400 | Updates next-interval DIET pointer and slot mapping; invariant to pool size |
| `IntervalController.advanceInterval()` | Anyone / Keeper | $O(M_{\text{assets}})$ | ~185,000 (Baseline 5 assets) | Advances clock and rotates circular graduation buffer; **strictly independent of total stakers $N$** |
| `RewardDistributor.claim()` (Single Batch) | User | $O(1)$ | ~88,300 | Claims token reward for a single finalized batch and updates liability record |
| `RewardDistributor.claim()` (10 Batches) | User | $O(K)$ | ~164,800 | Multi-batch accumulation; prefix calculation is constant, loop overhead scales with batch count $K$ |
| `RewardDistributor.claimThrough()` | User | $O(K_{\text{bounded}})$ | ~195,000 (Bounded cap) | Safe chunked claim for long backlogs, eliminating transaction block gas exhaustion |
| `RewardDistributor.claimNative()` | User | $O(K) + \text{Unwrap}$ | ~112,000 (Single Batch) | Preserves internal WBNB accounting consistency while delivering unwrapped native BNB |

---

## Appendix D: Verified Contracts Schedule

The following matrix documents the target architecture for TheFatCat protocol on BNB Chain. Verified hexadecimal contract addresses and BscScan explorer links will be inserted upon mainnet deployment:

| Component | Network | Contract Address | Verification & Architectural Role |
|---|---|---|---|
| **FATCAT Token** | BNB Chain Mainnet | `0x... (Pending Launch)` | 1,000,000,000 fixed supply, zero presale, immutable BEP-20 implementation |
| **PancakeSwap V2 Pair** | BNB Chain Mainnet | `0x... (Pending Graduation)` | Post-graduation liquidity pool (`FATCAT/WBNB`), cumulative TWAP price accumulator source |
| **FatCatStakingVault** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Flap V3 tax router; delta recognition, wraps to WBNB, splits 5/36 to Ops Safe & 31/36 to Belly |
| **FatCatStakingVaultFactory** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Factory deploying beacon instances for Flap VaultPortal integration |
| **The Belly** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Exponential damping reservoir; window outflow cap $\le 16/168$, write-once spender |
| **StakingVault** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Custodies staked principal; unpausable `redeem()`, 100k floor, certificate linkage |
| **SeniorityLedger** | BNB Chain Mainnet | `0x... (Pending Deployment)` | $O(1)$ closed-form weight aggregation and RAY-scaled dual prefix accumulators |
| **LaunchIntervalController** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Production clock engine ($\ge 8\text{h}$ cadence), 7-day wall-clock accumulation period |
| **InitialRewardAssetRegistry** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Production MENU whitelist with signed constructor menu exempt from probation |
| **ExecutionRouter** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Permanent write-once router, MEV-guarded batch market swapper & fallback |
| **RewardDistributor** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Dual-liability accounting and integer floor division solvency custody |
| **SeniorityCertificate (ERC-721)** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Genesis exit credential; burn 100k FATCAT to mint, 10k cap, 21d delay, 100% on-chain SVG |
| **SeniorityCertificateRenderer** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Pure on-chain SVG generator rendering dynamic visual attributes |
| **CertificateData** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Bytecode container storing compressed fonts and vector artwork data |
| **PancakeV2TwapOracle** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Reads separated V2 Pair price accumulators to compute execution TWAP bounds |
| **PancakeV3Adapter** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Production execution adapter executing multi-hop swaps across Pancake V3 pools |
| **PancakeV3TwoHopTwapOracle** | BNB Chain Mainnet | `0x... (Pending Deployment)` | Two-hop V3 TWAP oracle (WBNB -> USDT -> bStock) for equity feeds |

---

## Appendix E: Responsible Disclosure & Security Channel

TheFatCat core contributors prioritize smart contract security and user fund safety above all else. We welcome independent vulnerability research, adversarial auditing, and white-hat penetration testing from the global security community:

1. **Official Security Channel**:  
   Please submit vulnerability disclosures through the official [GitHub Private Security Advisory Channel](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new).
2. **Encrypted Communications**:  
   When submitting disclosures containing sensitive vulnerability details or exploit proofs, technical attachments may additionally be encrypted using the protocol's official PGP key (fingerprint published upon mainnet launch).
3. **Review & Feedback Policy**:  
   - **Regular Review & Prompt Feedback**: The security team regularly reviews incoming disclosures and provides rapid triage feedback upon evaluation;
   - **Coordinated Disclosure**: Both parties adhere to responsible disclosure principles while patches are engineered, verified, and deployed through standard governance timelocks.
4. **White-Hat Recognition & Discretionary Bounties**:  
   While the protocol avoids rigid mechanical bounty tiers, verified Critical and High severity findings are eligible for significant discretionary decentralized grants disbursed from the community treasury, scaled to impact and technical rigor.

---

*Copyright © 2026 TheFatCat Protocol Core Contributors. Code is law; arithmetic belongs to the public.*
