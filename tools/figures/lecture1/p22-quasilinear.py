"""p22-quasilinear: indifference curves of u(a, y) = a + 4 sqrt(y), money a on the vertical axis.

(a) every curve a = k - 4 sqrt(y) is the same curve shifted up or down: at any y the gap
    between the curves u = 8 and u = 12 (or u = 12 and u = 16) is exactly 4;
(b) v(y) as compensation: with the worst y-bar = 0, (0, y) ~ (v(y), y-bar); for y = 4,
    v(4) = 8 is where the curve through (a = 0, y = 4) meets the money axis.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

YMAX, AMAX = 9.6, 17.5
ys = np.linspace(0, 9.2, 400)


def curve(ax, k, color=C["navy"], lw=2):
    a = k - 4 * np.sqrt(ys)
    keep = a >= 0
    ax.plot(ys[keep], a[keep], color=color, lw=lw, zorder=2)


def gap(ax, y, k_low, k_high):
    lo, hi = k_low - 4 * np.sqrt(y), k_high - 4 * np.sqrt(y)
    ax.annotate("", (y, hi), (y, lo), arrowprops=dict(arrowstyle="<|-|>", lw=1.1,
                                                      color=C["orange"], shrinkA=0, shrinkB=0,
                                                      mutation_scale=9), zorder=4)
    ax.text(y + 0.2, (lo + hi) / 2, "4 元", ha="left", va="center", fontsize=10,
            color=C["orange"])


def label_below(ax, text):
    ax.text(0.5, -0.1, text, transform=ax.transAxes, ha="center", va="top", fontsize=10.5,
            color=C["ink2"])


def title_above(ax, text):
    ax.text(0.5, 1.07, text, transform=ax.transAxes, ha="center", va="bottom", fontsize=11.5)


fig, axes = plt.subplots(1, 2, figsize=(8.4, 3.7))
fig.subplots_adjust(wspace=0.28)

# (a) Vertical shifts.
ax = axes[0]
econ_axes(ax, (0, YMAX), (0, AMAX), xlabel="$y$", ylabel="钱 $a$")
for k in (8, 12, 16):
    curve(ax, k)
    ax.text(1.2, k - 4 * np.sqrt(1.2) + 0.6, "$u=%d$" % k, ha="left", va="bottom", fontsize=10,
            color=C["navy"])
gap(ax, 3.0, 8, 12)
gap(ax, 6.25, 12, 16)
title_above(ax, "（a）同一条曲线上下平移")
label_below(ax, "任何一个 $y$ 处，相邻两条曲线都差 4 元")

# (b) v(y) as the compensating amount of money.
ax = axes[1]
econ_axes(ax, (0, YMAX), (0, AMAX), xlabel="$y$", ylabel="钱 $a$")
curve(ax, 8, color=C["teal"])
ax.plot(4, 0, "o", ms=7, color=C["red"], zorder=5, clip_on=False)
ax.plot(0, 8, "o", ms=7, color=C["red"], zorder=5, clip_on=False)
ax.annotate("$(0,y)$：没有钱，$y=4$", (4, 0), xytext=(8, 10), textcoords="offset points",
            ha="left", va="bottom", fontsize=10.5, color=C["red"])
ax.annotate("$(v(y),\\bar y)$：钱 $v(4)=8$，$\\bar y=0$", (0, 8), xytext=(8, 6),
            textcoords="offset points", ha="left", va="bottom", fontsize=10.5, color=C["red"])
ax.text(2.6, 3.4, "同一条无差异曲线", ha="left", va="bottom", fontsize=10, color=C["teal"])
title_above(ax, "（b）$v(y)$：值多少钱")
label_below(ax, "$(0,y)\\sim(v(y),\\bar y)$：$y$ 从 0 变成 4，值 8 元")

save(fig, "p22-quasilinear", lecture="lecture1")
