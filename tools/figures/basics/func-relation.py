"""func-relation: a relation is a set of ordered pairs.

(a) the preference a ≻ b ∼ c on X = {a, b, c}, drawn as a 3 × 3 table of pairs (x, y);
    a tick marks x ⪰ y.  7 of the 9 pairs are in the relation.
(b) the friend relation among 小王, 小李, 小张: symmetric (a line has no direction),
    not transitive (小王-小李 and 小李-小张 but not 小王-小张).
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Circle, Rectangle  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.2, 4.0), gridspec_kw=dict(width_ratios=[1.1, 1.0]))
fig.subplots_adjust(wspace=0.1)

# ---- (a) table of pairs -------------------------------------------------------
ax = ax1
ax.set_xlim(-1.6, 3.6)
ax.set_ylim(-1.5, 4.2)
ax.set_aspect("equal")
ax.axis("off")
ITEMS = ["a", "b", "c"]
IN_RELATION = {("a", "a"), ("a", "b"), ("a", "c"), ("b", "b"), ("b", "c"), ("c", "b"), ("c", "c")}
for i, x in enumerate(ITEMS):          # row = first element x
    for j, y in enumerate(ITEMS):      # column = second element y
        inside = (x, y) in IN_RELATION
        ax.add_patch(Rectangle((j, 2 - i), 1, 1, fc=C["fill_teal"] if inside else "white",
                               ec=C["ink2"], lw=1))
        ax.text(j + 0.5, 2 - i + 0.5, "是" if inside else "否", ha="center", va="center", fontsize=12,
                color=C["teal"] if inside else C["red"])
    ax.text(-0.25, 2 - i + 0.5, f"$x={x}$", ha="right", va="center", fontsize=11.5)
for j, y in enumerate(ITEMS):
    ax.text(j + 0.5, 3.25, f"$y={y}$", ha="center", va="bottom", fontsize=11.5)
ax.text(1.0, 4.05, "（a）$x\\succeq y$ 吗？偏好 $a\\succ b\\sim c$", ha="center", va="center", fontsize=11.5)
ax.text(1.0, -0.55, "涂色的 7 格就是关系 $\\succeq$：", ha="center", va="center", fontsize=10.5, color=C["ink2"])
ax.text(1.0, -1.1, "$X\\times X$ 共 9 个有序对中的 7 个", ha="center", va="center", fontsize=10.5, color=C["ink2"])

# ---- (b) friend graph ---------------------------------------------------------
ax = ax2
ax.set_xlim(-0.5, 4.5)
ax.set_ylim(-1.5, 4.2)
ax.set_aspect("equal")
ax.axis("off")
PEOPLE = {"小王": (0.5, 0.7), "小李": (2.0, 3.0), "小张": (3.5, 0.7)}
for a, b in [("小王", "小李"), ("小李", "小张")]:
    (x0, y0), (x1, y1) = PEOPLE[a], PEOPLE[b]
    ax.plot([x0, x1], [y0, y1], color=C["navy"], lw=2, zorder=1)
x0, y0 = PEOPLE["小王"]
x1, y1 = PEOPLE["小张"]
ax.plot([x0, x1], [y0, y1], color=C["red"], lw=1, ls=(0, (4, 3)), zorder=1)
ax.text(2.0, 0.45, "不认识", ha="center", va="top", fontsize=10.5, color=C["red"])
for name, (x, y) in PEOPLE.items():
    ax.add_patch(Circle((x, y), 0.48, fc=C["fill_blue"], ec=C["navy"], lw=1.4, zorder=2))
    ax.text(x, y, name, ha="center", va="center", fontsize=11.5, zorder=3)
ax.text(2.0, 4.05, "（b）“是朋友”这个关系", ha="center", va="center", fontsize=11.5)
ax.text(2.0, -0.55, "对称：小王是小李的朋友，小李也是小王的", ha="center", va="center", fontsize=10.5,
        color=C["ink2"])
ax.text(2.0, -1.1, "不传递：王–李、李–张是朋友，王–张不是", ha="center", va="center", fontsize=10.5,
        color=C["ink2"])

save(fig, "func-relation", lecture="basics")
