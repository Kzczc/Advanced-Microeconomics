"""p02-canteen: what 小明 can afford with 20 yuan, before and after the beef noodles get dearer."""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

BUDGET = 20
DISHES = ["牛肉面", "炸鸡套餐", "盖浇饭"]
PANELS = [("（a）原价：可行集 $=\\{$牛肉面，盖浇饭$\\}$", [18, 25, 15]),
          ("（b）牛肉面涨到 22 元：可行集 $=\\{$盖浇饭$\\}$", [22, 25, 15])]

fig, axes = plt.subplots(1, 2, figsize=(8.8, 3.5), sharey=True)
fig.subplots_adjust(wspace=0.12)
for ax, (title, prices) in zip(axes, PANELS):
    for i, (dish, price) in enumerate(zip(DISHES, prices)):
        ok = price <= BUDGET
        ax.bar(i, price, width=0.58, color=C["fill_blue"] if ok else C["fill_gray"],
               edgecolor=C["navy"] if ok else C["gray"], lw=1.2)
        ax.text(i, price + 0.6, f"{price} 元", ha="center", va="bottom", fontsize=10.5,
                color=C["ink"] if ok else C["gray"])
        ax.text(i, -1.4, dish, ha="center", va="top", fontsize=11)
        ax.text(i, price / 2, "买得起" if ok else "买不起", ha="center", va="center", fontsize=10,
                color=C["navy"] if ok else C["gray"])
    ax.axhline(BUDGET, color=C["orange"], lw=1.6, ls=(0, (5, 3)))
    ax.text(2.42, BUDGET + 0.5, "带了 20 元", ha="right", va="bottom", fontsize=10.5, color=C["orange"])
    ax.set_xlim(-0.6, 2.5)
    ax.set_ylim(0, 29)
    ax.axis("off")
    ax.text(0.95, -5.0, title, ha="center", va="top", fontsize=11.5)

save(fig, "p02-canteen", lecture="lecture1")
