"""func-composition: v(u(x)) as a two-machine pipeline.

u gives each fruit a score (芒果 4, 梨 1); v(t) = 2t + 1 rescales the score.
The composite v∘u goes straight from the fruit to the new score: 芒果 -> 9, 梨 -> 3.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(9.0, 3.6))
ax.set_xlim(0, 13)
ax.set_ylim(-0.6, 5.6)
ax.axis("off")

ITEM_X = [1.0, 6.5, 12.0]          # fruit, first score, second score
MACHINE_X = [3.75, 9.25]           # u, v
ROWS = [(2.6, "芒果", 4, 9), (1.0, "梨", 1, 3)]
arrow = dict(arrowstyle="-|>", lw=1.4, color=C["ink2"], mutation_scale=12, shrinkA=0, shrinkB=0)

for mx, name, rule, fc, ec in [(MACHINE_X[0], "$u$", "打分", C["fill_teal"], C["teal"]),
                               (MACHINE_X[1], "$v$", "$v(t)=2t+1$", C["fill_orange"], C["orange"])]:
    ax.add_patch(FancyBboxPatch((mx - 1.05, 0.45), 2.1, 2.75, boxstyle="round,pad=0.02,rounding_size=0.25",
                                fc=fc, ec=ec, lw=1.4, zorder=1))
    ax.text(mx, 3.48, name, ha="center", va="center", fontsize=14, color=ec)
    ax.text(mx, 0.12, rule, ha="center", va="center", fontsize=10.5, color=C["ink2"])

for y, fruit, s1, s2 in ROWS:
    ax.text(ITEM_X[0], y, fruit, ha="center", va="center", fontsize=12.5)
    ax.text(ITEM_X[1], y, f"${s1}$", ha="center", va="center", fontsize=13, color=C["teal"])
    ax.text(ITEM_X[2], y, f"${s2}$", ha="center", va="center", fontsize=13, color=C["orange"])
    ax.annotate("", xy=(ITEM_X[1] - 0.35, y), xytext=(ITEM_X[0] + 0.55, y), arrowprops=arrow, zorder=2)
    ax.annotate("", xy=(ITEM_X[2] - 0.35, y), xytext=(ITEM_X[1] + 0.35, y), arrowprops=arrow, zorder=2)

ax.text(ITEM_X[0], 0.12, "$x$", ha="center", va="center", fontsize=12, color=C["ink2"])
ax.text(ITEM_X[1], 0.12, "$u(x)$", ha="center", va="center", fontsize=12, color=C["ink2"])
ax.text(ITEM_X[2], 0.12, "$v(u(x))$", ha="center", va="center", fontsize=12, color=C["ink2"])

big = FancyArrowPatch((ITEM_X[0], 3.35), (ITEM_X[2], 3.35), connectionstyle="arc3,rad=-0.22",
                      arrowstyle="-|>", mutation_scale=14, lw=1.4, color=C["purple"], ls=(0, (4, 3)))
ax.add_patch(big)
ax.text(6.5, 5.25, "复合函数 $v\\circ u$：一步从水果直接到新分数", ha="center", va="center",
        fontsize=11, color=C["purple"])

save(fig, "func-composition", lecture="basics")
