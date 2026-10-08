"""sets-implication: "if P then Q" as one region inside another, and "P iff Q" as one region.

(a) P = 考了 90 分以上, Q = 及格: every situation where P holds is inside Q.
    The small circle is the sufficient condition, the big circle the necessary one.
(b) When u represents ⪰, "x ≻ y" and "u(x) > u(y)" describe exactly the same pairs.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Circle, Rectangle  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8.8, 3.9))
fig.subplots_adjust(wspace=0.08)
for ax in (ax1, ax2):
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7.0)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.add_patch(Rectangle((0.3, 1.1), 9.4, 5.2, fc="none", ec=C["gray"], lw=1, ls=(0, (4, 3))))

# ---- (a) P => Q ------------------------------------------------------------
ax = ax1
ax.text(5.0, 6.7, "（a）$P\\Rightarrow Q$：$P$ 的圈装在 $Q$ 的圈里", ha="center", va="center", fontsize=11.5)
ax.text(0.5, 6.05, "所有学生", ha="left", va="center", fontsize=10, color=C["gray"])
ax.add_patch(Circle((4.6, 3.7), 2.42, fc=C["fill_blue"], ec=C["navy"], lw=1.6, zorder=1))
ax.add_patch(Circle((5.35, 3.2), 1.05, fc=C["fill_teal"], ec=C["teal"], lw=1.6, zorder=2))
ax.text(3.2, 5.2, "$Q$：及格", ha="center", va="center", fontsize=11, color=C["navy"])
ax.text(5.35, 4.62, "$P$：90 分以上", ha="center", va="center", fontsize=10.5, color=C["teal"])
for (x, y), label, col in [((5.35, 3.45), "95 分", C["teal"]), ((3.0, 3.15), "75 分", C["navy"]),
                           ((8.35, 2.2), "50 分", C["red"])]:
    ax.plot([x], [y], "o", ms=6, color=col, zorder=4)
    ax.text(x, y - 0.25, label, ha="center", va="top", fontsize=10, color=col)
ax.text(5.0, 0.6, "在小圈里，就一定在大圈里：$P$ 是 $Q$ 的充分条件", ha="center", va="center", fontsize=10.5,
        color=C["ink2"])
ax.text(5.0, 0.12, "不在大圈里，就不可能在小圈里：$Q$ 是 $P$ 的必要条件", ha="center", va="center",
        fontsize=10.5, color=C["ink2"])

# ---- (b) P <=> Q -----------------------------------------------------------
ax = ax2
ax.text(5.0, 6.7, "（b）$P\\iff Q$：两个圈完全重合", ha="center", va="center", fontsize=11.5)
ax.text(0.5, 6.05, "所有的选项对 $(x,y)$", ha="left", va="center", fontsize=10, color=C["gray"])
ax.add_patch(Circle((5.0, 3.7), 2.0, fc=C["fill_purple"], ec=C["navy"], lw=2.2, zorder=1))
ax.add_patch(Circle((5.0, 3.7), 2.0, fc="none", ec=C["red"], lw=1.6, ls=(0, (5, 4)), zorder=2))
ax.text(5.0, 4.15, "$P$：$x\\succ y$", ha="center", va="center", fontsize=11, color=C["navy"])
ax.text(5.0, 3.25, "$Q$：$u(x)>u(y)$", ha="center", va="center", fontsize=11, color=C["red"])
ax.text(5.0, 0.6, "$u$ 表示 $\\succeq$ 时，两句话挑出的是同一批 $(x,y)$", ha="center", va="center",
        fontsize=10.5, color=C["ink2"])
ax.text(5.0, 0.12, "证明时要两个方向都证：$P\\Rightarrow Q$ 且 $Q\\Rightarrow P$", ha="center",
        va="center", fontsize=10.5, color=C["ink2"])

save(fig, "sets-implication", lecture="basics")
