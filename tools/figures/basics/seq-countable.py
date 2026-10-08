"""seq-countable: rationals can be listed, reals in [0, 1) cannot.

(a) Cantor's zigzag through the table p/q visits every positive fraction; skipping repeats
    (2/2, 2/4, ...) gives the list 1, 2, 1/2, 1/3, 3, 4, 3/2, 2/3, 1/4, 1/5, 5, ...
(b) Cantor's diagonal: whatever list of decimals you write, change the n-th digit of the n-th
    number (5 -> 4, anything else -> 5).  The new number 0.54555... differs from every row.
"""

import sys
from math import gcd

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Rectangle  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.4, 4.4), gridspec_kw=dict(width_ratios=[1.0, 1.15]))
fig.subplots_adjust(wspace=0.08)

# ---- (a) zigzag ----------------------------------------------------------------
ax = ax1
SIZE = 5
ax.set_xlim(-0.9, SIZE + 0.3)
ax.set_ylim(-1.3, SIZE + 0.9)
ax.set_aspect("equal")
ax.axis("off")


def cell_center(p, q):
    """Centre of the cell holding p/q (row p from the top, column q from the left)."""
    return q - 0.5, SIZE - p + 0.5


for p in range(1, SIZE + 1):
    for q in range(1, SIZE + 1):
        x, y = cell_center(p, q)
        repeat = gcd(p, q) > 1
        label = f"${p}$" if q == 1 else f"${p}/{q}$"
        ax.text(x, y, label, ha="center", va="center", fontsize=11,
                color=C["muted"] if repeat else C["ink"], zorder=3,
                bbox=dict(fc="white", ec="none", pad=1.2, alpha=0.9))
        if repeat:
            ax.plot([x - 0.28, x + 0.28], [y - 0.2, y + 0.2], color=C["muted"], lw=1, zorder=4)
    ax.text(-0.35, SIZE - p + 0.5, f"${p}$", ha="center", va="center", fontsize=10, color=C["ink2"])
for q in range(1, SIZE + 1):
    ax.text(q - 0.5, SIZE + 0.35, f"${q}$", ha="center", va="center", fontsize=10, color=C["ink2"])
ax.text(-0.35, SIZE + 0.35, "$p\\backslash q$", ha="center", va="center", fontsize=9.5, color=C["ink2"])

path = []
for s in range(2, SIZE + 2):
    diagonal = [(p, s - p) for p in range(1, s)]
    if s % 2 == 1:
        diagonal.reverse()
    path.extend(diagonal)
xs, ys = zip(*(cell_center(p, q) for p, q in path))
ax.plot(xs, ys, color=C["orange"], lw=1.6, alpha=0.75, zorder=2)
order = 0
for p, q in path:
    if gcd(p, q) == 1:
        order += 1
        x, y = cell_center(p, q)
        ax.text(x + 0.3, y + 0.27, f"{order}", ha="center", va="center", fontsize=7.5, color=C["orange"], zorder=5)
ax.text(SIZE / 2 - 0.3, -0.45, "按橙线走，跳过划掉的重复项：", ha="center", va="center", fontsize=10.5, color=C["ink2"])
ax.text(SIZE / 2 - 0.3, -1.0, "$1,\\ 2,\\ \\frac12,\\ \\frac13,\\ 3,\\ 4,\\ \\frac32,\\ \\frac23,\\ \\frac14,\\ \\frac15,\\ 5,\\ \\dots$",
        ha="center", va="center", fontsize=11, color=C["ink"])
ax.text(SIZE / 2 - 0.3, SIZE + 0.85, "（a）有理数可以排成一队", ha="center", va="center", fontsize=11.5)

# ---- (b) diagonal --------------------------------------------------------------
ax = ax2
ax.set_xlim(0, 10)
ax.set_ylim(-1.3, 6.2)
ax.axis("off")
ROWS = ["14159", "75182", "33833", "50030", "27180"]
X0, DX = 3.45, 0.62
for i, digits in enumerate(ROWS):
    y = 4.9 - 0.82 * i
    ax.text(1.0, y, f"第 {i + 1} 个", ha="left", va="center", fontsize=10.5, color=C["ink2"])
    ax.text(X0 - 0.36, y, "$0.$", ha="right", va="center", fontsize=12.5)
    for j, digit in enumerate(digits):
        x = X0 + DX * j
        if i == j:
            ax.add_patch(Rectangle((x - 0.26, y - 0.3), 0.52, 0.6, fc=C["fill_orange"], ec=C["orange"], lw=1.1))
        ax.text(x, y, f"${digit}$", ha="center", va="center", fontsize=12.5,
                color=C["orange"] if i == j else C["ink"])
    ax.text(X0 + DX * 5 + 0.05, y, "$\\cdots$", ha="left", va="center", fontsize=12, color=C["ink2"])
new_digits = ["4" if row[i] == "5" else "5" for i, row in enumerate(ROWS)]
y = 4.9 - 0.82 * 5 - 0.25
ax.plot([0.9, 7.9], [y + 0.45, y + 0.45], color=C["ink2"], lw=0.8)
ax.text(1.0, y, "新的数", ha="left", va="center", fontsize=10.5, color=C["purple"])
ax.text(X0 - 0.36, y, "$0.$", ha="right", va="center", fontsize=12.5, color=C["purple"])
for j, digit in enumerate(new_digits):
    ax.text(X0 + DX * j, y, f"${digit}$", ha="center", va="center", fontsize=12.5, color=C["purple"])
ax.text(X0 + DX * 5 + 0.05, y, "$\\cdots$", ha="left", va="center", fontsize=12, color=C["purple"])
ax.text(5.0, -0.85, "对角线上是 5 就改成 4，否则改成 5：新数和第 $n$ 个数第 $n$ 位不同",
        ha="center", va="center", fontsize=10, color=C["ink2"])
ax.text(5.0, 6.0, "（b）$[0,1)$ 里的实数排不成一队", ha="center", va="center", fontsize=11.5)

save(fig, "seq-countable", lecture="basics")
