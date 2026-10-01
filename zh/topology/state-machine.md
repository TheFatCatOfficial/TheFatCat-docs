---
layout: default
title: 离散状态机与餐次推进时钟
parent: 系统拓扑与资金流
nav_order: 2
---

# 离散状态机与餐次推进时钟

TheFatCat 协议通过确定性的离散时间间隔向前推进，每个时间窗口被称为一个**餐次（Meal）**：

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">STATE MACHINE</span>
    <span class="tfc-diagram-title">餐次周期推进与状态机跃迁</span>
  </div>
  <pre class="tfc-diagram-content"><code>餐次周期 m-1               餐次周期 m               餐次周期 m+1
[   活跃餐次   ] ───► [   活跃餐次   ] ───► [   活跃餐次   ]
                      ▲                      ▲
                  advance()              advance()
                (节奏: ≥ 8小时)        (节奏: ≥ 8小时)</code></pre>
</div>

---

## 1. 推进节奏与免许可触发
- 当前餐次运行满 **8 小时** 后（$\Delta t \ge 8\text{h}$），即可满足推进条件。
- **免许可触发**：到期后任何人可调用 `advance()`。公众或官方维护服务仍须成功提交交易，自动化不保证即时或持续可用。
- **参与方式与延迟**：有人正常维护时，普通质押者通常无需亲自维护。每次成功推进只结束一餐，以当前时间开启下一餐；分配最多计入 16 小时。停顿 48 小时后不会一次补出六餐，也不会分配 48 小时预算。详见[协议去中心化维护]({% link zh/guides/community-keeper.md %})。

---

## 2. 边界权重代数瞬时锁定
在餐次 $m$ 推进的边界时刻：
- 各个食谱资产下的全部质押有效权重（$W_{\text{open}}(a, m)$）在代数层面永久锁定。
- 杜绝任何事后篡改或追溯性修改权重的可能。

---

## 3. 22-槽位闭合环形缓冲区旋转
- 22-槽位闭合环形缓冲区向前步进一格。
- 满级仓位在 $O(1)$ 常数时间复杂度下自动完成从爬坡态向沉淀态的毕业过渡，无需遍历任何用户数组。

---

## 4. 动态配额释放
- `advance()` 调用 `Belly.sync()`，按净未保留余额计算配额：`base × min(elapsed, 16 小时) / 168 小时`，标准八小时节奏对应 1/21。
- Controller 只登记 pending/outstanding 配额，资金仍留在 Belly。之后由 Router 采购或回退结算时调用 `Belly.release()`，才实际转出计价资金。
