---
layout: default
title: Mechanism Summary
parent: Whitepaper & Specs
nav_order: 2
---

# Mechanism Summary

This page summarizes reserve allocation, position weight and reward claiming. Model results depend on the stated assumptions; they are not a payment schedule.

## Allocation and execution

An on-time eight-hour meal allocates up to 1/21 of unreserved quote funds. Delayed advancement counts at most 16 hours of eligible allocation time. Allocation records reservations; actual outflow separately observes the Belly's window allowance. See [Belly rules]({% link protocol/belly.md %}).

The approximately 4.736-day half-life describes an ideal model with no new inflow, allocation and settlement every eight hours, no pause or backlog, and rounding ignored. It is not a payment schedule.

## Seniority

Position weight is principal times its seniority coefficient. Ordinary eligible positions climb from 1× to 22×. At the standard eight-hour cadence, climbing from 1× to 22× requires 21 completed active meals, about seven days. Maintenance delays can extend this period. Participation rules are specified in [meal rules]({% link protocol/meals-and-seniority.md %}).

## Assets and claims

Each position receives rewards in its selected diet asset. Quote allocation, funded reward quantity and claimable amount are distinct; swap execution and conditional WBNB fallback determine what can be claimed. Procurement proceeds by [global meal order]({% link protocol/execution.md %}). Finalized claims are not reclaimed because users wait to collect them.

## Accounting boundaries

Downward rounding limits payouts for a funded batch; it does not prove the safety or market value of arbitrary tokens. Funds reserved for pending purchases and rewards already settled for users are recorded separately. See [accounting constraints]({% link definitions/invariants.md %}), [custody]({% link safety/custody.md %}) and [risk boundaries]({% link safety/risks-and-status.md %}).
