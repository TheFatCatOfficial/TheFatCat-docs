---
layout: default
title: Prior Art & Comparative Matrix
parent: Background & Philosophy
nav_order: 2
---

# Prior Art & Comparative Matrix

To contextualize the architectural design of TheFatCat within the decentralized finance landscape, this document presents a comparative analysis against benchmark protocols: **Curve Finance** (veCRV / Gauge / crvUSD), **Pendle Finance V2**, and **Synthetix V3**.

All comparisons are verified against pinned open-source repository commits (Curve AMM `574f4402`, Curve DAO `fa127b1c`, Pendle V2 `87685c89`, Synthetix V3 `23585f73`).

---

## Comparative Matrix

| Domain | Mechanism | TheFatCat | Benchmark Implementation | Comparative Finding | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Accounting** | Granularity | 8-hour discrete interval snapshot (`IntervalController.sol:63, 338–347`) | Curve: continuous per-second `rate × dt` (`LiquidityGaugeV5.vy:279–343`)<br>Pendle: per-block lazy index (`RewardManager.sol:27–46`) | Discrete epoch snapshots bound gas overhead and isolate state transitions from block-level flash volatility. | `[Verified]` |
| **Accounting** | User Checkpointing | Prefix subtraction at claim (`SeniorityLedger.sol:846–861`); zero per-transfer hooks | Pendle: transfer hooks update both parties (`PendleGauge.sol:40–42`)<br>Curve: lazy `integrate_checkpoint` | Eliminates $O(N)$ iteration and receiver approval overhead during position lifetime. | `[Verified]` |
| **Rounding** | Residual Dust | Residual dust unclaimable and unassignable (`RewardDistributor.sol:136–142`) | Pendle: `lastBalance` updates by full increment (`RewardManager.sol:48–49, 73`); residue stays absorbed below watermark | Both protocols absorb integer truncation residue into contract balance rather than recycling. | `[Verified]` |
| **Rounding** | Truncation Direction | Claimant-adverse integer floor once (`SeniorityLedger.sol:863–867`) | Curve: pool-adverse (`StableSwap3Pool.vy:465, 477–478`)<br>Pendle: `mulDown` / `divDown` floor | Consistent across all three protocols: rounding always favors protocol solvency over claimant maximization. | `[Verified]` |
| **Weighting** | Time Dynamic | Additive climb $1.0\times \to 22.0\times$ across 21 intervals, then constant (`SeniorityLedger.sol:30–33`) | ve-model decay: Curve $A \cdot (t_{\text{end}} - t)/4\text{y}$ (`VotingEscrow.vy:250–255`)<br>Pendle $\text{bias} - \text{slope} \cdot t$ (`VeBalanceLib.sol:58–61`) | Inverted polarity: rewards duration seniority rather than locking duration decay. | `[Novel / No Precedent]` |
| **Weighting** | Exit Forfeiture | In-flight interval yield forfeited to remaining stakers upon exit (`SeniorityLedger.sol:414–435`) | Curve / Pendle: no mid-interval forfeiture | Forfeited unfinalized yield accrues mathematically to active survivors in subsequent intervals. | `[Novel / No Precedent]` |
| **Release** | Rate Limiting | Exponential smoothing $\min(\Delta t, 16\text{h}) / 168\text{h}$ on net unexecuted inventory (`IntervalController.sol:338–347`) | Synthetix V3: linear stream `scheduled × Δt / duration` (`RewardDistribution.sol:231–254`) | Net-balance rate limiting guarantees bounded inventory outflow regardless of incoming transaction spikes. | `[Verified]` |
| **Governance** | Revenue Fee Split | Constant $3/19$ ($\approx 15.79\%$) to operations Safe without admin setter (`FatCatStakingVault.sol:94–95`) | Curve: mutable `admin_fee` with upper bound (`MAX_ADMIN_FEE`) | Immutable constant eliminates governance skimming risk and parameter migration attack surfaces. | `[Verified]` |
| **Execution** | DEX Settlement Quality | TWAP window + harmonic liquidity floor + slippage bounds + fallback (`ExecutionRouter.sol:466–484`) | Curve / Pendle / SNX: not applicable (no on-chain spot execution) | Autonomous DEX routing introduces spot oracle dependency, mitigated via harmonic liquidity bounds. | `[Novel / No Precedent]` |

