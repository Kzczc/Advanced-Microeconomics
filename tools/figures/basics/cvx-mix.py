"""cvx-mix: convex combinations t x + (1 - t) x' fill the segment between x and x'.

x = (2, 6), x' = (6, 2).  t = 1, 3/4, 1/2, 1/4, 0 give (2,6), (3,5), (4,4), (5,3), (6,2).
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, ax = plt.subplots(figsize=(5.8, 4.6))
econ_axes(ax, (0, 7.8), (0, 7.4), "$x_1$ 咖啡（杯）", "$x_2$ 面包（个）", ticks=True)
ax.set_aspect("equal")
ax.plot([2, 6], [6, 2], color=C["navy"], lw=2, zorder=2)

POINTS = [(1.0, "$t=1$", (2, 6)), (0.75, "$t=\\tfrac34$", (3, 5)), (0.5, "$t=\\tfrac12$", (4, 4)),
          (0.25, "$t=\\tfrac14$", (5, 3)), (0.0, "$t=0$", (6, 2))]
for t, label, (px, py) in POINTS:
    end = t in (0.0, 1.0)
    ax.plot([px], [py], "o", ms=9 if end else 7, color=C["navy"] if end else C["orange"], mec="white",
            mew=1.2, zorder=4)
    ax.text(px + 0.22, py + 0.18, label, ha="left", va="bottom", fontsize=10.5,
            color=C["navy"] if end else C["orange"])
    ax.text(px - 0.2, py - 0.22, f"$({px},{py})$", ha="right", va="top", fontsize=10, color=C["ink2"])
ax.text(1.68, 6.05, "$x$", ha="right", va="center", fontsize=12.5, color=C["navy"])
ax.text(6.3, 1.7, "$x'$", ha="left", va="top", fontsize=12.5, color=C["navy"])
ax.set_xticks(range(1, 8))
ax.set_yticks(range(1, 8))
ax.text(4.0, 0.7, "$t$ 越大越靠近 $x$；$t=\\tfrac12$ 是正中间", ha="center", va="center", fontsize=10.5,
        color=C["ink2"])

save(fig, "cvx-mix", lecture="basics")
