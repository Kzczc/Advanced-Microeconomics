"""p10-flow: how Proposition 2 is used to judge observed choices."""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Polygon  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(8.0, 3.9))
ax.set_xlim(0, 10)
ax.set_ylim(0, 5)
ax.axis("off")


def box(x, y, w, h, text, face, edge, size=11):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.02,rounding_size=0.14",
                                fc=face, ec=edge, lw=1.3, zorder=3))
    ax.text(x, y, text, ha="center", va="center", fontsize=size, zorder=4, linespacing=1.5)


def arrow(p, q, text=None, color=C["ink2"], text_pos=None):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle="-|>", mutation_scale=13, lw=1.3, color=color, zorder=2))
    if text:
        ax.text(*text_pos, text, ha="center", va="center", fontsize=11, color=color, fontweight="bold")


box(5.0, 4.45, 6.2, 0.7, "观察到每一份菜单上的选择 $C(A)$（每份都选出了东西）", C["fill_gray"], C["gray"])
ax.add_patch(Polygon([[5.0, 3.65], [6.35, 3.0], [5.0, 2.35], [3.65, 3.0]], closed=True,
                     fc="white", ec=C["ink2"], lw=1.3, zorder=3))
ax.text(5.0, 3.0, "满足 HARP 吗？", ha="center", va="center", fontsize=11.5, zorder=4)
arrow((5.0, 4.1), (5.0, 3.66))

box(1.95, 1.05, 3.6, 1.35,
    "能被理性偏好解释\n就用显示偏好 $\\succeq_c$\n（命题 2 的“$\\Leftarrow$”，第 11–12 页）",
    C["fill_teal"], C["teal"], size=10.5)
box(8.05, 1.05, 3.6, 1.35,
    "任何完备、传递的偏好\n都解释不了\n（命题 2 的“$\\Rightarrow$”，靠命题 1）",
    C["fill_red"], C["red"], size=10.5)
arrow((3.7, 2.9), (2.3, 1.75), "是", C["teal"], text_pos=(2.75, 2.55))
arrow((6.3, 2.9), (7.7, 1.75), "否", C["red"], text_pos=(7.25, 2.55))

save(fig, "p10-flow", lecture="lecture1")
