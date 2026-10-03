"""p19-convexity: three panels comparing non-convex / convex / strictly convex preferences.

Each panel draws the indifference curve through y, shades the upper contour set
US(y) = {x : x ⪰ y}, puts x and x' on the same curve, and marks the mixture
t x + (1 - t) x' (t = 1/2). Redrawn after Figures 1-3 of the Levin-Milgrom reading.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

XMAX, YMAX = 6.0, 6.0
GRID = np.linspace(0.05, XMAX, 600)


def nonconvex_curve(s):
    """Decreasing curve that bulges outward (concave) in the middle: US(y) is not convex."""
    return 3.0 - 0.22 * s - 1.45 * np.tanh(1.5 * (s - 3.6)) + 0.45 / s


def linear_curve(s):
    """Straight indifference line: convex but not strictly convex."""
    return 5.4 - s


def hyperbola_curve(s):
    """Standard bowed-in indifference curve: strictly convex."""
    return 5.0 / s


PANELS = [
    dict(curve=nonconvex_curve, x=1.55, xp=4.25, y=3.0, verdict="混合点跑到 $US(y)$ 外面",
         title="（a）非凸", inside=False),
    dict(curve=linear_curve, x=1.9, xp=3.9, y=0.9, verdict="混合点仍在边界上，$\\sim y$",
         title="（b）凸，但不严格凸", inside=None),
    dict(curve=hyperbola_curve, x=1.1, xp=4.0, y=2.1, verdict="混合点在内部，$\\succ y$",
         title="（c）严格凸", inside=True),
]


def draw_panel(ax, spec):
    curve = spec["curve"]
    econ_axes(ax, (0, XMAX), (0, YMAX), xlabel="$x_1$", ylabel="$x_2$")
    values = np.clip(curve(GRID), 0, YMAX + 5)
    # Upper contour set: everything on or above the indifference curve.
    ax.fill_between(GRID, np.minimum(values, YMAX), YMAX, color=C["fill_blue"], lw=0, zorder=0)
    visible = values <= YMAX
    ax.plot(GRID[visible], values[visible], color=C["navy"], lw=2, zorder=2)

    x = np.array([spec["x"], curve(spec["x"])])
    xp = np.array([spec["xp"], curve(spec["xp"])])
    y = np.array([spec["y"], curve(spec["y"])])
    mix = 0.5 * x + 0.5 * xp

    ax.plot([x[0], xp[0]], [x[1], xp[1]], color=C["ink2"], lw=1, ls=(0, (4, 3)), zorder=3)
    mix_color = {False: C["red"], None: C["orange"], True: C["teal"]}[spec["inside"]]
    ax.plot(*x, "o", ms=5.5, color=C["ink"], zorder=4)
    ax.plot(*xp, "o", ms=5.5, color=C["ink"], zorder=4)
    ax.plot(*y, "o", ms=5.5, color=C["navy"], mfc="white", mew=1.6, zorder=4)
    ax.plot(*mix, "o", ms=6.5, color=mix_color, zorder=5)
    return x, xp, y, mix, mix_color


fig, axes = plt.subplots(1, 3, figsize=(9.0, 3.45))
fig.subplots_adjust(wspace=0.32)

# Panel (a): non-convex.
ax = axes[0]
x, xp, y, mix, col = draw_panel(ax, PANELS[0])
ax.annotate("$x$", x, xytext=(-2, 7), textcoords="offset points", ha="right", va="bottom")
ax.annotate("$x'$", xp, xytext=(6, 2), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$y$", y, xytext=(6, 4), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$\\tfrac12x+\\tfrac12x'$", mix, xytext=(-30, -34), textcoords="offset points",
            ha="center", va="top", color=col,
            arrowprops=dict(arrowstyle="-", lw=0.8, color=col, shrinkA=1, shrinkB=4))
ax.text(4.6, 5.1, "$US(y)$", ha="center", color=C["navy"])

# Panel (b): straight line.
ax = axes[1]
x, xp, y, mix, col = draw_panel(ax, PANELS[1])
ax.annotate("$y$", y, xytext=(7, 2), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$x$", x, xytext=(7, 2), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$x'$", xp, xytext=(7, 2), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$\\tfrac12x+\\tfrac12x'$", mix, xytext=(-34, -26), textcoords="offset points",
            ha="center", va="top", color=col,
            arrowprops=dict(arrowstyle="-", lw=0.8, color=col, shrinkA=1, shrinkB=4))
ax.text(4.5, 4.6, "$US(y)$", ha="center", color=C["navy"])

# Panel (c): strictly convex.
ax = axes[2]
x, xp, y, mix, col = draw_panel(ax, PANELS[2])
ax.annotate("$x$", x, xytext=(7, 2), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$x'$", xp, xytext=(4, 6), textcoords="offset points", ha="left", va="bottom")
ax.annotate("$y$", y, xytext=(-6, -6), textcoords="offset points", ha="right", va="top")
ax.annotate("$\\tfrac12x+\\tfrac12x'$", mix, xytext=(30, 24), textcoords="offset points",
            ha="center", va="bottom", color=col,
            arrowprops=dict(arrowstyle="-", lw=0.8, color=col, shrinkA=1, shrinkB=4))
ax.text(4.6, 5.0, "$US(y)$", ha="center", color=C["navy"])

for ax, spec in zip(axes, PANELS):
    ax.text(0.5, 1.07, spec["title"], transform=ax.transAxes, ha="center", va="bottom",
            fontsize=11.5)
    ax.text(0.5, -0.1, spec["verdict"], transform=ax.transAxes, ha="center", va="top",
            fontsize=10.5, color=C["ink2"])

save(fig, "p19-convexity", lecture="lecture1")
