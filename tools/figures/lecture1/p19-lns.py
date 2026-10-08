"""p19-lns: local non-satiation and two ways it fails.

(a) u = x1 * x2: inside every small disc B_eps(y) there is a bundle x with x ≻ y.
(b) bliss point b: indifference curves are circles around b, nothing near b beats b.
(c) integer quantities only: a small disc around y contains no other option at all.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import Circle  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

LIM = 6.0


def label_below(ax, text):
    ax.text(0.5, -0.1, text, transform=ax.transAxes, ha="center", va="top", fontsize=10.5,
            color=C["ink2"])


def title_above(ax, text):
    ax.text(0.5, 1.07, text, transform=ax.transAxes, ha="center", va="bottom", fontsize=11.5)


def ball(ax, center, radius):
    ax.add_patch(Circle(center, radius, facecolor=C["fill_orange"], edgecolor=C["orange"],
                        lw=1.2, ls=(0, (4, 2)), zorder=1))


fig, axes = plt.subplots(1, 3, figsize=(9.0, 3.5))
fig.subplots_adjust(wspace=0.3)
for ax in axes:
    econ_axes(ax, (0, LIM), (0, LIM), xlabel="$x_1$", ylabel="$x_2$")
    ax.set_aspect("equal")

# (a) Satisfied: u = x1 x2, y on the curve x1 x2 = 6.
ax = axes[0]
y = np.array([2.45, 6 / 2.45])
xs = np.linspace(1.0, LIM, 300)
ball(ax, y, 0.8)
ax.plot(xs, 6 / xs, color=C["navy"], lw=2, zorder=2)
better = y + np.array([0.45, 0.4])
ax.annotate("", better, y, arrowprops=dict(arrowstyle="-|>", lw=1.2, color=C["teal"],
                                            shrinkA=4, shrinkB=4, mutation_scale=10), zorder=4)
ax.plot(*y, "o", ms=6.5, color=C["navy"], mfc="white", mew=1.6, zorder=5)
ax.plot(*better, "o", ms=6, color=C["teal"], zorder=5)
ax.annotate("$y$", y, xytext=(-6, -4), textcoords="offset points", ha="right", va="top")
ax.annotate("$x\\succ y$", better, xytext=(6, 2), textcoords="offset points", ha="left",
            va="bottom", color=C["teal"])
ax.annotate("小圆 $B_\\varepsilon(y)$", (y[0] - 0.57, y[1] - 0.57), xytext=(0.3, 0.85),
            textcoords="data", ha="left", va="bottom", fontsize=10, color=C["orange"],
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["orange"], shrinkA=1, shrinkB=1))
ax.text(5.6, 0.75, "无差异曲线", ha="right", va="bottom", fontsize=10, color=C["navy"])
title_above(ax, "（a）满足：附近总有更好的")
label_below(ax, "小圆再小，里面也有 $x\\succ y$")

# (b) Bliss point: u = -|x - b|^2.
ax = axes[1]
b = np.array([3.0, 2.8])
for r in (1.25, 2.0, 2.65):
    ax.add_patch(Circle(b, r, fill=False, edgecolor=C["navy"], lw=1.4, alpha=0.75, zorder=2))
ball(ax, b, 0.55)
ax.plot(*b, marker="*", ms=13, color=C["red"], zorder=5)
ax.annotate("$b$", b, xytext=(13, 7), textcoords="offset points", ha="left", va="bottom",
            color=C["red"], fontsize=11)
ax.text(3.0, 5.6, "圆圈：离 $b$ 越远越差", ha="center", va="bottom", fontsize=10,
        color=C["navy"])
title_above(ax, "（b）违反：吃到刚刚好")
label_below(ax, "极乐点 $b$ 附近没有比它更好的")

# (c) Integer quantities only.
ax = axes[2]
grid = np.arange(1, 6)
gx, gy = np.meshgrid(grid, grid)
ax.plot(gx.ravel(), gy.ravel(), "o", ms=4.5, color=C["gray"], zorder=3)
y_int = np.array([3.0, 2.0])
ball(ax, y_int, 0.8)
ax.plot(*y_int, "o", ms=7, color=C["navy"], mfc="white", mew=1.8, zorder=5)
ax.annotate("$y$", y_int, xytext=(4, 2), textcoords="offset points", ha="left", va="bottom")
ax.annotate("小圆里只有 $y$ 自己", (y_int[0] + 0.57, y_int[1] - 0.57), xytext=(3.4, 0.35),
            textcoords="data", ha="left", va="bottom", fontsize=10, color=C["orange"],
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["orange"], shrinkA=1, shrinkB=1))
title_above(ax, "（c）违反：只能买整数个")
label_below(ax, "灰点：能选的组合只有整数点")

save(fig, "p19-lns", lecture="lecture1")
