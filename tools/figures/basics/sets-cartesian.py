"""sets-cartesian: {米饭, 面条} × {小份, 大份} as a 2 × 2 grid, and R × R as the plane.

Left: every cell is one ordered pair (主食, 份量) -- 2 × 2 = 4 ways to order.
Right: pairing a number on the horizontal line with one on the vertical line gives a point of R^2.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8.8, 3.7), gridspec_kw=dict(width_ratios=[1.25, 1.0]))
fig.subplots_adjust(wspace=0.12)

# ---- (a) the canteen grid --------------------------------------------------
ax = ax1
ax.set_xlim(0, 10)
ax.set_ylim(0, 6.6)
ax.axis("off")
ROWS = ["米饭", "面条"]
COLS = ["小份", "大份"]
X0, Y0, CW, CH = 2.6, 0.9, 3.3, 1.75  # left edge, bottom edge, cell width, cell height
for j, col in enumerate(COLS):
    cx = X0 + (j + 0.5) * CW
    ax.add_patch(FancyBboxPatch((cx - 1.0, Y0 + 2 * CH + 0.35), 2.0, 0.62, boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=C["fill_orange"], ec=C["orange"], lw=1.2))
    ax.text(cx, Y0 + 2 * CH + 0.66, col, ha="center", va="center", fontsize=11.5)
for i, row in enumerate(ROWS):
    cy = Y0 + (1.5 - i) * CH
    ax.add_patch(FancyBboxPatch((0.45, cy - 0.31), 1.75, 0.62, boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=C["fill_teal"], ec=C["teal"], lw=1.2))
    ax.text(1.32, cy, row, ha="center", va="center", fontsize=11.5)
    for j, col in enumerate(COLS):
        cx = X0 + (j + 0.5) * CW
        ax.add_patch(FancyBboxPatch((cx - CW / 2 + 0.12, cy - CH / 2 + 0.12), CW - 0.24, CH - 0.24,
                                    boxstyle="round,pad=0.02,rounding_size=0.15", fc=C["fill_blue"], ec=C["navy"], lw=1.2))
        ax.text(cx, cy, f"（{row}，{col}）", ha="center", va="center", fontsize=11.5)
ax.text(1.32, Y0 + 2 * CH + 0.66, "$X\\times Y$", ha="center", va="center", fontsize=11.5, color=C["ink2"])
ax.text(5.0, 0.35, "主食 $X$ 有 2 种，份量 $Y$ 有 2 种：$|X\\times Y|=2\\times2=4$", ha="center", va="center",
        fontsize=10.5, color=C["ink2"])
ax.text(5.0, 6.45, "（a）$\\{$米饭，面条$\\}\\times\\{$小份，大份$\\}$", ha="center", va="center", fontsize=11.5)

# ---- (b) R x R is the plane ------------------------------------------------
ax = ax2
ax.set_xlim(-0.9, 5.2)
ax.set_ylim(-1.15, 4.7)
ax.set_aspect("equal")
ax.axis("off")
arrow = dict(arrowstyle="-|>", lw=1.0, color=C["ink2"], mutation_scale=11, shrinkA=0, shrinkB=0)
ax.annotate("", xy=(4.9, 0), xytext=(-0.6, 0), arrowprops=arrow)
ax.annotate("", xy=(0, 4.1), xytext=(0, -0.6), arrowprops=arrow)
for t in range(1, 5):
    ax.plot([t, t], [-0.07, 0.07], color=C["ink2"], lw=1)
    ax.text(t, -0.18, f"${t}$", ha="center", va="top", fontsize=10, color=C["ink2"])
for t in range(1, 4):
    ax.plot([-0.07, 0.07], [t, t], color=C["ink2"], lw=1)
    ax.text(-0.17, t, f"${t}$", ha="right", va="center", fontsize=10, color=C["ink2"])
ax.text(4.95, 0.12, "第一个数", ha="right", va="bottom", fontsize=10.5, color=C["ink2"])
ax.text(0.12, 4.12, "第二个数", ha="left", va="center", fontsize=10.5, color=C["ink2"])
ax.plot([2, 2], [0, 3], color=C["ink2"], lw=1, ls=(0, (4, 3)))
ax.plot([0, 2], [3, 3], color=C["ink2"], lw=1, ls=(0, (4, 3)))
ax.plot([2], [3], "o", ms=8, color=C["navy"], mec="white", mew=1.3, zorder=4)
ax.text(2.18, 3.12, "$(2,3)$", ha="left", va="bottom", fontsize=11.5, color=C["navy"])
ax.plot([3], [1], "o", ms=8, color=C["teal"], mec="white", mew=1.3, zorder=4)
ax.text(3.18, 1.12, "$(3,1)$", ha="left", va="bottom", fontsize=11.5, color=C["teal"])
ax.text(2.15, -0.85, "$\\mathbb{R}\\times\\mathbb{R}=\\mathbb{R}^2$：每个有序数对是平面上一个点", ha="center", va="center",
        fontsize=10.5, color=C["ink2"])
ax.text(2.15, 4.55, "（b）两条数轴“相乘”得到平面", ha="center", va="center", fontsize=11.5)

save(fig, "sets-cartesian", lecture="basics")
