"""seq-balls: an ε-ball is "everything closer than ε".

(a) on the number line, B_0.5(3) is the open interval (2.5, 3.5).
(b) in the plane, B_1((2,2)) is an open disk.  (2.5, 2.5) is at distance ≈ 0.71 < 1, inside;
    (3, 2.8) is at distance ≈ 1.28 > 1, outside.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Circle  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.6, 3.9), gridspec_kw=dict(width_ratios=[1.15, 1.0]))
fig.subplots_adjust(wspace=0.15)

# ---- (a) interval ------------------------------------------------------------
ax = ax1
ax.set_xlim(0.6, 5.4)
ax.set_ylim(-1.6, 1.6)
ax.axis("off")
ax.annotate("", xy=(5.3, 0), xytext=(0.7, 0),
            arrowprops=dict(arrowstyle="-|>", lw=1.0, color=C["ink2"], mutation_scale=11, shrinkA=0, shrinkB=0))
for t in range(1, 6):
    ax.plot([t, t], [-0.07, 0.07], color=C["ink2"], lw=1)
    ax.text(t, -0.2, f"${t}$", ha="center", va="top", fontsize=10.5, color=C["ink2"])
ax.plot([2.5, 3.5], [0, 0], color=C["teal"], lw=4, solid_capstyle="butt", zorder=2)
for end in (2.5, 3.5):
    ax.plot([end], [0], "o", ms=8, mfc="white", mec=C["teal"], mew=1.6, zorder=3)
ax.plot([3], [0], "o", ms=6, color=C["navy"], zorder=4)
ax.annotate("", xy=(3.5, 0.45), xytext=(3.0, 0.45),
            arrowprops=dict(arrowstyle="<|-|>", lw=1, color=C["orange"], mutation_scale=9, shrinkA=0, shrinkB=0))
ax.text(3.25, 0.58, "$\\varepsilon=0.5$", ha="center", va="bottom", fontsize=10.5, color=C["orange"])
ax.text(3.0, -0.75, "$B_{0.5}(3)=(2.5,\\,3.5)$", ha="center", va="center", fontsize=11.5, color=C["teal"])
ax.text(3.0, -1.25, "空心圈：端点 2.5、3.5 不算在内", ha="center", va="center", fontsize=10.5, color=C["ink2"])
ax.text(3.0, 1.45, "（a）数轴上：一段开区间", ha="center", va="center", fontsize=11.5)

# ---- (b) disk ------------------------------------------------------------------
ax = ax2
econ_axes(ax, (0, 4.3), (0, 4.0), "$x_1$", "$x_2$", ticks=True)
ax.set_aspect("equal")
ax.add_patch(Circle((2, 2), 1, fc=C["fill_teal"], ec=C["teal"], lw=1.3, ls=DASH, zorder=1))
ax.plot([2], [2], "o", ms=6, color=C["navy"], zorder=4)
ax.text(1.88, 1.9, "$y=(2,2)$", ha="right", va="top", fontsize=10.5, color=C["navy"])
ax.plot([2, 2.5], [2, 2.5], color=C["teal"], lw=1.2, zorder=3)
ax.plot([2.5], [2.5], "o", ms=6.5, color=C["teal"], mec="white", mew=1, zorder=4)
ax.text(2.25, 2.62, "$\\approx0.71$", ha="right", va="bottom", fontsize=10, color=C["teal"])
ax.text(2.0, 3.12, "$(2.5,2.5)$ 在里面", ha="right", va="bottom", fontsize=10, color=C["teal"])
ax.plot([2, 3], [2, 2.8], color=C["red"], lw=1.2, ls=DASH, zorder=3)
ax.plot([3], [2.8], "o", ms=6.5, color=C["red"], mec="white", mew=1, zorder=4)
ax.text(3.1, 2.86, "$(3,2.8)$", ha="left", va="bottom", fontsize=10, color=C["red"])
ax.text(3.1, 2.48, "距离 $\\approx1.28$，在外面", ha="left", va="center", fontsize=10, color=C["red"])
ax.text(2.0, 0.55, "半径 $\\varepsilon=1$", ha="center", va="center", fontsize=10.5, color=C["ink2"])
ax.set_xticks([1, 2, 3, 4])
ax.set_yticks([1, 2, 3])
ax.set_title("（b）平面上：一个圆盘（不含边）", pad=14)

save(fig, "seq-balls", lecture="basics")
