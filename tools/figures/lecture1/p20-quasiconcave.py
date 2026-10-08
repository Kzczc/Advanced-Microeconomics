"""p20-quasiconcave: upper contour sets of a quasi-concave and a non-quasi-concave function.

(a) f = sqrt(x1) + sqrt(x2): U_2 = {f >= 2} is convex, the chord stays inside.
(b) f = x1^2 + x2^2:        U_4 = {f >= 4} is the outside of a quarter circle, not convex;
                              the part of the chord that leaves U_4 is drawn in red.
(c) one-variable bell curve f = exp(-(x-5)^2/4): every U_alpha is an interval (quasi-concave),
    but a chord lies above the graph (not concave).
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

fig, axes = plt.subplots(1, 3, figsize=(9.0, 3.5))
fig.subplots_adjust(wspace=0.34)
LIM = 3.2
POINT = dict(ms=5.5, color=C["ink"], zorder=5)


def label_below(ax, text):
    ax.text(0.5, -0.1, text, transform=ax.transAxes, ha="center", va="top", fontsize=10.5,
            color=C["ink2"])


def title_above(ax, text):
    ax.text(0.5, 1.07, text, transform=ax.transAxes, ha="center", va="bottom", fontsize=11.5)


# (a) sqrt(x1) + sqrt(x2) >= 2  ->  boundary x2 = (2 - sqrt(x1))^2 for x1 in [0, 4].
ax = axes[0]
econ_axes(ax, (0, LIM), (0, LIM), xlabel="$x_1$", ylabel="$x_2$")
s = np.linspace(0, LIM, 500)
boundary = np.where(s <= 4, (2 - np.sqrt(s)) ** 2, 0)
ax.fill_between(s, np.minimum(boundary, LIM), LIM, color=C["fill_blue"], lw=0, zorder=0)
visible = boundary <= LIM
ax.plot(s[visible], boundary[visible], color=C["navy"], lw=2, zorder=2)
p, q = np.array([0.25, 2.25]), np.array([2.25, 0.25])
mid = (p + q) / 2
ax.plot([p[0], q[0]], [p[1], q[1]], color=C["teal"], lw=1.6, zorder=3)
ax.plot(*p, "o", **POINT)
ax.plot(*q, "o", **POINT)
ax.plot(*mid, "o", ms=6, color=C["teal"], zorder=5)
ax.annotate("$x$", p, xytext=(6, 2), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$y$", q, xytext=(2, 6), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$f=%.2f\\ge 2$" % np.sqrt(mid).sum(), mid, xytext=(10, 4), textcoords="offset points",
            ha="left",
            va="bottom", color=C["teal"], fontsize=10)
ax.text(2.35, 2.6, "$U_2$", color=C["navy"], ha="center")
title_above(ax, "（a）$f=\\sqrt{x_1}+\\sqrt{x_2}$")
label_below(ax, "$U_2$ 是凸集：线段整段留在里面")

# (b) x1^2 + x2^2 >= 4  ->  outside of the quarter circle of radius 2.
ax = axes[1]
econ_axes(ax, (0, LIM), (0, LIM), xlabel="$x_1$", ylabel="$x_2$")
theta = np.linspace(0, np.pi / 2, 300)
cx, cy = 2 * np.cos(theta), 2 * np.sin(theta)
ax.fill_between(s, np.where(s < 2, np.sqrt(np.clip(4 - s**2, 0, None)), 0), LIM,
                color=C["fill_blue"], lw=0, zorder=0)
ax.plot(cx, cy, color=C["navy"], lw=2, zorder=2)
p = np.array([0.3, 2.3])
q = np.array([2.3, 0.3])
mid = (p + q) / 2
# Split the chord into the parts inside / outside U_4.
ts = np.linspace(0, 1, 400)
chord = p[None, :] * (1 - ts[:, None]) + q[None, :] * ts[:, None]
outside = (chord**2).sum(axis=1) < 4
ax.plot(chord[~outside & (ts < 0.5), 0], chord[~outside & (ts < 0.5), 1], color=C["teal"],
        lw=1.6, zorder=3)
ax.plot(chord[~outside & (ts > 0.5), 0], chord[~outside & (ts > 0.5), 1], color=C["teal"],
        lw=1.6, zorder=3)
ax.plot(chord[outside, 0], chord[outside, 1], color=C["red"], lw=1.6, zorder=3)
ax.plot(*p, "o", **POINT)
ax.plot(*q, "o", **POINT)
ax.plot(*mid, "o", ms=6, color=C["red"], zorder=5)
ax.annotate("$x$", p, xytext=(6, 2), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$y$", q, xytext=(2, 6), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$f=%.2f<4$" % (mid**2).sum(), mid, xytext=(-8, -8), textcoords="offset points",
            ha="right",
            va="top", color=C["red"], fontsize=10)
ax.text(2.55, 2.6, "$U_4$", color=C["navy"], ha="center")
title_above(ax, "（b）$f=x_1^2+x_2^2$")
label_below(ax, "$U_4$ 不是凸集：线段中间跑出去")

# (c) bell curve on [0, 10].
ax = axes[2]
econ_axes(ax, (0, 10.4), (0, 1.22), xlabel="$x$", ylabel="$f(x)$")
xs = np.linspace(0, 10, 500)
bell = np.exp(-((xs - 5) ** 2) / 4)
alpha = 0.5
half = np.sqrt(-4 * np.log(alpha))
ax.plot(xs, bell, color=C["navy"], lw=2, zorder=2)
ax.plot([0, 10], [alpha, alpha], color=C["ink2"], lw=1, ls=(0, (4, 3)), zorder=1)
ax.text(10.2, alpha, "$\\alpha$", ha="left", va="center")
ax.plot([5 - half, 5 + half], [0.012, 0.012], color=C["teal"], lw=5, solid_capstyle="butt",
        zorder=4)
for edge in (5 - half, 5 + half):
    ax.plot([edge, edge], [0, alpha], color=C["teal"], lw=1, ls=(0, (2, 2)), zorder=1)
ax.text(5, 0.07, "$U_\\alpha$", ha="center", va="bottom", color=C["teal"], fontsize=10.5)
# A chord on the left tail lies above the graph: concavity fails.
a, b = 0.8, 3.6
fa, fb = np.exp(-((a - 5) ** 2) / 4), np.exp(-((b - 5) ** 2) / 4)
ax.plot([a, b], [fa, fb], color=C["red"], lw=1.6, zorder=3)
ax.plot([a, b], [fa, fb], "o", ms=4.5, color=C["red"], zorder=5)
ax.annotate("弦", ((a + b) / 2, (fa + fb) / 2), xytext=(-9, 3), textcoords="offset points",
            ha="right", va="center", color=C["red"], fontsize=10.5)
title_above(ax, "（c）钟形 $f(x)=e^{-(x-5)^2/4}$")
label_below(ax, "拟凹（$U_\\alpha$ 都是区间）\n但不凹：红色的弦在曲线上方")

save(fig, "p20-quasiconcave", lecture="lecture1")
