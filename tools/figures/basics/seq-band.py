"""seq-band: the epsilon-N picture of x_n = 1/n converging to 0.

A band of half-width ε around the limit 0. From term N on, every dot lies in the band.
(a) ε = 0.2: 1/n < 0.2 iff n > 5, so N = 6.
(b) ε = 0.05: 1/n < 0.05 iff n > 20, so N = 21.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, axes = plt.subplots(1, 2, figsize=(10.0, 3.7))
fig.subplots_adjust(wspace=0.22)
n = np.arange(1, 31)

for ax, eps, first_inside, title, ytop in [(axes[0], 0.2, 6, "（a）$\\varepsilon=0.2$：从第 6 项起都在带子里", 1.08),
                                           (axes[1], 0.05, 21, "（b）$\\varepsilon=0.05$：从第 21 项起都在带子里", 0.36)]:
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_position(("data", 0))
    ax.set_xlim(0, 31.5)
    ax.set_ylim(-0.3 * ytop, ytop)
    ax.axhspan(-eps, eps, color=C["fill_teal"], zorder=0)
    ax.axhline(eps, color=C["teal"], lw=1, ls=DASH)
    ax.axhline(-eps, color=C["teal"], lw=1, ls=DASH)
    outside = n < first_inside
    ax.plot(n[outside], 1 / n[outside], "o", ms=5.5, color=C["orange"], mec="white", mew=0.8, zorder=3)
    ax.plot(n[~outside], 1 / n[~outside], "o", ms=5.5, color=C["navy"], mec="white", mew=0.8, zorder=3)
    ax.axvline(first_inside, color=C["purple"], lw=1, ls=DASH, ymax=0.92)
    ax.text(first_inside + 0.4, 0.86 * ytop, f"$N={first_inside}$", ha="left", va="center", fontsize=11, color=C["purple"])
    ax.set_xticks([1, 10, 20, 30])
    top_tick = 1.0 if ytop > 1 else 0.3
    ax.set_yticks([-eps, eps, top_tick])
    ax.set_yticklabels([f"$-{eps:g}$", f"${eps:g}$", f"${top_tick:g}$"])
    ax.text(31.6, 0.03 * ytop, "$n$", ha="left", va="bottom", fontsize=11)
    ax.set_title(title, pad=10)

axes[0].text(12.0, 0.55, "橙色：还在带子外", ha="left", va="center", fontsize=10.5, color=C["orange"])
axes[0].text(12.0, 0.42, "蓝色：已经进了带子，再也不出去", ha="left", va="center", fontsize=10.5, color=C["navy"])

axes[1].text(22.5, 0.2, "纵轴放大了：\n前两项 1、0.5\n在图外", ha="left", va="center", fontsize=10.5,
             color=C["ink2"], linespacing=1.5)

save(fig, "seq-band", lecture="basics")
