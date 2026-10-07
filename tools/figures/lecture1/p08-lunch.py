"""p08-lunch: revealed preferences from three lunches.

Each arrow points from the dish that was chosen to the dish that was on the menu but
not chosen, labelled with the day. 小明's arrows line up into a ranking; 小刚's form a cycle.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

POS = {"炸鸡": (1.9, 3.9), "牛肉面": (3.2, 1.7), "盖浇饭": (0.6, 1.7)}


def node(ax, name, face, edge):
    x, y = POS[name]
    ax.add_patch(FancyBboxPatch((x - 0.62, y - 0.27), 1.24, 0.54, boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=face, ec=edge, lw=1.3, zorder=3))
    ax.text(x, y, name, ha="center", va="center", fontsize=11.5, zorder=4)


def anchor(name, toward):
    """Point on the edge of a node's box facing the other node (boxes are wide, so sides differ)."""
    (x, y), (tx, ty) = POS[name], POS[toward]
    if abs(ty - y) < 0.3:
        return (x + (0.64 if tx > x else -0.64), y)
    return (x + (0.3 if tx > x else -0.3), y + (0.29 if ty > y else -0.29))


def edge(ax, a, b, day, color, rad=-0.12, label_offset=(0, 0)):
    (xa, ya), (xb, yb) = POS[a], POS[b]
    ax.add_patch(FancyArrowPatch(anchor(a, b), anchor(b, a), arrowstyle="-|>", mutation_scale=13, lw=1.5,
                                 color=color, connectionstyle=f"arc3,rad={rad}", shrinkA=1, shrinkB=1,
                                 zorder=4))
    mx, my = (xa + xb) / 2 + label_offset[0], (ya + yb) / 2 + label_offset[1]
    ax.text(mx, my, day, ha="center", va="center", fontsize=10, color=color, zorder=5,
            bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none"))


fig, axes = plt.subplots(1, 2, figsize=(8.8, 3.7))
fig.subplots_adjust(wspace=0.12)
for ax in axes:
    ax.set_xlim(-0.3, 4.1)
    ax.set_ylim(0.55, 4.6)
    ax.axis("off")

ax = axes[0]
for name in POS:
    node(ax, name, C["fill_blue"], C["navy"])
edge(ax, "炸鸡", "牛肉面", "周二", C["navy"], label_offset=(0.32, 0.1))
edge(ax, "炸鸡", "盖浇饭", "周三", C["navy"], rad=0.12, label_offset=(-0.32, 0.1))
edge(ax, "牛肉面", "盖浇饭", "周一", C["navy"], rad=0.0, label_offset=(0, 0))
ax.text(1.9, 0.75, "（a）小明：排得成 炸鸡 $\\succ$ 牛肉面 $\\succ$ 盖浇饭", ha="center", fontsize=11.5)

ax = axes[1]
for name in POS:
    node(ax, name, C["fill_red"], C["red"])
edge(ax, "牛肉面", "盖浇饭", "周一", C["red"], rad=0.0)
edge(ax, "盖浇饭", "炸鸡", "周二", C["red"], label_offset=(-0.32, 0.1))
edge(ax, "炸鸡", "牛肉面", "周三", C["red"], label_offset=(0.32, 0.1))
ax.text(1.9, 0.75, "（b）小刚：绕成一个圈，排不成榜", ha="center", fontsize=11.5)

save(fig, "p08-lunch", lecture="lecture1")
