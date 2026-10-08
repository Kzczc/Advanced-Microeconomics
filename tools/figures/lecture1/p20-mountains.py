"""p20-mountains: quasi-concavity read off a contour map.

f(x) is the altitude at location x. U_alpha = {altitude >= alpha} is shaded.
(a) one peak: U_alpha is one convex blob, the straight path between two of its points stays inside;
(b) two peaks: U_alpha splits into two islands, the straight path between the peaks dips into
    the valley below alpha (red part), so f is not quasi-concave.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

XMAX, YMAX = 6.0, 5.0
ALPHA = 0.4
gx, gy = np.meshgrid(np.linspace(0, XMAX, 400), np.linspace(0, YMAX, 340))


def one_peak(x1, x2):
    return np.exp(-((x1 - 3.0) ** 2 / 3.0 + (x2 - 2.5) ** 2 / 2.0))


def two_peaks(x1, x2):
    return (np.exp(-((x1 - 1.7) ** 2 + (x2 - 3.3) ** 2))
            + np.exp(-((x1 - 4.3) ** 2 + (x2 - 1.7) ** 2)))


def label_below(ax, text):
    ax.text(0.5, -0.08, text, transform=ax.transAxes, ha="center", va="top", fontsize=10.5,
            color=C["ink2"])


def title_above(ax, text):
    ax.text(0.5, 1.06, text, transform=ax.transAxes, ha="center", va="bottom", fontsize=11.5)


def contour_map(ax, f):
    econ_axes(ax, (0, XMAX), (0, YMAX), xlabel="$x_1$", ylabel="$x_2$")
    ax.set_aspect("equal")
    z = f(gx, gy)
    ax.contourf(gx, gy, z, levels=[ALPHA, 10], colors=[C["fill_blue"]], zorder=0)
    ax.contour(gx, gy, z, levels=[0.15, 0.6, 0.8], colors=[C["muted"]], linewidths=0.8,
               zorder=1)
    ax.contour(gx, gy, z, levels=[ALPHA], colors=[C["navy"]], linewidths=2, zorder=2)


def path(ax, f, p, q):
    """Draw the straight path p -> q; parts below ALPHA in red. Return the lowest point."""
    ts = np.linspace(0, 1, 400)
    pts = np.outer(1 - ts, p) + np.outer(ts, q)
    vals = f(pts[:, 0], pts[:, 1])
    inside = vals >= ALPHA
    start = 0
    for i in range(1, len(ts) + 1):
        if i == len(ts) or inside[i] != inside[start]:
            seg = pts[start:i + 1]
            ax.plot(seg[:, 0], seg[:, 1], color=C["teal"] if inside[start] else C["red"],
                    lw=2.4 if inside[start] else 3, solid_capstyle="butt", zorder=4)
            start = i
    for pt in (p, q):
        ax.plot(*pt, "o", ms=6, color=C["ink"], zorder=5)
    k = int(np.argmin(vals))
    return pts[k], vals[k]


fig, axes = plt.subplots(1, 2, figsize=(8.2, 3.9))
fig.subplots_adjust(wspace=0.22)

# (a) One peak.
ax = axes[0]
contour_map(ax, one_peak)
p, q = np.array([1.9, 2.1]), np.array([4.1, 3.3])
path(ax, one_peak, p, q)
ax.plot(3.0, 2.5, marker="^", ms=8, color=C["navy"], zorder=5)
ax.annotate("山顶", (3.0, 2.5), xytext=(0, -9), textcoords="offset points", ha="center",
            va="top", fontsize=10, color=C["navy"])
ax.annotate("$x$", p, xytext=(-5, -3), textcoords="offset points", ha="right", va="top")
ax.annotate("$y$", q, xytext=(5, 3), textcoords="offset points", ha="left", va="bottom")
ax.text(5.9, 4.55, "阴影 $U_\\alpha$：海拔 $\\ge\\alpha$", ha="right", va="center", fontsize=10,
        color=C["navy"])
ax.text(0.15, 0.3, "细线：其他高度的等高线", ha="left", va="bottom", fontsize=9.5,
        color=C["ink2"])
title_above(ax, "（a）一座山：拟凹")
label_below(ax, "$U_\\alpha$ 连成一块凸的区域：直线不会走出去")

# (b) Two peaks.
ax = axes[1]
contour_map(ax, two_peaks)
p, q = np.array([1.7, 3.3]), np.array([4.3, 1.7])
low, low_val = path(ax, two_peaks, p, q)
ax.plot(*low, "o", ms=6, color=C["red"], zorder=6)
ax.annotate("山谷：海拔\n只有 %.2f" % low_val, low, xytext=(3.5, 3.75), textcoords="data",
            ha="left", va="bottom", fontsize=10, color=C["red"], linespacing=1.35,
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["red"], shrinkA=1, shrinkB=4,
                            relpos=(0.0, 0.0)))
ax.annotate("$x$", p, xytext=(-5, 4), textcoords="offset points", ha="right", va="bottom")
ax.annotate("$y$", q, xytext=(5, -4), textcoords="offset points", ha="left", va="top")
title_above(ax, "（b）两座山：不拟凹")
label_below(ax, "$x$、$y$ 是两个山顶，直线穿过山谷")

save(fig, "p20-mountains", lecture="lecture1")
