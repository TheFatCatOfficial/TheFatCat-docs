---
layout: default
title: System Topology
nav_order: 3
has_children: true
---

# System Topology & Capital Architecture

A complete architectural map of TheFatCat's capital flows, smart contract state machines, and lifecycle transitions.

---

## Chapter Overview

Explore the end-to-end capital pipeline and deterministic state engine of TheFatCat:

- **[Dual-Track Asset Flows]({% link topology/asset-flows.md %})**: Secondary DEX tax collection, atomic forwarding vault splits (5/36 operations vs 31/36 The Belly), and physical isolation between principal and reward vaults.
- **[State Machine & Intervals]({% link topology/state-machine.md %})**: The deterministic 8-hour meal cycle, permissionless clock advances, instant weight snapshots, and 22-slot circular buffer rotations.
- **[Procurement & Claims Pipeline]({% link topology/claim-pipeline.md %})**: MEV-resistant batch market swaps, TWAP oracle protections, dual-liability accounting, and native BNB automatic unwrapping.
