---
layout: default
title: The Belly 水力阻尼机制
parent: 核心机制深度解析
nav_order: 1
---

# The Belly 水力阻尼系统深度解析

深入剖析 The Belly 的一阶指数阻尼物理模型、离散餐次释放公式与多窗口资金流出安全限额。

---

## 1. 水力阻尼轨迹

与传统“即入即抛”的税收合约截然不同，The Belly 模拟具有粘滞阻尼效应的物理蓄水池。下图详细展示了在零外部流入极端场景下的指数衰减曲线，以及针对资金外流的 7-窗口安全限额阶梯防御：

![The Belly 水力动力学与阻尼衰减轨迹]({{ '/assets/images/fig2-hydrodynamics.svg' | relative_url }})

---

## 2. 释放量代数公式

在每次有效餐次推进时，`IntervalController` 触发 The Belly 按照下列公式精确计算本期释放量：

$$\text{释放量}_k = (\text{accounted} - \text{outstandingClaims}) \times \frac{\min(\Delta t, 16\text{h})}{T_{\text{week}}}$$

其中：
- $\text{accounted}$：The Belly 认定的当前计价资产总储备。
- $\text{outstandingClaims}$：已分配给待结算或未完成批次的保留奖池总额。
- $\Delta t$：自上次推进以来所流逝的物理时间（$\Delta t \ge 8\text{ 小时}$）。
- $\min(\Delta t, 16\text{h})$：有效计入时长，硬性封顶为 **16 小时**，防止极端长时间未推进导致的突发性释放激增。
- $T_{\text{week}} = 168\text{ 小时}$（标准归一化分母，即一周的总小时数）。

### 标准 8 小时释放比例
对于按时推进的常规 8 小时餐次（$\Delta t = 8\text{h}$）：

$$\alpha = \frac{8}{168} = \frac{1}{21} \approx 4.7619\%$$

每个标准餐次，The Belly 精确释放其净未保留计价资产余额的 $1/21$。

---

## 3. 理想半衰期数学推导

假设在无外部交易税流入的连续时间极限下，蓄水池资金余额 $B(t)$ 服从一阶微分方程：

$$\frac{dB(t)}{dt} = -\lambda B(t), \quad \lambda = \frac{1}{168\text{ 小时}}$$

对时间 $t$ 进行积分：

$$B(t) = B(0) \cdot e^{-\lambda t}$$

连续形式下的理论半衰期 $t_{1/2}$ 为：

$$t_{1/2} = \frac{\ln(2)}{\lambda} = 168 \cdot \ln(2) \approx 116.44\text{ 小时} \approx 4.85\text{ 天}$$

在以 8 小时为步长的离散状态下（每餐次 $B_{k+1} = B_k \cdot (1 - 1/21) = B_k \cdot \frac{20}{21}$）：

$$\left(\frac{20}{21}\right)^k = 0.5 \implies k = \frac{\ln(0.5)}{\ln(20/21)} \approx 14.206\text{ 个餐次}$$

换算为实际天数：

$$\text{离散半衰期} = 14.206 \times 8\text{ 小时} \approx 113.65\text{ 小时} \approx 4.735\text{ 天}$$

若外部交易量连续归零整整 30 天，蓄水池仍保留有初始资金的：

$$B(30\text{d}) \approx B(0) \cdot \left(\frac{20}{21}\right)^{90} \approx 1.24\%$$

---

## 4. 7-窗口外流防御机制（反抽干限流阀）

即使获得授权的 `ExecutionRouter` 遭遇极端意外漏洞，The Belly 内置的不可篡改流出限额也能有效锁死单次抽干风险：

- **单窗口限额**：在任意单个 8 小时窗口内，累计流出上限被严格限定为：
  
  $$\text{窗口流出上限} = \text{Balance} \times \frac{16}{168} \approx 9.5238\%$$

- **离散 7 窗口递减**：
  - 经历 6 次顶格提取后：仍保留初始资金的 $(1 - 16/168)^6 \approx 54.8537\%$。
  - 经历 7 次顶格提取后：仍保留初始资金的 $(1 - 16/168)^7 \approx 49.6295\%$。
- **关键反应时间**：即使遭遇恶意连续顶格提取，消耗蓄水池 50% 资金也必须经过至少 **7 个完整窗口周期**，为协议多签治理或指定的 Guardian 紧急防御人提供了至少 **48 至 56 小时的充裕反应窗口**，以便在异常状态下从容触发紧急暂停。
