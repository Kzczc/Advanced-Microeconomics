"""cvx-qc: quasi-concave = every upper contour set {x : f(x) >= α} is an interval (convex).

All three panels cut at α = 0.5 and mark U_0.5 as a thick bar on the x-axis.
(a) f(x) = sqrt(x / 10): U = [2.5, 10] -- one interval, quasi-concave.
(b) bell f(x) = exp(-(x - 5)^2 / 4): U ≈ [3.33, 6.67] -- one interval, quasi-concave
    (even though the bell is not concave).
(c) two bumps exp(-(x - 2.5)^2) + exp(-(x - 7.5)^2): U ≈ [1.67, 3.33] ∪ [6.67, 8.33] -- two pieces,
    not quasi-concave.  f(5) ≈ 0.0039 is below min{f(2.5), f(7.5)} ≈ 1.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
ALPHA = 0.5
fig, axes = plt.subplots(1, 3, figsize=(10.6, 3.6))
fig.subplots_adjust(wspace=0.22)
xs = np.linspace(0, 10, 800)

PANELS = [
    ("（a）递增函数", lambda x: np.sqrt(x / 10), C["navy"], [(2.5, 10)], "$U_{0.5}=[2.5,\\,10]$：一段", C["teal"]),
    ("（b）单峰的钟形", lambda x: np.exp(-(x - 5) ** 2 / 4), C["navy"], [(3.33, 6.67)],
     "$U_{0.5}\\approx[3.33,\\,6.67]$：一段", C["teal"]),
    ("（c）双峰", lambda x: np.exp(-(x - 2.5) ** 2) + np.exp(-(x - 7.5) ** 2), C["red"],
     [(1.67, 3.33), (6.67, 8.33)], "$U_{0.5}$ 断成两段", C["red"]),
]

for ax, (title, func, color, pieces, verdict, verdict_color) in zip(axes, PANELS):
    econ_axes(ax, (0, 10.6), (0, 1.25), "$x$", None, ticks=True)
    ax.plot(xs, func(xs), color=color, zorder=2)
    ax.axhline(ALPHA, xmax=10.3 / 10.6, color=C["orange"], lw=1, ls=DASH, zorder=1)
    for left, right in pieces:
        ax.plot([left, right], [0, 0], color=verdict_color, lw=6, solid_capstyle="butt", zorder=3, clip_on=False)
        for x in (left, right):
            ax.plot([x, x], [0, ALPHA], color=C["muted"], lw=0.8, ls=DASH, zorder=1)
    ax.set_xticks([0, 5, 10])
    ax.set_yticks([ALPHA, 1])
    ax.set_yticklabels(["$\\alpha=0.5$", "$1$"])
    ax.set_title(title, pad=10)
    ax.text(5.3, -0.27, verdict, ha="center", va="center", fontsize=10.5, color=verdict_color)

ax = axes[2]
ax.plot([2.5, 7.5], [1.0, 1.0], color=C["purple"], lw=1, ls=DASH, zorder=1)
ax.plot([5], [0.0039], "o", ms=6, color=C["red"], mec="white", mew=1, zorder=5)
ax.text(5, 0.66, "$f(5)\\approx0.004$", ha="center", va="bottom", fontsize=9.5, color=C["red"])
ax.annotate("", xy=(5, 0.05), xytext=(5, 0.63),
            arrowprops=dict(arrowstyle="-|>", lw=0.9, color=C["red"], mutation_scale=9, shrinkA=0, shrinkB=0))
ax.text(5, 1.06, "两端都约为 1", ha="center", va="bottom", fontsize=10, color=C["purple"])

save(fig, "cvx-qc", lecture="basics")
