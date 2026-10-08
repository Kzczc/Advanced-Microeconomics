"""func-orders: the componentwise order on R^2_+ is only a partial order.

Around x = (3, 2): the north-east quadrant is {y : y ≥ x}, the south-west quadrant is
{y : y ≤ x}; the other two quadrants cannot be compared with x at all.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Rectangle  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, ax = plt.subplots(figsize=(5.6, 4.3))
econ_axes(ax, (0, 6.4), (0, 5.4), "$x_1$ 咖啡（杯）", "$x_2$ 面包（个）", ticks=True)
X0, Y0 = 3, 2
ax.add_patch(Rectangle((X0, Y0), 6.4 - X0, 5.4 - Y0, fc=C["fill_blue"], ec="none", zorder=0))
ax.add_patch(Rectangle((0, 0), X0, Y0, fc=C["fill_red"], ec="none", zorder=0))
ax.add_patch(Rectangle((0, Y0), X0, 5.4 - Y0, fc=C["fill_gray"], ec="none", zorder=0))
ax.add_patch(Rectangle((X0, 0), 6.4 - X0, Y0, fc=C["fill_gray"], ec="none", zorder=0))
ax.plot([X0, X0], [0, 5.3], color=C["ink2"], lw=1, ls=DASH)
ax.plot([0, 6.3], [Y0, Y0], color=C["ink2"], lw=1, ls=DASH)

ax.text(4.7, 4.6, "样样不少：$y\\ge x$", ha="center", va="center", fontsize=11, color=C["navy"])
ax.text(1.5, 0.45, "样样不多：$y\\le x$", ha="center", va="center", fontsize=11, color=C["red"])
ax.text(1.5, 4.6, "比不了", ha="center", va="center", fontsize=11, color=C["gray"])
ax.text(4.7, 0.45, "比不了", ha="center", va="center", fontsize=11, color=C["gray"])

POINTS = [((3, 2), "$x=(3,2)$", C["ink"], (0.12, 0.12), "left"),
          ((4.5, 3.3), "$(4.5,3.3)$", C["navy"], (0.12, 0.1), "left"),
          ((1.4, 1.2), "$(1.4,1.2)$", C["red"], (0.12, 0.1), "left"),
          ((1.2, 3.6), "$(1.2,3.6)$", C["gray"], (0.12, 0.1), "left"),
          ((5.0, 1.0), "$(5,1)$", C["gray"], (0.12, 0.1), "left")]
for (px, py), label, color, (dx, dy), ha in POINTS:
    ax.plot([px], [py], "o", ms=7, color=color, mec="white", mew=1.2, zorder=4)
    ax.text(px + dx, py + dy, label, ha=ha, va="bottom", fontsize=10.5, color=color)
ax.set_xticks([1, 2, 3, 4, 5, 6])
ax.set_yticks([1, 2, 3, 4, 5])

save(fig, "func-orders", lecture="basics")
