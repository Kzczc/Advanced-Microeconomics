"""seq-examples: three sequences plotted as dots (n on the horizontal axis).

(a) x_n = 1/n settles down towards 0.
(b) x_n = (-1)^n keeps jumping between -1 and 1.
(c) savings 1000 × 1.03^n grows without bound (3 percent interest per year).
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, axes = plt.subplots(1, 3, figsize=(10.4, 3.5))
fig.subplots_adjust(wspace=0.32)

# ---- (a) 1/n -----------------------------------------------------------------
ax = axes[0]
n = np.arange(1, 16)
econ_axes(ax, (0, 16.5), (0, 1.15), "$n$", "$x_n$", ticks=True)
ax.plot(n, 1 / n, "o", ms=5.5, color=C["navy"], mec="white", mew=0.8)
ax.set_xticks([1, 5, 10, 15])
ax.set_yticks([0.2, 0.5, 1.0])
ax.set_yticklabels(["$0.2$", "$0.5$", "$1$"])
ax.set_title("（a）$x_n=1/n$：越来越靠近 0", pad=24)

# ---- (b) (-1)^n --------------------------------------------------------------
ax = axes[1]
for side in ("top", "right"):
    ax.spines[side].set_visible(False)
ax.spines["bottom"].set_position(("data", 0))
ax.set_xlim(0, 16.5)
ax.set_ylim(-1.35, 1.35)
ax.plot(n, (-1.0) ** n, "o", ms=5.5, color=C["red"], mec="white", mew=0.8)
ax.set_xticks([5, 10, 15])
ax.set_yticks([-1, 1])
ax.text(16.6, 0.06, "$n$", ha="left", va="bottom", fontsize=11)
ax.set_title("（b）$x_n=(-1)^n$：来回跳", pad=24)

# ---- (c) savings ---------------------------------------------------------------
ax = axes[2]
n2 = np.arange(0, 31)
econ_axes(ax, (0, 32), (0, 2700), "年数 $n$", "存款（元）", ticks=True)
ax.plot(n2, 1000 * 1.03 ** n2, "o", ms=4.5, color=C["teal"], mec="white", mew=0.6)
ax.set_xticks([0, 10, 20, 30])
ax.set_yticks([1000, 1344, 2427])
ax.set_yticklabels(["$1000$", "$1344$", "$2427$"])
for year, value in [(10, 1344), (30, 2427)]:
    ax.plot([year, year], [0, value], color=C["muted"], lw=1, ls=DASH)
    ax.plot([0, year], [value, value], color=C["muted"], lw=1, ls=DASH)
ax.set_title("（c）$1000\\times1.03^n$：越来越大", pad=24)

save(fig, "seq-examples", lecture="basics")
