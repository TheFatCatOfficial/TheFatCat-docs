---
title: Meals and seniority
parent: Protocol
nav_order: 2
---

# Meals and seniority

## Meals

A meal is the accounting period between two rolls. A roll may happen once at
least eight hours have elapsed, and anyone may submit it after that minimum.
This makes a missing keeper a delay rather than a permanent dependency.

Opening a position, changing its diet or exiting takes effect at a meal
boundary. Weight that arrives during a meal cannot claim the whole meal
retroactively.

## Positions

Each stake is a separate position with its own:

- principal;
- activation meal;
- selected reward asset;
- seniority; and
- claim history.

Positions do not merge. Changing a diet does not erase rewards already earned
in earlier assets.

## Seniority

A position starts at coefficient 1 and gains one coefficient for every
completed meal, up to 22 after roughly one week at the minimum cadence.

```
position weight = principal × coefficient
```

Seniority affects only how the next meal is divided. It is not a lock. A
position may withdraw its principal without an exit penalty, but it forfeits
the open meal and its seniority ends with the position.

## Entry floor

The planned minimum position is 100,000 FATCAT. It is a token threshold, not a
promised currency value. Final deployed constants will be verified against the
published contracts before this page is marked live.
