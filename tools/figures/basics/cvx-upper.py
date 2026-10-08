"""cvx-upper: upper contour sets of u(x) = x1 x2.

(a) U_4 = {x : x1 x2 >= 4}: everything on or above the curve x1 x2 = 4.
    Test points: (2,2) u=4 in, (1,4) u=4 in, (4,3) u=12 in, (1,1) u=1 out, (3,1) u=3 out.
    The segment between (1,4) and (4,1) stays inside (midpoint (2.5,2.5), u=6.25).
(b) Raising the bar shrinks the set: U_1 ⊇ U_4 ⊇ U_9.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
TOP = 6.2
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.0, 4.4))
fig.subplots_adjust(wspace=0.3)


def level_curve(alpha, x_min=None):
    """x2 = alpha / x1 over the visible window."""
    x1 = np.linspace(alpha / TOP if x_min is None else x_min, TOP, 300)
    return x1, alpha / x1


# ---- (a) U_4 -------------------------------------------------------------------
ax = ax1
econ_axes(ax, (0, TOP), (0, TOP), "$x_1$", "$x_2$", ticks=True)
ax.set_aspect("equal")
x1, x2 = level_curve(4)
ax.fill_between(x1, x2, TOP, color=C["fill_blue"], zorder=0)
ax.plot(x1, x2, color=C["navy"], zorder=2)
ax.text(5.5, 0.32, "$x_1x_2=4$", ha="center", va="center", fontsize=10.5, color=C["navy"])
ax.text(4.2, 5.4, "$U_4$：$x_1x_2\\ge4$", ha="center", va="center", fontsize=11.5, color=C["navy"])
ax.plot([1, 4], [4, 1], color=C["teal"], lw=1.4, ls=DASH, zorder=2)
TESTS = [((2, 2), "$(2,2)$：4", True, (-0.9, -0.6)), ((1, 4), "$(1,4)$：4", True, (0.15, 0.1)),
         ((4, 3), "$(4,3)$：12", True, (0.15, 0.1)), ((1, 1), "$(1,1)$：1", False, (0.15, -0.35)),
         ((3, 1), "$(3,1)$：3", False, (-0.3, -0.42)),
         ((4, 1), "$(4,1)$：4", True, (0.15, 0.1))]
for (px, py), label, inside, (dx, dy) in TESTS:
    color = C["teal"] if inside else C["red"]
    ax.plot([px], [py], "o", ms=7, color=color, mec="white", mew=1.2, zorder=4)
    ax.text(px + dx, py + dy, label, ha="left", va="bottom", fontsize=10, color=color)
ax.set_xticks(range(1, 7))
ax.set_yticks(range(1, 7))
ax.set_title("（a）上等高集 $U_4$：分数至少为 4 的篮子", pad=12)

# ---- (b) nested ------------------------------------------------------------------
ax = ax2
econ_axes(ax, (0, TOP), (0, TOP), "$x_1$", "$x_2$", ticks=True)
ax.set_aspect("equal")
for alpha, fill, edge in [(1, C["fill_teal"], C["teal"]), (4, C["fill_blue"], C["blue"]),
                          (9, C["fill_purple"], C["purple"])]:
    x1, x2 = level_curve(alpha)
    ax.fill_between(x1, x2, TOP, color=fill, zorder=alpha)
    ax.plot(x1, x2, color=edge, lw=1.8, zorder=alpha + 0.5)
    lx = np.sqrt(alpha) * 1.22
    ax.text(lx, lx, f"$U_{alpha}$", ha="center", va="center", fontsize=11, color=edge, zorder=20)
ax.set_xticks(range(1, 7))
ax.set_yticks(range(1, 7))
ax.set_title("（b）门槛越高，集合越小：$U_1\\supseteq U_4\\supseteq U_9$", pad=12)

save(fig, "cvx-upper", lecture="basics")
