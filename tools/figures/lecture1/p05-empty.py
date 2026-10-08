"""p05-empty: two ways the choice rule can come out empty.

(a) infinite menu B = [0, 1) with "bigger is better": every x is beaten by (x + 1) / 2;
(b) cyclic preferences on a finite menu: every fruit is beaten by another one.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import Circle, FancyArrowPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, axes = plt.subplots(1, 2, figsize=(9.0, 3.2), gridspec_kw=dict(width_ratios=[1.35, 1]))
fig.subplots_adjust(wspace=0.12)

# (a) Number line [0, 1).
ax = axes[0]
ax.set_xlim(-0.08, 1.12)
ax.set_ylim(-0.75, 1.0)
ax.axis("off")
ax.plot([0, 1], [0, 0], color=C["navy"], lw=3, solid_capstyle="butt", zorder=2)
ax.plot([-0.05, 0], [0, 0], color=C["muted"], lw=1, zorder=1)
ax.plot([1, 1.08], [0, 0], color=C["muted"], lw=1, zorder=1)
ax.plot(0, 0, "o", ms=8, color=C["navy"], zorder=4)
ax.plot(1, 0, "o", ms=8, mfc="white", mec=C["navy"], mew=1.8, zorder=4)
ax.text(0, -0.2, "0", ha="center", va="top", fontsize=11)
ax.text(1, -0.2, "1", ha="center", va="top", fontsize=11)
ax.text(0, 0.18, "0 在菜单里", ha="center", va="bottom", fontsize=10, color=C["navy"])
ax.text(1.02, 0.45, "1 不在菜单里", ha="center", va="bottom", fontsize=10, color=C["red"])

steps = [0.5]
for _ in range(3):
    steps.append((steps[-1] + 1) / 2)
labels = ["0.5", "0.75", "0.875", ""]
for i, (x, lab) in enumerate(zip(steps, labels)):
    ax.plot(x, 0, "o", ms=5.5, color=C["teal"], zorder=5)
    if lab:
        ax.text(x, -0.2, lab, ha="center", va="top", fontsize=10, color=C["teal"])
    if i < len(steps) - 1:
        ax.add_patch(FancyArrowPatch((x, 0.04), (steps[i + 1], 0.04), arrowstyle="-|>",
                                     mutation_scale=10, lw=1.2, color=C["teal"],
                                     connectionstyle="arc3,rad=-0.7", shrinkA=3, shrinkB=3,
                                     zorder=3))
ax.text(0.5, 0.72, "每一步取 $x$ 和 1 的中点 $x'=\\frac{x+1}{2}$：还在菜单里，而且更大",
        ha="center", va="center", fontsize=10.5, color=C["teal"])
ax.text(0.5, -0.62, "（a）菜单 $[0,1)$、越大越好：$C(B;\\succeq)=\\varnothing$", ha="center",
        va="center", fontsize=11)

# (b) Cycle of three fruits.
ax = axes[1]
ax.set_xlim(0, 6)
ax.set_ylim(-0.95, 4.6)
ax.set_aspect("equal")
ax.axis("off")
pos = {"苹果": (3.0, 3.75), "香蕉": (5.0, 0.7), "橙子": (1.0, 0.7)}
for name, (x, y) in pos.items():
    ax.add_patch(Circle((x, y), 0.62, fc=C["fill_gray"], ec=C["gray"], lw=1.3, zorder=3))
    ax.text(x, y, name, ha="center", va="center", fontsize=11, zorder=4)


def beats(a, b):
    p, q = np.array(pos[a]), np.array(pos[b])
    d = (q - p) / np.linalg.norm(q - p)
    ax.add_patch(FancyArrowPatch(p + 0.7 * d, q - 0.7 * d, arrowstyle="-|>", mutation_scale=13,
                                 lw=1.5, color=C["red"], zorder=2))


beats("苹果", "香蕉")
beats("香蕉", "橙子")
beats("橙子", "苹果")
ax.text(3.0, 1.75, "每个都被打败\n$C(B;\\succeq)=\\varnothing$", ha="center", va="center",
        fontsize=10.5, color=C["red"], linespacing=1.5)
ax.text(3.0, -0.62, "（b）循环偏好：箭头 $a\\to b$ 表示 $a\\succ b$", ha="center", va="center",
        fontsize=11)

save(fig, "p05-empty", lecture="lecture1")
