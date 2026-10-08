"""p19-monotone: what monotonicity alone says about bundles compared with y = (3, 2).

North-east of y (every good at least as much): x >= y, so x ⪰ y.
South-west of y (every good at most as much): y >= x, so y ⪰ x.
The other two quadrants (more of one good, less of the other): monotonicity is silent.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

XMAX, YMAX = 6.4, 5.0
Y0 = (3.0, 2.0)

fig, ax = plt.subplots(figsize=(5.4, 4.0))
econ_axes(ax, (0, XMAX), (0, YMAX), xlabel="苹果 $x_1$", ylabel="香蕉 $x_2$")

quadrants = [
    ((Y0[0], XMAX), (Y0[1], YMAX), C["fill_teal"]),
    ((0, Y0[0]), (0, Y0[1]), C["fill_red"]),
    ((0, Y0[0]), (Y0[1], YMAX), C["fill_gray"]),
    ((Y0[0], XMAX), (0, Y0[1]), C["fill_gray"]),
]
for (x0, x1), (y0, y1), color in quadrants:
    ax.fill([x0, x1, x1, x0], [y0, y0, y1, y1], color=color, lw=0, zorder=0)
ax.plot([Y0[0], Y0[0]], [0, YMAX], color=C["ink2"], lw=1, ls=(0, (4, 3)), zorder=1)
ax.plot([0, XMAX], [Y0[1], Y0[1]], color=C["ink2"], lw=1, ls=(0, (4, 3)), zorder=1)

ax.text(4.7, 4.35, "每样都不少\n单调性保证 $x\\succeq y$", ha="center", va="center",
        fontsize=10.5, color=C["teal"], linespacing=1.5)
ax.text(1.5, 1.0, "每样都不多\n单调性保证 $y\\succeq x$", ha="center", va="center",
        fontsize=10.5, color=C["red"], linespacing=1.5)
ax.text(1.5, 3.55, "苹果少、香蕉多\n单调性说不准", ha="center", va="center", fontsize=10.5,
        color=C["ink2"], linespacing=1.5)
ax.text(4.7, 1.0, "苹果多、香蕉少\n单调性说不准", ha="center", va="center", fontsize=10.5,
        color=C["ink2"], linespacing=1.5)

ax.plot(*Y0, "o", ms=7, color=C["navy"], mfc="white", mew=1.8, zorder=4)
ax.annotate("$y=(3,2)$", Y0, xytext=(-6, 6), textcoords="offset points", ha="right",
            va="bottom", fontsize=10.5, color=C["navy"])
x_pt = (5.0, 3.0)
ax.plot(*x_pt, "o", ms=6, color=C["teal"], zorder=4)
ax.annotate("$x=(5,3)$", x_pt, xytext=(7, -2), textcoords="offset points", ha="left",
            va="top", fontsize=10.5, color=C["teal"])

save(fig, "p19-monotone", lecture="lecture1")
