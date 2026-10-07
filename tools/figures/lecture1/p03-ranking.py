"""p03-ranking: a rational preference is a ranking with ties; a cycle cannot be ranked.

(a) 小张's fruits stacked by level: 芒果 on top, 苹果 ~ 香蕉 sharing a level, then 橙子, 梨.
(b) 小红's cycle 苹果 > 香蕉 > 橙子 > 苹果: every fruit loses to another, so no fruit
    can be put on top.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()


def item(ax, x, y, text, face=C["fill_blue"], edge=C["navy"], w=1.25, h=0.52):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=face, ec=edge, lw=1.3, zorder=3))
    ax.text(x, y, text, ha="center", va="center", fontsize=11.5, zorder=4)


def arrow(ax, p, q, color, rad=0.0, lw=1.5):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle="-|>", mutation_scale=13, lw=lw, color=color,
                                 connectionstyle=f"arc3,rad={rad}", shrinkA=2, shrinkB=2, zorder=2))


fig, axes = plt.subplots(1, 2, figsize=(8.8, 3.9), gridspec_kw={"width_ratios": [1.05, 1]})
fig.subplots_adjust(wspace=0.18)

# (a) a ranking with a tie
ax = axes[0]
ax.set_xlim(-0.6, 4.2)
ax.set_ylim(0.35, 4.75)
ax.axis("off")
levels = [(4.2, [("芒果", 1.9)]), (3.2, [("苹果", 1.15), ("香蕉", 2.65)]), (2.2, [("橙子", 1.9)]),
          (1.2, [("梨", 1.9)])]
for y, fruits in levels:
    ax.plot([0.25, 3.55], [y - 0.36, y - 0.36], color=C["grid"], lw=1, zorder=1)
    for name, x in fruits:
        item(ax, x, y, name)
ax.text(1.9, 3.2, "$\\sim$", ha="center", va="center", fontsize=15, color=C["navy"])
ax.annotate("", xy=(-0.3, 4.45), xytext=(-0.3, 0.95),
            arrowprops=dict(arrowstyle="-|>", lw=1.1, color=C["ink2"], mutation_scale=11))
ax.text(-0.43, 2.7, "越往上越喜欢", rotation=90, ha="center", va="center", fontsize=10.5,
        color=C["ink2"])
ax.text(1.9, 0.5, "（a）理性：能排成一张榜，并列的放同一层", ha="center", va="center", fontsize=11.5)

# (b) a cycle
ax = axes[1]
ax.set_xlim(-0.2, 4.0)
ax.set_ylim(0.35, 4.75)
ax.axis("off")
red_face, red = C["fill_red"], C["red"]
pos = {"苹果": (1.9, 3.95), "香蕉": (3.15, 1.75), "橙子": (0.65, 1.75)}
for name, (x, y) in pos.items():
    item(ax, x, y, name, face=red_face, edge=red)
arrow(ax, (2.35, 3.62), (3.0, 2.08), red, rad=-0.15)
arrow(ax, (2.5, 1.6), (1.3, 1.6), red, rad=-0.12)
arrow(ax, (0.8, 2.08), (1.45, 3.62), red, rad=-0.15)
ax.text(1.9, 2.62, "谁放最上面？", ha="center", va="center", fontsize=11, color=C["ink2"])
ax.text(1.9, 2.22, "（箭头：从好指向差）", ha="center", va="center", fontsize=9.5, color=C["muted"])
ax.text(1.9, 0.5, "（b）循环：每个都输给另一个，排不成榜", ha="center", va="center", fontsize=11.5)

save(fig, "p03-ranking", lecture="lecture1")
