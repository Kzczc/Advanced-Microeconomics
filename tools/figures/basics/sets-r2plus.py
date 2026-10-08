"""sets-r2plus: the non-negative reals R_+ on a number line and the quadrant R^2_+.

Left: R_+ = [0, ∞) is the half-line starting at 0 (0 included, solid dot).
Right: R^2_+ is the first quadrant *including both axes*; four test bundles show
what is in and what is out (a bundle is (cups of milk tea, pieces of bread)).
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

ARROW = dict(arrowstyle="-|>", lw=1.0, color=C["ink2"], mutation_scale=11, shrinkA=0, shrinkB=0)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8.8, 3.9), gridspec_kw=dict(width_ratios=[1.0, 1.05]))
fig.subplots_adjust(wspace=0.18)

# ---- (a) number line -------------------------------------------------------
ax = ax1
ax.set_xlim(-3.4, 4.6)
ax.set_ylim(-2.2, 2.2)
ax.axis("off")
ax.annotate("", xy=(4.4, 0), xytext=(-3.3, 0), arrowprops=ARROW)
ax.text(4.45, -0.12, "$\\mathbb{R}$", ha="left", va="top", fontsize=11.5)
for t in range(-3, 5):
    ax.plot([t, t], [-0.08, 0.08], color=C["ink2"], lw=1)
    ax.text(t, -0.25, f"${t}$", ha="center", va="top", fontsize=10, color=C["ink2"])
ax.plot([0, 4.15], [0, 0], color=C["navy"], lw=4, solid_capstyle="butt", zorder=3)
ax.plot([0], [0], "o", ms=8, color=C["navy"], zorder=4)
ax.text(2.1, 0.45, "$\\mathbb{R}_+=[0,\\infty)$", ha="center", va="bottom", fontsize=11.5, color=C["navy"])
ax.annotate("0 也算在里面", xy=(0, 0.1), xytext=(-1.2, 1.25), ha="center", va="bottom", fontsize=10.5,
            color=C["navy"], arrowprops=dict(arrowstyle="-", lw=0.8, color=C["navy"], shrinkA=2, shrinkB=5))
ax.plot([-1.5], [0], "o", ms=7, color=C["red"], zorder=4)
ax.annotate("$-1.5\\notin\\mathbb{R}_+$", xy=(-1.5, -0.1), xytext=(-1.9, -1.35), ha="center", va="top",
            fontsize=10.5, color=C["red"],
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["red"], shrinkA=2, shrinkB=5))
ax.text(0.5, 1.02, "（a）数轴上：$\\mathbb{R}_+$ 是从 0 往右的半条线", transform=ax.transAxes,
        ha="center", va="bottom", fontsize=11.5)

# ---- (b) the quadrant ------------------------------------------------------
ax = ax2
ax.set_xlim(-2.3, 5.6)
ax.set_ylim(-1.9, 5.75)
ax.set_aspect("equal")
ax.axis("off")
ax.fill_between([0, 5.1], 0, 4.9, color=C["fill_blue"], lw=0, zorder=0)
ax.annotate("", xy=(5.4, 0), xytext=(-2.2, 0), arrowprops=ARROW)
ax.annotate("", xy=(0, 5.15), xytext=(0, -1.8), arrowprops=ARROW)
ax.plot([0, 5.1], [0, 0], color=C["navy"], lw=3, solid_capstyle="butt", zorder=2)
ax.plot([0, 0], [0, 4.9], color=C["navy"], lw=3, solid_capstyle="butt", zorder=2)
ax.text(5.45, -0.2, "$x_1$（奶茶，杯）", ha="right", va="top", fontsize=10.5)
ax.text(0.15, 5.2, "$x_2$（面包，个）", ha="left", va="center", fontsize=10.5)
ax.text(0.12, -0.15, "$0$", ha="left", va="top", fontsize=10, color=C["ink2"])
ax.text(4.15, 1.35, "$\\mathbb{R}^2_+$", ha="center", va="center", fontsize=13, color=C["navy"])

points = [
    ((2, 3), C["navy"], "$(2,3)\\in\\mathbb{R}^2_+$", (8, 6), "left", "bottom"),
    ((0, 4), C["navy"], "$(0,4)\\in\\mathbb{R}^2_+$：在轴上也算", (8, -2), "left", "center"),
    ((-1.3, 2), C["red"], "$(-1.3,2)$\n$\\notin\\mathbb{R}^2_+$", (0, 9), "center", "bottom"),
    ((3, -1), C["red"], "$(3,-1)\\notin\\mathbb{R}^2_+$", (9, 0), "left", "center"),
]
for (x, y), col, text, off, ha, va in points:
    ax.plot([x], [y], "o", ms=7, color=col, mec="white", mew=1.2, zorder=4)
    ax.annotate(text, (x, y), xytext=off, textcoords="offset points", ha=ha, va=va, fontsize=10.5,
                color=col, linespacing=1.3)
ax.text(0.5, 1.02, "（b）平面上：$\\mathbb{R}^2_+$ 是第一象限（含两条坐标轴）", transform=ax.transAxes,
        ha="center", va="bottom", fontsize=11.5)

save(fig, "sets-r2plus", lecture="basics")
