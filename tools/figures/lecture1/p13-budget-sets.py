"""p13-budget-sets: what "only budget sets" means, and a WARP violation on budget data.

(a) One budget set {x >= 0 : p1 x1 + p2 x2 <= w} with p = (2, 1), w = 10.
(b) Two observations: at prices (2, 1) the consumer buys x = (4, 2); at prices (1, 2)
    she buys y = (2, 4). Each bundle is affordable in the other situation, so
    x is revealed preferred to y and y to x: the budget version of WARP fails.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

LIM = 11.2
W = 10.0
X_CHOICE = (4.0, 2.0)
Y_CHOICE = (2.0, 4.0)


def budget_triangle(ax, p1, p2, color, fill, alpha=1.0, z=0):
    """Shade {x >= 0 : p1 x1 + p2 x2 <= W} and draw its budget line."""
    a, b = W / p1, W / p2
    ax.fill([0, a, 0], [0, 0, b], color=fill, lw=0, alpha=alpha, zorder=z)
    ax.plot([0, a], [b, 0], color=color, lw=2, zorder=z + 2)
    return a, b


def intercept_labels(ax, a, b, color):
    ax.plot([a], [0], "|", color=color, ms=6, mew=1.2, clip_on=False)
    ax.plot([0], [b], "_", color=color, ms=6, mew=1.2, clip_on=False)
    ax.text(a, -0.45, f"${a:g}$", ha="center", va="top", fontsize=10, color=C["ink2"])
    ax.text(-0.35, b, f"${b:g}$", ha="right", va="center", fontsize=10, color=C["ink2"])


fig, axes = plt.subplots(1, 2, figsize=(8.6, 3.9))
fig.subplots_adjust(wspace=0.36)

# (a) One budget set.
ax = axes[0]
econ_axes(ax, (0, LIM), (0, LIM), xlabel="$x_1$", ylabel="$x_2$")
a, b = budget_triangle(ax, 2, 1, C["navy"], C["fill_blue"])
intercept_labels(ax, a, b, C["navy"])
ax.text(1.35, 2.6, "预算集\n（买得起）", ha="center", va="center", color=C["navy"], fontsize=10.5,
        linespacing=1.4)
ax.annotate("预算线 $2x_1+x_2=10$", xy=(3.4, 3.2), xytext=(5.0, 6.6), ha="left", va="bottom",
            fontsize=10.5, color=C["navy"],
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["navy"], shrinkA=2, shrinkB=2))
ax.text(7.6, 1.2, "买不起", ha="center", va="center", color=C["muted"], fontsize=10.5)
ax.text(0.5, 1.06, "（a）价格 $(2,1)$、收入 $10$ 时的预算集", transform=ax.transAxes,
        ha="center", va="bottom", fontsize=11.5)

# (b) Two budget sets and a WARP violation.
ax = axes[1]
econ_axes(ax, (0, LIM), (0, LIM), xlabel="$x_1$", ylabel="$x_2$")
a1, b1 = budget_triangle(ax, 2, 1, C["navy"], C["fill_blue"], alpha=0.85, z=0)
a2, b2 = budget_triangle(ax, 1, 2, C["red"], C["fill_red"], alpha=0.55, z=1)
intercept_labels(ax, a1, b1, C["navy"])
intercept_labels(ax, a2, b2, C["red"])
ax.text(0.55, 10.25, "价格 $(2,1)$", color=C["navy"], fontsize=10.5, ha="left", va="center")
ax.text(8.2, 1.55, "价格 $(1,2)$", color=C["red"], fontsize=10.5, ha="center")

ax.plot(*X_CHOICE, "o", ms=7, color=C["navy"], mec="white", mew=1.2, zorder=6)
ax.plot(*Y_CHOICE, "o", ms=7, color=C["red"], mec="white", mew=1.2, zorder=6)
ax.annotate("$x$：价格 $(2,1)$ 时买的", X_CHOICE, xytext=(6.0, 4.1), ha="left", va="center",
            fontsize=10, color=C["navy"],
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["navy"], shrinkA=2, shrinkB=5))
ax.annotate("$y$：价格 $(1,2)$ 时买的", Y_CHOICE, xytext=(3.4, 7.0), ha="left", va="center",
            fontsize=10, color=C["red"],
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["red"], shrinkA=2, shrinkB=5))
ax.text(0.5, 1.06, "（b）两次观察：$x$、$y$ 互相都买得起", transform=ax.transAxes,
        ha="center", va="bottom", fontsize=11.5)

save(fig, "p13-budget-sets", lecture="lecture1")
