"""p01-triangle: the three objects of Lecture 1 and the arrows between them.

Preferences generate choices (C(B; ⪰), pages 5-7); choices reveal preferences (pages 8-13);
utility represents preferences (pages 14-17); choosing the highest score reproduces the
choice (argmax, page 14).
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(7.6, 4.3))
ax.set_xlim(0, 10)
ax.set_ylim(0, 5.6)
ax.axis("off")

NODES = {
    "pref": (5.0, 4.55, "偏好 $\\succeq$\n谁比谁好", C["fill_blue"], C["navy"]),
    "choice": (1.6, 1.0, "选择 $C$\n从菜单里挑什么", C["fill_teal"], C["teal"]),
    "util": (8.4, 1.0, "效用 $u$\n给选项打分", C["fill_orange"], C["orange"]),
}
W, H = 2.5, 1.15

for x, y, text, face, edge in NODES.values():
    ax.add_patch(FancyBboxPatch((x - W / 2, y - H / 2), W, H,
                                boxstyle="round,pad=0.02,rounding_size=0.16", fc=face, ec=edge,
                                lw=1.4, zorder=3))
    ax.text(x, y, text, ha="center", va="center", fontsize=11.5, zorder=4, linespacing=1.5)


def arrow(p, q, color, rad):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle="-|>", mutation_scale=14, lw=1.5, color=color,
                                 connectionstyle=f"arc3,rad={rad}", shrinkA=2, shrinkB=2,
                                 zorder=2))


# Preferences <-> choices (two arcs).
arrow((3.85, 4.15), (1.75, 1.62), C["navy"], 0.18)
arrow((2.45, 1.62), (4.35, 3.95), C["teal"], 0.18)
ax.text(1.05, 3.35, "选最好的\n$C(B;\\succeq)$\n第 5–7 页", ha="center", va="center", fontsize=10.5,
        color=C["navy"], linespacing=1.4)
ax.text(4.25, 2.35, "反推：显示偏好\nHARP\n第 8–13 页", ha="center", va="center", fontsize=10.5,
        color=C["teal"], linespacing=1.4)

# Preferences -> utility.
arrow((6.15, 4.15), (8.25, 1.62), C["orange"], -0.18)
ax.text(8.95, 3.35, "打分：$u$ 表示 $\\succeq$\n第 14–17 页", ha="center", va="center",
        fontsize=10.5, color=C["orange"], linespacing=1.4)

# Utility -> choices.
arrow((7.1, 0.85), (2.9, 0.85), C["purple"], 0.0)
ax.text(5.0, 0.42, "选分数最高的：$\\arg\\max\\,u$（第 14 页）", ha="center", va="center",
        fontsize=10.5, color=C["purple"])

save(fig, "p01-triangle", lecture="lecture1")
