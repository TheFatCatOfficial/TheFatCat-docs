---
layout: default
title: Whitepaper & Specs
nav_order: 9
---

# TheFatCat Protocol Whitepaper (v1.0)

**Decentralized Trading-Tax Routing Protocol with Adaptive Damping and Seniority Weighting**  
*Official Release v1.0 — September 2026*

---

## Downloads & Specifications

The official technical specification is available in multiple formats for institutional researchers, quants, and smart contract auditors:

- **Academic Double-Column PDF (Publication Ready, Typst 0.15)**:
  - [Download English PDF (v1.0)](https://thefatcat.fun/whitepaper/TheFatCat_Whitepaper_v1.0_EN.pdf)
  - [Download Chinese PDF (v1.0)](https://thefatcat.fun/whitepaper/TheFatCat_Whitepaper_v1.0_ZH.pdf)
- **Institutional Distribution DOCX (OpenXML)**:
  - [Download English DOCX (v1.0)](https://thefatcat.fun/whitepaper/TheFatCat_Whitepaper_v1.0_EN.docx)
  - [Download Chinese DOCX (v1.0)](https://thefatcat.fun/whitepaper/TheFatCat_Whitepaper_v1.0_ZH.docx)
- **Repository Markdown Source**:
  - [English Specification (WHITEPAPER.md)](https://github.com/TheFatCatOfficial/TheFatCat/blob/main/plan/WHITEPAPER.md)
  - [Chinese Specification (WHITEPAPER.zh.md)](https://github.com/TheFatCatOfficial/TheFatCat/blob/main/plan/WHITEPAPER.zh.md)

---

## Architectural Abstract

1. **The Belly Hydrodynamic Reservoir**: Operates on a discrete permissionless clock cadence ($\Delta t \ge 8\text{h}$). Releases $\alpha = 8/168 = 1/21 \approx 4.7619\%$ of unreserved quote balance per interval, featuring an ideal zero-inflow model half-life of 4.735 days. Outflow rate is strictly bounded by a window allowance of $16/168 \approx 9.5238\%$, requiring 7 discrete window allowances (48–56 hours) to draw down 50%.
2. **$O(1)$ Closed-Form Seniority Ledger**: Linear algebra decomposition partitions stakers into Climbing ($m - j_i < 21$) and Settled ($m - j_i \ge 21$) cohorts, evaluating total active weight in $O(1)$ scalar arithmetic:
   
   $$W(m) = (1 + m) P_{\text{climb}} - J_{\text{climb}} + 22 P_{\text{settled}} + W_{\text{exiting}}$$
   
   Graduation is managed via a 22-slot circular ring buffer. Dual-prefix accumulators ($A_{a, m}, B_{a, m}$) scaled by $\text{RAY} = 10^{27}$ compute quote entitlements in $O(1)$ constant gas.
3. **Sovereign Multi-Asset Diets**: Each position designates its preferred reward asset. Under ideal conditions, nominal quote budgets cancel out algebraically:
   
   $$\text{Share}_{i, a} = Q_{\text{total}} \cdot \frac{w_i}{W_{\text{total}}}$$

4. **Seniority Certificates (ERC-721)**: Stakers exiting an active position may burn 100,000 FATCAT to `0x...dEaD` via `redeemAndIssue` to mint an on-chain SVG credential, permanently imprinting their notch (1–22). Subsequent stakes can inherit this starting notch, subject to an immutable anti-chaining rule.
5. **Tested Solvency Invariants**: Conservative integer floor division guarantees super-solvency:
   
   $$\sum_{i=1}^N r_i \le R, \quad \Delta_{\text{dust}} = R - \sum_{i=1}^N r_i \ge 0$$
   
   Dual liabilities (`liability[asset]` and `quoteLiability[asset]`) remain fully covered by physical contract balances.
