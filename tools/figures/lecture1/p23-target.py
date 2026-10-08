"""p23-target: random errors versus a systematic deviation (illustrative, simulated shots).

(a) Shots scatter around the bull's-eye: errors cancel, the average lands in the centre.
(b) Shots cluster to one side: more shots do not help, the average itself is off.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import Circle  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()
rng = np.random.default_rng(23)
N = 30


def target(ax):
    for r, face in [(3.0, "white"), (2.25, C["fill_gray"]), (1.5, "white"), (0.75, C["fill_gray"])]:
        ax.add_patch(Circle((0, 0), r, fc=face, ec=C["gray"], lw=1.0, zorder=1))
    ax.plot(0, 0, marker="+", ms=9, mew=1.4, color=C["ink2"], zorder=2)
    ax.set_xlim(-3.4, 3.4)
    ax.set_ylim(-3.4, 3.4)
    ax.set_aspect("equal")
    ax.axis("off")


def mean_marker(ax, x, y, color):
    ax.plot(x, y, marker="D", ms=8, color=color, mec="white", mew=1.2, zorder=6)


fig, axes = plt.subplots(1, 2, figsize=(7.4, 3.9))
fig.subplots_adjust(wspace=0.08, bottom=0.17)

ax = axes[0]
target(ax)
shots = rng.normal(0, 0.95, size=(N, 2))
ax.plot(shots[:, 0], shots[:, 1], "o", ms=4.5, color=C["navy"], alpha=0.85, zorder=4)
mean_marker(ax, *shots.mean(axis=0), C["teal"])
ax.text(0, -3.75, "（a）随机误差：东一枪西一枪，\n平均落在靶心附近", ha="center", va="top",
        fontsize=11, linespacing=1.45)

ax = axes[1]
target(ax)
centre = np.array([1.75, 1.2])
shots = centre + rng.normal(0, 0.36, size=(N, 2))
ax.plot(shots[:, 0], shots[:, 1], "o", ms=4.5, color=C["red"], alpha=0.85, zorder=4)
mx, my = shots.mean(axis=0)
ax.annotate("", xy=(mx, my), xytext=(0, 0), zorder=7,
            arrowprops=dict(arrowstyle="-|>", lw=1.6, color=C["orange"], shrinkA=5, shrinkB=7,
                            mutation_scale=13))
mean_marker(ax, mx, my, C["orange"])
ax.text(0.1, 1.45, "总偏向\n右上方", ha="center", va="center", fontsize=10.5, color=C["orange"],
        linespacing=1.3, bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none"), zorder=6)
ax.text(0, -3.75, "（b）系统性偏差：总往同一边偏，\n打得再多，平均也是偏的", ha="center", va="top",
        fontsize=11, linespacing=1.45)

fig.text(0.5, 0.955, "菱形 = 30 枪的平均位置（模拟数据，示意）", ha="center", va="center",
         fontsize=10, color=C["ink2"])

save(fig, "p23-target", lecture="lecture1")
