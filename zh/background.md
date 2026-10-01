---
layout: default
title: 背景与设计哲学
nav_order: 3
has_children: true
---

# 背景与设计哲学

深入解析 TheFatCat 的底层设计原理、传统分红代币的数学缺陷、行业基准协议机制对照、时间加权机制，以及协议明确拒绝承诺的核心非目标。

---

## 章节导览

深入探究 TheFatCat 的核心设计哲学与技术支柱：

- **[范式转变：高FDV低流通困境]({% link zh/background/paradigm-shift.md %})**：传统直通式“即入即抛”分红代币面临的三大致命结构性缺陷（单一资产垄断、高频脉冲直传、短期游资即插即拔稀释）及其量化证明。
- **[参照协议与机制对照]({% link zh/background/prior-art.md %})**：对比 Curve Finance、Pendle V2 与 Synthetix V3 在记账粒度、尾差舍入、速率限制等维度的详尽比对矩阵。
- **[蓄水池模型：将流量转化为阻尼存量]({% link zh/background/reservoir-model.md %})**：The Belly 如何将瞬间波动的交易税转化为具有粘滞阻尼特性的物理水库，实现 $1/21$ 动态平滑释放与多周减震缓冲。
- **[时间加权模型：在席时间重构收益范式]({% link zh/background/time-weighting.md %})**：打破 TVL 纯资本垄断，将“在席质押时间”确立为核心创新变量，构建平滑爬坡（1.0× → 22.0×）、时间防御壁垒与 ERC-721 凭证资产化。
- **[设计原则与非目标]({% link zh/background/principles.md %})**：协议三大底层设计原则（物理阻尼蓄水池、本金主权与收益自选、时间之力作为核心创新变量）与明确界定的四大非目标。
