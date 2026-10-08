"""cvx-concave: concave = the curve lies above every chord; convex function = below.

(a) f(x) = sqrt(x), chord from x = 1 to x = 9: at the midpoint 5 the curve is sqrt(5) ≈ 2.24,
    the chord is (1 + 3) / 2 = 2.  Curve above chord: concave.
(b) g(x) = x^2, chord from x = 1 to x = 3: at the midpoint 2 the curve is 4,
    the chord is (1 + 9) / 2 = 5.  Curve below chord: convex function.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.0, 4.0))
fig.subplots_adjust(wspace=0.3)


def chord_picture(ax, func, left, right, curve_color, mid_label_curve, mid_label_chord, label_spots):
    """Curve, chord between left and right, and the two values at the midpoint."""
    mid = (left + right) / 2
    ax.plot([left, right], [func(left), func(right)], color=C["orange"], lw=1.6, zorder=3)
    for x in (left, right):
        ax.plot([x], [func(x)], "o", ms=7, color=C["orange"], mec="white", mew=1.2, zorder=4)
    chord_mid = (func(left) + func(right)) / 2
    ax.plot([mid, mid], [0, max(func(mid), chord_mid)], color=C["muted"], lw=1, ls=DASH, zorder=1)
    ax.plot([mid], [func(mid)], "o", ms=7, color=curve_color, mec="white", mew=1.2, zorder=5)
    ax.plot([mid], [chord_mid], "s", ms=6, color=C["orange"], mec="white", mew=1, zorder=5)
    (cx, cy, cha), (hx, hy, hha) = label_spots
    ax.text(cx, cy, mid_label_curve, ha=cha, va="center", fontsize=10.5, color=curve_color)
    ax.text(hx, hy, mid_label_chord, ha=hha, va="center", fontsize=10.5, color=C["orange"])


# ---- (a) sqrt ------------------------------------------------------------------
ax = ax1
econ_axes(ax, (0, 10.3), (0, 3.6), "$x$", "$f(x)$", ticks=True)
xs = np.linspace(0, 10, 300)
ax.plot(xs, np.sqrt(xs), color=C["navy"], zorder=2)
chord_picture(ax, np.sqrt, 1, 9, C["navy"], "曲线：$\\sqrt5\\approx2.24$", "弦：$\\tfrac{1+3}{2}=2$",
              ((4.8, 2.6, "right"), (5.3, 1.7, "left")))
ax.set_xticks([1, 5, 9])
ax.set_yticks([1, 2, 3])
ax.text(8.2, 3.35, "$f(x)=\\sqrt{x}$", ha="center", va="center", fontsize=11, color=C["navy"])
ax.set_title("（a）凹函数：曲线在弦的上方", pad=14)

# ---- (b) square ----------------------------------------------------------------
ax = ax2
econ_axes(ax, (0, 3.6), (0, 10.5), "$x$", "$g(x)$", ticks=True)
xs = np.linspace(0, 3.3, 300)
ax.plot(xs, xs ** 2, color=C["red"], zorder=2)
chord_picture(ax, lambda x: x ** 2, 1, 3, C["red"], "曲线：$2^2=4$", "弦：$\\tfrac{1+9}{2}=5$",
              ((2.1, 3.2, "left"), (1.9, 6.0, "right")))
ax.set_xticks([1, 2, 3])
ax.set_yticks([1, 4, 5, 9])
ax.text(1.0, 8.5, "$g(x)=x^2$", ha="center", va="center", fontsize=11, color=C["red"])
ax.set_title("（b）凸函数：曲线在弦的下方", pad=14)

save(fig, "cvx-concave", lecture="basics")
