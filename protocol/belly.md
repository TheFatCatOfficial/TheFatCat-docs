---
layout: default
title: The Belly Hydrodynamics
parent: Core Mechanics
nav_order: 1
---

# The Belly Hydrodynamics & Damping System

A detailed examination of The Belly's first-order exponential damping system, discrete interval release physics, and multi-window outflow security throttles.

---

## 1. The Damping Trajectory

Unlike pass-through fee contracts, The Belly is modeled after a physical reservoir with viscous damping. The diagram below illustrates the exponential decay curve under zero inflow alongside the 7-window discrete outflow defense:

![The Belly Hydrodynamics & Trajectory Defense]({{ '/assets/images/fig2-hydrodynamics.svg' | relative_url }})

---

## 2. Mathematical Release Formula

Upon each valid meal closing, `LaunchIntervalController` advances the discrete accounting clock and evaluates the interval's attributable reward allocation:

$$\text{Allocation}_k = (\text{accounted} - \text{outstandingClaims}) \times \frac{\min(\Delta t, 16\text{h})}{T_{\text{week}}}$$

{: .note }
**Clock Advance vs. Capital Draw**: `LaunchIntervalController` calculates and attributes this emission during `advance()`. Physical capital is not moved during clock advances; rather, the authorized Spender ([`ExecutionRouter`]({% link contracts.md %})) calls `release()` on `Belly.sol` strictly when executing swaps for staker reward batches.

Where:
- $\text{accounted}$: Total quote asset recognized by The Belly.
- $\text{outstandingClaims}$: Cumulative quote pot reserved for pending and unfinalized batches.
- $\Delta t$: Elapsed time since the last meal advance ($\Delta t \ge 8\text{ hours}$).
- $\min(\Delta t, 16\text{h})$: Credited duration, strictly capped at **16 hours** to prevent long-dormancy fee surges.
- $T_{\text{week}} = 168\text{ hours}$ (the normalization denominator).

### Standard 8-Hour Emission
For an ordinary on-time meal ($\Delta t = 8\text{h}$):

$$\alpha = \frac{8}{168} = \frac{1}{21} \approx 4.7619\%$$

The Belly emits exactly $1/21$ of its net unreserved quote balance per 8-hour meal.

---

## 3. Ideal Half-Life Derivation

Assuming continuous time with zero new fee inflow, the reservoir balance $B(t)$ follows the differential equation:

$$\frac{dB(t)}{dt} = -\lambda B(t), \quad \lambda = \frac{1}{168\text{ hours}}$$

Integrating over time $t$:

$$B(t) = B(0) \cdot e^{-\lambda t}$$

The continuous half-life $t_{1/2}$ is:

$$t_{1/2} = \frac{\ln(2)}{\lambda} = 168 \cdot \ln(2) \approx 116.44\text{ hours} \approx 4.85\text{ days}$$

Under discrete 8-hour steps ($B_{k+1} = B_k \cdot (1 - 1/21) = B_k \cdot \frac{20}{21}$):

$$\left(\frac{20}{21}\right)^k = 0.5 \implies k = \frac{\ln(0.5)}{\ln(20/21)} \approx 14.206\text{ intervals}$$

Converting intervals back to days:

$$\text{Discrete Half-Life} = 14.206 \times 8\text{ hours} \approx 113.65\text{ hours} \approx 4.735\text{ days}$$

After 30 days of zero trading volume, remaining balance is:

$$B(30\text{d}) \approx B(0) \cdot \left(\frac{20}{21}\right)^{90} \approx 1.24\%$$

---

## 4. The 7-Window Outflow Defense (Anti-Drain Throttle)

Even if the authorized `ExecutionRouter` were compromised by an unexpected vulnerability, The Belly's hardcoded outflow allowance throttles any potential draining:

- **Window Cap**: In any single 8-hour window, cumulative outflows cannot exceed:
  
  $$\text{Window Allowance} = \text{Balance} \times \frac{16}{168} \approx 9.5238\%$$

- **Seven Discrete Windows**:
  - After 6 maximum draws: $(1 - 16/168)^6 \approx 54.8537\%$ remains.
  - After 7 maximum draws: $(1 - 16/168)^7 \approx 49.6295\%$ remains.
- **Critical Reaction Time**: Drawing down 50% of the reservoir requires at least **7 full window intervals**, guaranteeing a minimum security reaction window of **48 to 56 hours** for protocol governance or the designated Guardian to trigger an emergency pause if anomalous conditions arise.

---

## 5. Genesis Cold Start & The 7-Day Dual Wall-Clock Gates

At genesis, The Belly operates under a strict physical accumulation regime that guarantees fair launch and deep initial liquidity reserves:

- **Write-Once Spender Permanence**: The authorized spender address ([`ExecutionRouter`]({% link contracts.md %})) can be set exactly once in contract history. Once activated, it is permanent and cannot be replaced or upgraded (reverting with `SpenderAlreadySet`).
- **7-Day Spender Timelock (`activationDelay = 604,800s`)**: After deployment, governance calls `proposeSpender(router)`. An immutable 7-day wall-clock delay must elapse before `activateSpender()` can be executed. During this first week, The Belly has no live spender—preventing any capital outflows.
- **Synchronized Clock Gate (`LaunchIntervalController`)**: In tandem, the protocol clock enforces `rewardStartAt = block.timestamp + 7 days`, zeroing reward calculations for the cold-start week while stakers climb seniority notches.
- **Deep Reservoir Accumulation**: Throughout this 7-day window, 4% trading taxes generated on PancakeSwap flush continuously into The Belly via `flush()`, accumulating substantial backing before steady-state emissions commence.
