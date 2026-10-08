"""p11-revealed: reading the revealed preference relation off observed choices.

(a) the observed choices on the two- and three-element menus (chosen item highlighted);
(b) an arrow a -> b whenever some menu contains b and a was chosen from it (a ⪰_c b);
    the arrows give the ranking x ≻_c y ≻_c z.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import Circle, FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, axes = plt.subplots(1, 2, figsize=(9.0, 3.5), gridspec_kw=dict(width_ratios=[1.1, 1]))
fig.subplots_adjust(wspace=0.08)

# (a) Menu cards.
ax = axes[0]
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis("off")
MENUS = [(["x", "y"], "x"), (["x", "z"], "x"), (["y", "z"], "y"), (["x", "y", "z"], "x")]
for i, (items, chosen) in enumerate(MENUS):
    col, row = i % 2, i // 2
    cx, cy = 2.6 + col * 4.8, 4.0 - row * 2.55
    ax.add_patch(FancyBboxPatch((cx - 2.0, cy - 0.85), 4.0, 1.7,
                                boxstyle="round,pad=0.02,rounding_size=0.15", fc="white",
                                ec=C["gray"], lw=1.2, zorder=2))
    ax.text(cx - 1.85, cy + 0.6, "菜单 $\\{%s\\}$" % ",".join(items), ha="left", va="center",
            fontsize=9.5, color=C["ink2"])
    xs = np.linspace(cx - 0.9, cx + 0.9, len(items)) if len(items) > 1 else [cx]
    for x, it in zip(xs, items):
        hit = it == chosen
        ax.add_patch(Circle((x, cy - 0.12), 0.38, fc=C["fill_teal"] if hit else C["fill_gray"],
                            ec=C["teal"] if hit else C["gray"], lw=1.8 if hit else 1, zorder=3))
        ax.text(x, cy - 0.12, "$%s$" % it, ha="center", va="center", fontsize=12, zorder=4,
                color=C["teal"] if hit else C["ink"])
ax.text(5.0, 0.2, "（a）观察到的选择：绿圈是被选中的", ha="center", va="center", fontsize=11)

# (b) Arrow diagram.
ax = axes[1]
ax.set_xlim(0, 8)
ax.set_ylim(0, 6)
ax.axis("off")
pos = {"x": (4.0, 4.9), "y": (1.5, 1.7), "z": (6.5, 1.7)}
for name, (x, y) in pos.items():
    ax.add_patch(Circle((x, y), 0.5, fc=C["fill_blue"], ec=C["navy"], lw=1.4, zorder=3))
    ax.text(x, y, "$%s$" % name, ha="center", va="center", fontsize=13, zorder=4)


def edge(a, b, label, offset):
    p, q = np.array(pos[a]), np.array(pos[b])
    d = (q - p) / np.linalg.norm(q - p)
    ax.add_patch(FancyArrowPatch(p + 0.58 * d, q - 0.58 * d, arrowstyle="-|>", mutation_scale=13,
                                 lw=1.5, color=C["navy"], zorder=2))
    mid = (p + q) / 2 + offset
    ax.text(*mid, label, ha="center", va="center", fontsize=10, color=C["navy"])


edge("x", "y", "证据 $\\{x,y\\}$", np.array([-1.05, 0.25]))
edge("x", "z", "证据 $\\{x,z\\}$", np.array([1.05, 0.25]))
edge("y", "z", "证据 $\\{y,z\\}$", np.array([0.0, -0.45]))
ax.text(4.0, 0.2, "（b）箭头 $a\\to b$ 表示 $a\\succeq_c b$：读出 $x\\succ_c y\\succ_c z$",
        ha="center", va="center", fontsize=11)

save(fig, "p11-revealed", lecture="lecture1")
