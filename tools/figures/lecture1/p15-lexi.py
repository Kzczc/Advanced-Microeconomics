"""p15-lexi: under lexicographic preferences, what is better or worse than x = (2, 1.5).

Better: every bundle with more of good 1 (the whole half-plane to the right) and the
bundles directly above x. Worse: the half-plane to the left and the bundles directly
below x. Only x itself is indifferent to x, so there is no indifference curve.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

X1, X2 = 2.0, 1.5
TOP = 3.6
RIGHT = 4.2

fig, ax = plt.subplots(figsize=(5.6, 4.0))
econ_axes(ax, (0, RIGHT), (0, TOP), xlabel="$x_1$（第一种商品）", ylabel="$x_2$")
ax.fill_between([X1, RIGHT - 0.05], 0, TOP - 0.05, color=C["fill_blue"], lw=0, zorder=0)
ax.fill_between([0.0, X1], 0, TOP - 0.05, color=C["fill_red"], lw=0, alpha=0.55, zorder=0)
ax.plot([X1, X1], [X2, TOP - 0.05], color=C["navy"], lw=3, zorder=3, solid_capstyle="butt")
ax.plot([X1, X1], [0, X2], color=C["red"], lw=3, zorder=3, solid_capstyle="butt")
ax.plot(X1, X2, "o", ms=8, color=C["ink"], mec="white", mew=1.2, zorder=5)
ax.annotate("$x=(2,\\,1.5)$", (X1, X2), xytext=(10, -4), textcoords="offset points", ha="left", va="top",
            fontsize=11)
ax.text(3.1, 2.6, "比 $x$ 好\n（第一种更多）", ha="center", va="center", fontsize=11, color=C["navy"],
        linespacing=1.5)
ax.text(1.0, 2.6, "比 $x$ 差\n（第一种更少）", ha="center", va="center", fontsize=11, color=C["red"],
        linespacing=1.5)
ax.annotate("正上方：也比 $x$ 好", (X1, 2.9), xytext=(2.55, 3.25), ha="left", va="center", fontsize=10,
            color=C["navy"], arrowprops=dict(arrowstyle="-", lw=0.8, color=C["navy"], shrinkB=3))
ax.annotate("正下方：比 $x$ 差", (X1, 0.55), xytext=(2.55, 0.42), ha="left", va="center", fontsize=10,
            color=C["red"], arrowprops=dict(arrowstyle="-", lw=0.8, color=C["red"], shrinkB=3))
ax.set_xticks([2])
ax.set_xticklabels(["2"])
ax.tick_params(axis="x", length=0, pad=4)

save(fig, "p15-lexi", lecture="lecture1")
