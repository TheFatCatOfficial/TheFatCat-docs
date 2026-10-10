---
layout: default
title: Batch Procurement & Execution
parent: Core Mechanics
nav_order: 3
---

# Batch Procurement and Settlement

A completed meal first determines each position's quote entitlement, then reward assets are purchased together. User staking and claiming do not perform separate market swaps, but the reward quantity still depends on that batch's execution price.

## 1. Global Meal Order

Each purchase or fallback settlement handles one asset's complete pending share from one meal. The earliest meal with unsettled shares has priority. Assets within that meal can finish separately; later meals must wait. Meal advancement can continue recording new allocations while settlement waits.

A blocked asset can therefore delay other diets' later meals. FEED's rotating checks do not bypass this order. **Already settled rewards and principal redemption do not wait for the purchase queue.**

### Why can a pending purchase remain unavailable?

Pending work is not a promise that a trade can complete now. Each purchase must satisfy amount limits, oldest-meal order, Belly's current allowance and market conditions. Unspent budgets remain in Belly for later processing. A failed purchase does not itself establish fallback eligibility.

## 2. Routes, TWAP and Output Floors

The initial menu is BNB/WBNB, QQQB, SPCXB, NVDAB, SPYB and GOOGLB. BNB rewards require no purchase of another token; other assets are procured through their configured routes. FATCAT availability depends on whether it has actually been enabled on the menu.

The protocol uses a time-weighted market price (TWAP) to set a minimum output, with an initial **3%** price-deviation boundary for reward purchases. Insufficient price history, low liquidity or expected output below the floor can delay or prevent a purchase. These checks constrain execution; they cannot eliminate MEV, token, issuer or liquidity risks.

## 3. Allocation Probation

Newly enabled non-native assets have a **5% per-meal allocation cap** for seven days, rising to 100% afterward. This is not a permanent exposure cap. Budget above the cap stays in Belly and is not reassigned to other assets in that meal.

Initial menu assets are exempt on first enable; later re-enabling follows the ordinary rules. Users bear the issuer risks of their selected assets. WBNB remains the default and fallback settlement asset.

## 4. WBNB Fallback Settlement

When the selected asset cannot be purchased normally, eligible pending shares can settle in WBNB instead. Conditions include disabled or parked status, waiting beyond the permitted age (initially one day), or a complete meal allocation exceeding the purchase ceiling. Pending residue covered by the recovery rules also retains a processing path.

Parking is a governance emergency measure. It preserves an asset's weights and future allocations while removing the fallback age wait. Automatic maintenance prefers fallback, while ordinary purchases may still complete. Parking persists until lifted; lifting it does not reverse completed WBNB settlements.

Fallback still requires a successful transaction, meal order, a complete allocation, and sufficient allowance while Belly outflows are available. **One day is the initial eligibility threshold, not an automatic payment deadline or a guaranteed maximum wait.**

After fallback settlement, users can claim WBNB or unwrap it as native BNB. Received amounts still depend on the batch's eligible shares and rounding. Fallback does not compensate for price losses on tokens already purchased.

## 5. Menu Lifecycle

Defaults are 16 menu slots and 4 checks per FEED, with limits of 32 and 8. Changes require a three-day governance delay; increasing capacity does not automatically list any asset.

Disabling an asset or removing it from the active menu does not erase historical settled rewards. Disabled assets still occupy capacity until safely cleared. Review the current diet menu separately from a position's historical rewards; an asset disappearing from the menu does not mean its rewards were cancelled.
