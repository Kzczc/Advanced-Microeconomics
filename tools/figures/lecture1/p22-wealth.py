"""p22-wealth: no wealth effects vs wealth effects, read off the slopes of indifference curves.

The slope of an indifference curve (money a against good y) is how much money the consumer
would give up for a little more y.
(a) u = a + 4 sqrt(y): at y = 2.25 every curve has slope -4/3, whatever the money level;
(b) u = a (1 + y): at y = 2 the slope is -a / 3, steeper for the richer curves.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

YMAX, AMAX = 6.4, 13.0
ys = np.linspace(0, 6.2, 400)
HALF = 0.75


def tangent(ax, y0, a0, slope):
    ax.plot([y0 - HALF, y0 + HALF], [a0 - slope * HALF, a0 + slope * HALF], color=C["orange"],
            lw=2.4, zorder=4, solid_capstyle="round")
    ax.plot(y0, a0, "o", ms=5, color=C["orange"], zorder=5)


def label_below(ax, text):
    ax.text(0.5, -0.1, text, transform=ax.transAxes, ha="center", va="top", fontsize=10.5,
            color=C["ink2"])


def title_above(ax, text):
    ax.text(0.5, 1.07, text, transform=ax.transAxes, ha="center", va="bottom", fontsize=11.5)


fig, axes = plt.subplots(1, 2, figsize=(8.4, 3.7))
fig.subplots_adjust(wspace=0.28)

# (a) Quasi-linear: same slope at the same y.
ax = axes[0]
econ_axes(ax, (0, YMAX), (0, AMAX), xlabel="$y$", ylabel="钱 $a$")
y0 = 2.25
for k in (8, 12, 16):
    a = k - 4 * np.sqrt(ys)
    keep = (a >= 0) & (a <= AMAX)
    ax.plot(ys[keep], a[keep], color=C["navy"], lw=2, zorder=2)
    tangent(ax, y0, k - 4 * np.sqrt(y0), -2 / np.sqrt(y0))
ax.plot([y0, y0], [0, AMAX], color=C["ink2"], lw=1, ls=(0, (4, 3)), zorder=1)
ax.text(y0 + 0.15, 12.3, "$y=2.25$", ha="left", va="center", fontsize=10)
ax.text(3.4, 9.6, "三段橙线一样陡", ha="left", va="center", fontsize=10.5, color=C["orange"])
title_above(ax, "（a）$u=a+4\\sqrt{y}$：没有财富效应")
label_below(ax, "钱多钱少，为多一点 $y$ 肯付的钱一样")

# (b) u = a (1 + y): richer curves are steeper.
ax = axes[1]
econ_axes(ax, (0, YMAX), (0, AMAX), xlabel="$y$", ylabel="钱 $a$")
y1 = 2.0
for k in (6, 12, 18):
    a = k / (1 + ys)
    keep = a <= AMAX
    ax.plot(ys[keep], a[keep], color=C["navy"], lw=2, zorder=2)
    a1 = k / (1 + y1)
    tangent(ax, y1, a1, -a1 / (1 + y1))
ax.plot([y1, y1], [0, AMAX], color=C["ink2"], lw=1, ls=(0, (4, 3)), zorder=1)
ax.text(y1 + 0.15, 12.3, "$y=2$", ha="left", va="center", fontsize=10)
ax.text(3.3, 7.6, "钱越多，橙线越陡", ha="left", va="center", fontsize=10.5, color=C["orange"])
title_above(ax, "（b）$u=a(1+y)$：有财富效应")
label_below(ax, "越有钱，越肯为多一点 $y$ 多付钱")

save(fig, "p22-wealth", lecture="lecture1")
