"""func-increasing: strictly increasing, increasing-but-not-strictly, decreasing.

(a) f(t) = 2t + 1: going right always goes up.
(b) taxi fare: 13 yuan for the first 3 km, then 2.3 yuan per km -- never goes down,
    but is flat on [0, 3], so it is increasing but not strictly increasing.
(c) g(t) = 5 - t: going right goes down.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, axes = plt.subplots(1, 3, figsize=(10.4, 3.6))
fig.subplots_adjust(wspace=0.32)


def guide(ax, x, y, x0=0.0, y0=0.0):
    """Dashed guide lines from a point down to the x-axis and across to the y-axis."""
    ax.plot([x, x], [y0, y], color=C["muted"], lw=1, ls=DASH)
    ax.plot([x0, x], [y, y], color=C["muted"], lw=1, ls=DASH)


# ---- (a) strictly increasing --------------------------------------------------
ax = axes[0]
econ_axes(ax, (0, 4.6), (0, 10.2), "$t$", "$f(t)$", ticks=True)
t = np.linspace(0, 4.2, 50)
ax.plot(t, 2 * t + 1, color=C["navy"])
for a in (1, 3):
    guide(ax, a, 2 * a + 1)
    ax.plot([a], [2 * a + 1], "o", ms=6, color=C["navy"], mec="white", mew=1.2, zorder=4)
ax.set_xticks([1, 3])
ax.set_yticks([3, 7])
ax.text(2.35, 9.6, "$f(t)=2t+1$", ha="center", va="center", fontsize=11, color=C["navy"])
ax.set_title("（a）严格递增", pad=22)
ax.text(2.3, -2.6, "$1<3$ 时 $f(1)=3<7=f(3)$", ha="center", va="center", fontsize=10.5, color=C["ink2"])

# ---- (b) taxi fare: increasing, not strictly ----------------------------------
ax = axes[1]
econ_axes(ax, (0, 8.6), (0, 27), "公里", "车费（元）", ticks=True)
d = np.linspace(0, 8, 200)
fare = np.where(d <= 3, 13.0, 13 + 2.3 * (d - 3))
ax.plot(d, fare, color=C["teal"])
ax.plot([0, 3], [13, 13], color=C["orange"], lw=3.2, solid_capstyle="butt", zorder=3)
ax.text(1.5, 15.0, "平的一段", ha="center", va="bottom", fontsize=10.5, color=C["orange"])
for km in (3, 5):
    y = 13 if km == 3 else 13 + 2.3 * (km - 3)
    guide(ax, km, y)
ax.set_xticks([1, 3, 5])
ax.set_yticks([13, 17.6])
ax.set_yticklabels(["$13$", "$17.6$"])
ax.set_title("（b）递增但不严格", pad=22)
ax.text(4.3, -6.9, "1 公里和 3 公里都是 13 元", ha="center", va="center", fontsize=10.5, color=C["ink2"])

# ---- (c) decreasing -------------------------------------------------------------
ax = axes[2]
econ_axes(ax, (0, 5.6), (0, 6.2), "$t$", "$g(t)$", ticks=True)
t = np.linspace(0, 5, 50)
ax.plot(t, 5 - t, color=C["red"])
for a in (1, 3):
    guide(ax, a, 5 - a)
    ax.plot([a], [5 - a], "o", ms=6, color=C["red"], mec="white", mew=1.2, zorder=4)
ax.set_xticks([1, 3])
ax.set_yticks([2, 4])
ax.text(3.6, 3.2, "$g(t)=5-t$", ha="center", va="center", fontsize=11, color=C["red"])
ax.set_title("（c）递减", pad=22)
ax.text(2.8, -1.55, "$1<3$ 时 $g(1)=4>2=g(3)$", ha="center", va="center", fontsize=10.5, color=C["ink2"])

save(fig, "func-increasing", lecture="basics")
