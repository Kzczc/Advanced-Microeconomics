"""p06-venn: two menus A and B that share 苹果 (x) and 香蕉 (y), for Proposition 1 (2)."""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Ellipse  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(7.2, 3.7))
ax.set_xlim(-0.4, 10.4)
ax.set_ylim(0, 5.2)
ax.set_aspect("equal")
ax.axis("off")

ax.add_patch(Ellipse((3.75, 2.65), 5.4, 3.9, fc=C["fill_blue"], ec=C["navy"], lw=1.6, alpha=0.85))
ax.add_patch(Ellipse((6.25, 2.65), 5.4, 3.9, fc=C["fill_red"], ec=C["red"], lw=1.6, alpha=0.6))
ax.add_patch(Ellipse((3.75, 2.65), 5.4, 3.9, fc="none", ec=C["navy"], lw=1.6))

ax.text(1.6, 4.75, "菜单 $A$：选中了苹果 $x$", fontsize=11.5, color=C["navy"], ha="center")
ax.text(8.4, 4.75, "菜单 $B$：选中了香蕉 $y$", fontsize=11.5, color=C["red"], ha="center")
ax.text(2.2, 2.65, "橙子", fontsize=12, ha="center", va="center")
ax.text(7.8, 2.65, "梨", fontsize=12, ha="center", va="center")
ax.text(5.0, 3.35, "苹果 $x$", fontsize=12, ha="center", va="center")
ax.text(5.0, 1.95, "香蕉 $y$", fontsize=12, ha="center", va="center")
ax.text(5.0, 0.45, "$A\\cap B$：两份菜单都有的", fontsize=10.5, ha="center", va="center", color=C["ink2"])
ax.annotate("", xy=(5.0, 0.72), xytext=(5.0, 1.45),
            arrowprops=dict(arrowstyle="<-", lw=0.9, color=C["ink2"]))

save(fig, "p06-venn", lecture="lecture1")
