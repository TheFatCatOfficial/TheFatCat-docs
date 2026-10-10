---
layout: default
title: Symbols & Calculation Basis
parent: Definitions & Notation
nav_order: 1
---

# Symbols and Calculation Basis

This table explains the symbols used to understand principal, seniority and reward shares. Amounts represent token quantities; actual receipts depend on completed settlement.

| Symbol | Meaning | How to Read It |
|:---|:---|:---|
| $m$ | **Meal Number** | Each successful advance starts the next meal, at least eight hours after the previous advance. |
| $\Delta t$ | **Meal Interval** | Time since the previous successful advance; one allocation counts at most 16 hours. |
| $p_i$ | **Position Principal** | FATCAT staked in position $i$. Ordinary positions require at least 100,000 FATCAT in whole tokens. |
| $c_i$ | **Seniority Multiplier** | Zero before an ordinary new position activates, then 1, rising each active meal to a maximum of 22. |
| $w_i$ | **Position Weight** | Principal multiplied by seniority, used to determine the reward share. |
| $W$ | **Total Eligible Weight** | All eligible position weights for the meal; new staking can change your relative share. |
| $B$ | **Belly Reserves** | Recognized WBNB funds, including allocations not yet paid out for settlement. |
| $L$ | **Reserved Funds** | Allocated funds still in Belly awaiting purchases or settlement; they cannot be allocated again. |
| $U$ | **Unreserved Balance** | Belly reserves minus reserved funds, available for a new meal's allocation and never counted below zero. |
| $a$ | **Diet Asset** | A position's selected reward asset from the enabled menu. |
| $Q_a$ | **Diet Budget** | The meal's WBNB-denominated budget for diet $a$, rather than its final received token quantity. |

See [Meals & Seniority]({% link protocol/meals-and-seniority.md %}) and [Belly Reserves and Release]({% link protocol/belly.md %}).
