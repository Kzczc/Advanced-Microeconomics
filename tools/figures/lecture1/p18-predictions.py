"""p18-predictions: each added restriction narrows down what the theory predicts.

Budget set {x1 + x2 <= 10} (both prices 1, income 10).
(a) rationality only: any point of the budget set can be the choice of some rational consumer;
(b) + monotonicity and local non-satiation: the choice lies on the budget line (all money spent);
(c) + strict convexity: at most one best point (drawn with u = x1 * x2, tangent at (5, 5)).
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

LIM = 12.0
W = 10.0
TRIANGLE = np.array([[0, 0], [W, 0], [0, W]])


def base(ax, fill):
    econ_axes(ax, (0, LIM), (0, LIM), xlabel="$x_1$", ylabel="$x_2$")
    ax.fill(TRIANGLE[:, 0], TRIANGLE[:, 1], color=fill, lw=0, zorder=0)


def label_below(ax, text):
    ax.text(0.5, -0.1, text, transform=ax.transAxes, ha="center", va="top", fontsize=10.5,
            color=C["ink2"])


def title_above(ax, text):
    ax.text(0.5, 1.07, text, transform=ax.transAxes, ha="center", va="bottom", fontsize=11.5)


fig, axes = plt.subplots(1, 3, figsize=(9.0, 3.4))
fig.subplots_adjust(wspace=0.3)

# (a) Only rationality: candidate choices scattered over the whole budget set.
ax = axes[0]
base(ax, C["fill_blue"])
ax.plot([0, W], [W, 0], color=C["navy"], lw=2, zorder=2)
candidates = np.array([[1.2, 1.5], [3.0, 4.6], [5.6, 1.4], [2.0, 7.0], [7.2, 2.8], [4.0, 2.6],
                       [1.0, 4.0], [6.0, 4.0], [3.4, 6.6], [8.6, 0.8]])
ax.plot(candidates[:, 0], candidates[:, 1], "o", ms=5, color=C["navy"], zorder=3)
ax.text(6.4, 8.6, "预算集里\n哪一点都可能", ha="center", va="center", fontsize=10.5,
        color=C["navy"], linespacing=1.4)
title_above(ax, "（a）只假设理性")
label_below(ax, "几乎什么都能“解释”")

# (b) Monotone + locally non-satiated: only the budget line survives.
ax = axes[1]
base(ax, C["fill_gray"])
ax.plot([0, W], [W, 0], color=C["teal"], lw=3.2, zorder=2)
on_line = np.array([1.6, 3.4, 5.2, 7.0, 8.6])
ax.plot(on_line, W - on_line, "o", ms=5, color=C["teal"], zorder=3)
inner = np.array([2.6, 4.4])
ax.plot(*inner, marker="x", ms=8, mew=2, color=C["red"], zorder=4)
ax.annotate("钱没花完，\n不会停在这里", inner, xytext=(0, -10), textcoords="offset points",
            ha="center", va="top", fontsize=10, color=C["red"], linespacing=1.35)
ax.text(7.3, 6.0, "只会落在\n预算线上", ha="center", va="center", fontsize=10.5,
        color=C["teal"], linespacing=1.4)
title_above(ax, "（b）再加单调、局部非饱和")
label_below(ax, "预测：钱一定花光")

# (c) + strict convexity: one best point.
ax = axes[2]
base(ax, C["fill_gray"])
ax.plot([0, W], [W, 0], color=C["navy"], lw=2, zorder=2)
xs = np.linspace(25 / LIM, LIM, 400)
ax.plot(xs, 25 / xs, color=C["teal"], lw=2, zorder=3)
ax.plot(5, 5, "o", ms=7, color=C["red"], zorder=5)
ax.annotate("唯一的最优点", (5, 5), xytext=(14, 18), textcoords="offset points", ha="left",
            va="bottom", fontsize=10.5, color=C["red"],
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["red"], shrinkA=1, shrinkB=4))
ax.text(10.4, 25 / 10.4 + 0.5, "无差异曲线", ha="center", va="bottom", fontsize=10,
        color=C["teal"])
title_above(ax, "（c）再加严格凸")
label_below(ax, "预测：最优选择只有一个")

save(fig, "p18-predictions", lecture="lecture1")
