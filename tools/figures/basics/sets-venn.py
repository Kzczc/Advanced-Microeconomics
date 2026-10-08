"""sets-venn: subset, intersection, union and difference of two fruit stalls.

A = {苹果, 香蕉, 橙子} (stall A), B = {苹果, 香蕉, 梨} (stall B), the same menus as page 6.
Panel (a) shows S = {苹果, 香蕉} sitting inside A; panels (b)-(d) shade A ∩ B, A ∪ B and A − B.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Circle  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

CA, CB, R = (3.85, 3.0), (6.15, 3.0), 2.25
ITEMS = {"橙子": (2.55, 3.0), "苹果": (5.0, 3.55), "香蕉": (5.0, 2.45), "梨": (7.45, 3.0)}


def frame(ax, title, bottom):
    ax.set_xlim(0.2, 9.8)
    ax.set_ylim(-0.25, 6.05)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.text(5.0, 5.75, title, ha="center", va="center", fontsize=11.5)
    ax.text(5.0, 0.15, bottom, ha="center", va="center", fontsize=10.5, color=C["ink2"])


def outlines(ax):
    ax.add_patch(Circle(CA, R, fc="none", ec=C["navy"], lw=1.5, zorder=3))
    ax.add_patch(Circle(CB, R, fc="none", ec=C["red"], lw=1.5, zorder=3))
    ax.text(1.75, 4.85, "$A$", fontsize=12, color=C["navy"], ha="center", va="center")
    ax.text(8.25, 4.85, "$B$", fontsize=12, color=C["red"], ha="center", va="center")


def items(ax, names=ITEMS, faded=()):
    for name, (x, y) in names.items():
        ax.text(x, y, name, ha="center", va="center", fontsize=11, zorder=5,
                color=C["muted"] if name in faded else C["ink"])


fig, axes = plt.subplots(2, 2, figsize=(7.4, 5.0))
fig.subplots_adjust(wspace=0.04, hspace=0.12)

# (a) Subset: S = {苹果, 香蕉} inside A.
ax = axes[0, 0]
frame(ax, "（a）子集：$S\\subseteq A$", "$S$ 的每个元素都在 $A$ 里")
ax.add_patch(Circle((4.6, 3.0), 2.55, fc=C["fill_blue"], ec=C["navy"], lw=1.5, zorder=1))
ax.add_patch(Circle((5.45, 3.0), 1.2, fc=C["fill_teal"], ec=C["teal"], lw=1.5, zorder=2))
ax.text(1.75, 5.0, "$A$", fontsize=12, color=C["navy"], ha="center", va="center")
ax.text(5.45, 4.55, "$S$", fontsize=12, color=C["teal"], ha="center", va="center")
items(ax, {"橙子": (3.2, 3.0), "苹果": (5.45, 3.5), "香蕉": (5.45, 2.5)})

# (b) Intersection: the lens shared by A and B.
ax = axes[0, 1]
frame(ax, "（b）交集 $A\\cap B$", "$A\\cap B=\\{$苹果，香蕉$\\}$：两边都有的")
clip = Circle(CA, R, transform=ax.transData)
lens = Circle(CB, R, fc=C["fill_purple"], ec="none", zorder=1)
ax.add_patch(lens)
lens.set_clip_path(clip)
outlines(ax)
items(ax, faded=("橙子", "梨"))

# (c) Union: everything in at least one of them.
ax = axes[1, 0]
frame(ax, "（c）并集 $A\\cup B$", "$A\\cup B=\\{$苹果，香蕉，橙子，梨$\\}$")
for c in (CA, CB):
    ax.add_patch(Circle(c, R, fc=C["fill_orange"], ec="none", zorder=1))
outlines(ax)
items(ax)

# (d) Difference: in A but not in B.
ax = axes[1, 1]
frame(ax, "（d）差集 $A-B$", "$A-B=\\{$橙子$\\}$：$A$ 有、$B$ 没有的")
ax.add_patch(Circle(CA, R, fc=C["fill_teal"], ec="none", zorder=1))
ax.add_patch(Circle(CB, R, fc="white", ec="none", zorder=2))
outlines(ax)
items(ax, faded=("苹果", "香蕉", "梨"))

save(fig, "sets-venn", lecture="basics")