---

## Detailed Mechanism Evaluations

### 1. Residual Dust Accounting: TheFatCat vs. Pendle V2

In discrete yield distribution engines, integer division truncation inevitably leaves residual dust units:

$$\text{dust} = R - \sum_{i=1}^{M} r_i \ge 0$$

- **Pendle V2 Mechanism (`RewardManager.sol:48–49, 73`)**: `lastBalance` records the entire token balance increment, which includes the integer division remainder from `divDown`. When claimants withdraw rewards, `lastBalance` and the contract token balance decrease synchronously. As a result, truncation dust remains permanently absorbed below the `lastBalance` high-water mark; it does **not** roll over into subsequent reward cycles.
- **TheFatCat Mechanism (`RewardDistributor.sol:136–142`)**: Truncation dust is mathematically provable to satisfy $\sum r_i \le R$ (the Non-Negative Dust Theorem). Dust units remain in the contract balance as an unclaimable buffer, ensuring that cumulative liabilities never exceed physical custody $\sum \text{liability}_k \le \text{balance}(k)$.
- **Synthesis**: Neither protocol implements automatic dust recycling. Permitting residual dust to flow back into unfinalized inventory without formal non-liability proofs would risk reallocating funds rightfully belonging to uncleared claimants. TheFatCat preserves non-extractable dust stability as a core solvency invariant.

### 2. Parameter Bound Architecture: TheFatCat vs. Pendle V2

- **Pendle V2 Fee Overrides (`PendleMarketFactoryV7Upg.sol:131–140`)**: Pendle's `setOverriddenFee` enforces that any overridden swap fee must be strictly lower than the market's base rate (`getNonOverrideLnFeeRateRoot`). This semantic enforces an *upper bound relative to an external anchor*, not a monotonic ratchet.
- **TheFatCat Parameter Philosophy**: Key parameters governing solvency and accessibility are either **strictly immutable** (`minStake = 100,000`, `minReleaseWeight`) or constrained to **one-way tightening**:
  - `maxDeviationBps` in `PancakeV3TwoHopTwapOracle` can be tightened immediately by Guardian to protect against oracle divergence, but loosening requires standard Governance delay.
  - Adding setters to immutable parameters (such as `minStake`) is rejected as an unnecessary expansion of protocol privilege surface.

### 3. Distribution Flow Topology: TheFatCat vs. Synthetix V3

- **Synthetix V3 (`RewardDistribution.sol:26–75`)**: Employs continuous linear streaming via `scheduledValueD18` (typed as `int128`), allowing the system to support negative reward streams (clawbacks or debt reallocations).
- **TheFatCat**: Operates strictly on a non-negative discrete outflow model:
  
  $$R_k = \min\left(\frac{\Delta t}{T_{\text{window}}}, \frac{16\text{h}}{168\text{h}}\right) \cdot \text{Balance}_{\text{unfinalized}}$$

  There is no mechanism for negative distributions or retroactive stake deductions. Outflow failure handling in TheFatCat verifies delivered token quantities via balance deltas (`balanceOf(after) - balanceOf(before)`) in `RewardDistributor.sol:1075–1102`, preventing phantom payouts without requiring global transaction rollback.

---

## Engineering Precedents Adopted

From contemporary high-assurance protocols, TheFatCat adopts three core engineering practices:

1. **Stateful Invariant Fuzzing (Curve Stablecoin standard)**: Formal verification of system conservation laws (solvency, monotonic seniority progression, and non-decreasing liability bounds) under randomized multi-block transaction sequences.
2. **Deterministic Role Separation (`Belly.sol`, `StakingVault.sol`)**:
   - `pause`: Guardian or Governor may trigger pause to halt outbound flows and new settlements.
   - `unpause`: Restricted exclusively to Governor (`Belly.sol:328–332`) to prevent compromised guardian keys from unilaterally restoring execution.
   - Redemptions: `redeem` in `StakingVault.sol` is structurally independent of the pause state, guaranteeing that principal custody cannot be locked by administrative action.
3. **Explicit Adversarial Regression Suites**: PoC test harnesses mirroring real-world attack vectors (e.g., wrapper re-entrancy, sweep races, and oracle liquidity manipulation) are maintained directly within the contract test directory (`contracts/test/`).
