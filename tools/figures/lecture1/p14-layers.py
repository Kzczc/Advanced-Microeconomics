"""p14-layers: the layer-by-layer scoring in the proof of Proposition 3, for 小张's fruits."""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

FRUITS = [("芒果", 5, 1), ("苹果", 4, 2), ("香蕉", 4, 2), ("橙子", 2, 3), ("梨", 1, 4)]
ROUND_COLORS = {1: C["navy"], 2: C["teal"], 3: C["orange"], 4: C["purple"]}
ROUND_TEXT = {1: "第 1 轮：5 个里最好的", 2: "第 2 轮：剩下 4 个里最好的", 3: "第 3 轮：剩下 2 个里最好的",
              4: "第 4 轮：最后 1 个"}

fig, ax = plt.subplots(figsize=(7.6, 3.4))
ys = list(range(len(FRUITS)))[::-1]
for (name, score, rnd), y in zip(FRUITS, ys):
    color = ROUND_COLORS[rnd]
    ax.barh(y, score, height=0.56, color=color, alpha=0.18, edgecolor=color, lw=1.3)
    ax.text(-0.15, y, name, ha="right", va="center", fontsize=12)
    ax.text(score + 0.12, y, f"{score} 分", ha="left", va="center", fontsize=11, color=color)
seen = set()
for (name, score, rnd), y in zip(FRUITS, ys):
    if rnd in seen:
        continue
    seen.add(rnd)
    group = [yy for (_, _, r), yy in zip(FRUITS, ys) if r == rnd]
    ax.text(6.45, sum(group) / len(group), ROUND_TEXT[rnd], ha="left", va="center", fontsize=10.5,
            color=ROUND_COLORS[rnd])
ax.plot([3, 3], [-0.45, len(FRUITS) - 0.55], color=C["muted"], lw=0.9, ls=(0, (3, 3)))
ax.text(3, len(FRUITS) - 0.45, "没有人得 3 分：第 2 轮一次拿走两个", ha="center", va="bottom", fontsize=9.5,
        color=C["muted"])
ax.set_xlim(-1.4, 10.6)
ax.set_ylim(-0.6, len(FRUITS) + 0.25)
ax.axis("off")

save(fig, "p14-layers", lecture="lecture1")
