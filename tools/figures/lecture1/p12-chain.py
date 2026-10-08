"""p12-chain: without HARP the revealed preference relation need not be transitive.

Data: C({x,y}) = {x}, C({y,z}) = {y}, C({x,z}) = {z}, C({x,y,z}) = {x}.
Arrows a -> b mean a ⪰_c b. The chain y -> z -> x is there, the shortcut y -> x is not.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import Circle, FancyArrowPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(6.4, 3.9))
ax.set_xlim(0, 8)
ax.set_ylim(0, 6)
ax.axis("off")
pos = {"x": (4.0, 4.9), "y": (1.4, 1.5), "z": (6.6, 1.5)}
for name, (x, y) in pos.items():
    ax.add_patch(Circle((x, y), 0.5, fc=C["fill_blue"], ec=C["navy"], lw=1.4, zorder=3))
    ax.text(x, y, "$%s$" % name, ha="center", va="center", fontsize=13, zorder=4)


def edge(a, b, color, rad=0.0, ls="-", lw=1.5):
    p, q = np.array(pos[a]), np.array(pos[b])
    d = (q - p) / np.linalg.norm(q - p)
    ax.add_patch(FancyArrowPatch(p + 0.58 * d, q - 0.58 * d, arrowstyle="-|>", mutation_scale=13,
                                 lw=lw, color=color, ls=ls, connectionstyle=f"arc3,rad={rad}",
                                 zorder=2))


edge("x", "y", C["muted"], rad=0.22)
edge("x", "z", C["muted"], rad=0.22)
edge("y", "z", C["orange"], lw=2)
edge("z", "x", C["orange"], rad=0.22, lw=2)
edge("y", "x", C["red"], rad=0.22, ls=(0, (4, 3)))
ax.text(4.0, 1.05, "$y\\succeq_c z$（菜单 $\\{y,z\\}$）", ha="center", va="center",
        fontsize=10.5, color=C["orange"])
ax.text(6.55, 3.65, "$z\\succeq_c x$\n（菜单 $\\{x,z\\}$）", ha="center", va="center",
        fontsize=10.5, color=C["orange"], linespacing=1.4)
ax.text(1.0, 4.1, "缺：$y\\succeq_c x$？\n没有哪份菜单\n既有 $x$ 又选了 $y$", ha="center",
        va="center", fontsize=10.5, color=C["red"], linespacing=1.4)
ax.text(4.0, 0.25, "灰色：其他的 $\\succeq_c$；橙色链条 $y\\to z\\to x$ 接不上红色虚线", ha="center",
        va="center", fontsize=10, color=C["ink2"])

save(fig, "p12-chain", lecture="lecture1")
