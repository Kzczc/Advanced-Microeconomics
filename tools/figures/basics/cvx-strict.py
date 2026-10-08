"""cvx-strict: strict versions forbid flat pieces.

(a) a disk: the midpoint of any two different points of the set is strictly inside -- strictly convex.
(b) a square: two points on the same edge have their midpoint on the edge, not strictly inside --
    convex but not strictly convex.
(c) a plateau f(x) = min{1, 1.6 exp(-(x - 5)^2 / 6)}: quasi-concave, but f(4) = f(5) = f(6) = 1,
    so the midpoint is not strictly better than the ends -- not strictly quasi-concave.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import Circle, Rectangle  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, axes = plt.subplots(1, 3, figsize=(10.4, 3.7), gridspec_kw=dict(width_ratios=[1, 1, 1.25]))
fig.subplots_adjust(wspace=0.15)


def dot(ax, x, y, color, size=7, marker="o"):
    ax.plot([x], [y], marker, ms=size, color=color, mec="white", mew=1.2, zorder=5)


# ---- (a) disk ------------------------------------------------------------------
ax = axes[0]
ax.set_aspect("equal")
ax.axis("off")
ax.set_xlim(-1.3, 1.3)
ax.set_ylim(-1.55, 1.3)
ax.add_patch(Circle((0, 0), 1, fc=C["fill_teal"], ec=C["teal"], lw=1.4))
a = (np.cos(np.radians(150)), np.sin(np.radians(150)))
b = (np.cos(np.radians(40)), np.sin(np.radians(40)))
ax.plot([a[0], b[0]], [a[1], b[1]], color=C["navy"], lw=1.6, zorder=3)
dot(ax, *a, C["navy"])
dot(ax, *b, C["navy"])
dot(ax, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, C["orange"])
ax.text(0, -1.3, "两点都在边上，中点也严格在里面", ha="center", va="center", fontsize=10.5, color=C["teal"])
ax.set_title("（a）圆盘：严格凸", pad=8)

# ---- (b) square ----------------------------------------------------------------
ax = axes[1]
ax.set_aspect("equal")
ax.axis("off")
ax.set_xlim(-1.3, 1.3)
ax.set_ylim(-1.55, 1.3)
ax.add_patch(Rectangle((-0.9, -0.9), 1.8, 1.8, fc=C["fill_blue"], ec=C["navy"], lw=1.4))
ax.plot([-0.9, 0.9], [0.9, 0.9], color=C["red"], lw=3, zorder=3)
dot(ax, -0.5, 0.9, C["navy"])
dot(ax, 0.5, 0.9, C["navy"])
dot(ax, 0.0, 0.9, C["orange"])
ax.text(0, -1.3, "同一条边上两点，中点还在边上", ha="center", va="center", fontsize=10.5, color=C["red"])
ax.set_title("（b）正方形：凸，但不严格凸", pad=8)

# ---- (c) plateau ---------------------------------------------------------------
ax = axes[2]
econ_axes(ax, (0, 10.6), (0, 1.3), "$x$", None, ticks=True)
xs = np.linspace(0, 10, 600)
ax.plot(xs, np.minimum(1, 1.6 * np.exp(-(xs - 5) ** 2 / 6)), color=C["navy"], zorder=2)
ax.plot([3.32, 6.68], [1, 1], color=C["red"], lw=3, zorder=3)
for x in (4, 6):
    dot(ax, x, 1, C["navy"])
    ax.plot([x, x], [0, 1], color=C["muted"], lw=0.8, ls=DASH, zorder=1)
dot(ax, 5, 1, C["orange"])
ax.text(5, 1.1, "$f(4)=f(5)=f(6)=1$", ha="center", va="bottom", fontsize=10.5, color=C["red"])
ax.set_xticks([4, 5, 6])
ax.set_yticks([1])
ax.text(5.3, -0.25, "平顶：拟凹，但不严格拟凹", ha="center", va="center", fontsize=10.5, color=C["red"])
ax.set_title("（c）平顶的函数", pad=8)

save(fig, "cvx-strict", lecture="basics")
