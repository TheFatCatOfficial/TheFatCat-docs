---
layout: default
title: Help Keep the Protocol Running
parent: User Guides
nav_order: 5
---

# Help Keep the Protocol Running

A short guide to the "help keep things moving" action you may see on the Belly page at [thefatcat.fun/belly](https://thefatcat.fun/belly): what it is, what you are signing, what it costs, and why your funds are never at risk when you use it.

---

## When you will see it

The protocol runs itself through public, permissionless steps that anyone may perform. A scheduled operator normally performs them, but when you open the Belly page and they have not run yet, the page offers to let **you** do it with one click. Two situations trigger the offer:

1. **Fees are waiting in the intake vault.** Trading fees collect in a holding vault before they are forwarded to The Belly. Once the waiting amount passes a small threshold, the page offers to forward it.
2. **Eight hours have passed since the last meal closed.** The protocol counts time in 8-hour meals. When a meal is ready to close and nobody has closed it yet, the page offers to open the next one.

---

## What happens when you click

- Your wallet asks you to sign **one or two transactions** — only the ones that are actually due.
- You pay a small gas fee. That is the entire cost.
- The destination of every unit is fixed in the contract code: forwarded fees split automatically between the operations Safe and The Belly; the meal clock simply moves forward. Nothing can be redirected, and the transaction cannot touch your own balances or positions.

Each step is simulated before you are asked to sign. If someone else already did it a second earlier, the site tells you so instead of showing an error.

---

## What it accomplishes — and what it does not

Clicking helps every staker see fresh numbers sooner: forwarded fees become allocatable, and the next meal opens.

**Buying is not part of this.** Converting The Belly's balance into the reward assets stakers chose runs on the project's settlement infrastructure in the background. There is nothing for you to sign there, and nothing is waiting on your click.

---

## If nobody clicks

Nothing breaks. Fees simply keep waiting safely in the intake vault, and the next meal starts a little later. Staked principal is never affected — it can be redeemed at any second, even with the website completely offline (see the [Emergency Exit guide]({% link guides/emergency-exit.md %})).

For the same reason, there is no way to do this wrong. A step whose time has not come refuses to run, and a step somebody already performed is a harmless no-op. The worst outcome of clicking is a few cents of gas for a transaction that turns out to be unnecessary.
