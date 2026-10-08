"""sets-induction: mathematical induction as a row of falling dominoes.

Step 1 (base case) pushes domino 1; step 2 (inductive step) says that whenever
domino n falls it knocks over domino n + 1. Together every domino falls.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import FancyArrowPatch, Polygon  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

W, H = 0.34, 1.9  # domino width and height


def domino(ax, right_x, angle_deg, face, edge):
    """Domino standing on the ground with its bottom-right corner at (right_x, 0), tipped clockwise."""
    a = np.radians(angle_deg)
    rot = np.array([[np.cos(a), np.sin(a)], [-np.sin(a), np.cos(a)]])
    corners = np.array([[-W, 0], [0, 0], [0, H], [-W, H]]) @ rot.T + [right_x, 0]
    ax.add_patch(Polygon(corners, closed=True, fc=face, ec=edge, lw=1.3, zorder=3))
    return corners


fig, ax = plt.subplots(figsize=(8.6, 3.5))
ax.set_xlim(-1.4, 11.2)
ax.set_ylim(-1.55, 3.55)
ax.set_aspect("equal")
ax.axis("off")
ax.plot([-1.0, 11.0], [0, 0], color=C["ink2"], lw=1)

positions = [0.9, 2.0, 3.1, 4.2, 6.7, 7.8, 8.9]
labels = ["$1$", "$2$", "$3$", "$4$", "$n$", "$n+1$", "$n+2$"]
angles = [42, 22, 7, 0, 30, 6, 0]
fallen = [True, True, True, False, True, True, False]
for x, lab, ang, f in zip(positions, labels, angles, fallen):
    face, edge = (C["fill_teal"], C["teal"]) if f else (C["fill_blue"], C["navy"])
    domino(ax, x, ang, face, edge)
    ax.text(x - W / 2, -0.22, lab, ha="center", va="top", fontsize=11)
ax.text(5.45, 0.9, "……", ha="center", va="center", fontsize=13, color=C["ink2"])
ax.text(10.15, 0.9, "……", ha="center", va="center", fontsize=13, color=C["ink2"])

# Step 1: push the first domino.
ax.add_patch(FancyArrowPatch((-0.95, 1.0), (1.2, 1.0), arrowstyle="-|>", mutation_scale=14, lw=1.8,
                             color=C["orange"], zorder=5))
ax.text(-1.0, 2.55, "第 1 步（起点）：推倒第 1 块", ha="left", va="bottom", fontsize=10.5, color=C["orange"])
ax.text(-1.0, 2.17, "证明 $P(1)$ 成立", ha="left", va="bottom", fontsize=10.5, color=C["orange"])

# Step 2: domino n knocks over domino n + 1.
ax.add_patch(FancyArrowPatch((6.55, 2.2), (7.75, 2.2), arrowstyle="-|>", mutation_scale=14, lw=1.8,
                             color=C["purple"], connectionstyle="arc3,rad=-0.45", zorder=5))
ax.text(7.2, 3.0, "第 2 步（传递）：第 $n$ 块倒下，就推倒第 $n+1$ 块", ha="center", va="bottom", fontsize=10.5,
        color=C["purple"])
ax.text(7.2, 2.62, "证明“$P(n)\\Rightarrow P(n+1)$”对每个 $n$ 都成立", ha="center", va="bottom", fontsize=10.5,
        color=C["purple"])

ax.text(4.9, -1.05, "两步都做到，每一块都会倒：$P(1)$、$P(2)$、$P(3)$……全都成立", ha="center", va="center",
        fontsize=10.5, color=C["ink2"])

save(fig, "sets-induction", lecture="basics")
