"""cvx-sets: convex sets keep every segment inside; non-convex sets let one escape.

Top row (convex): a budget triangle, a disk, a hexagon -- a sample segment stays inside.
Bottom row (not convex): a crescent, an L shape, a ring -- the red segment joins two points
of the set but its middle leaves the set.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.path import Path  # noqa: E402
from matplotlib.patches import PathPatch, Polygon  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()


def circle_points(cx, cy, r, start_deg, end_deg, count=120):
    """Points on a circle arc from start_deg to end_deg (either direction)."""
    angles = np.radians(np.linspace(start_deg, end_deg, count))
    return np.column_stack([cx + r * np.cos(angles), cy + r * np.sin(angles)])


def crescent_polygon():
    """Unit disk minus the disk of radius 0.8 centred at (0.55, 0)."""
    meet_x = (1 - 0.64 + 0.55 ** 2) / (2 * 0.55)
    meet_y = np.sqrt(1 - meet_x ** 2)
    big_start = np.degrees(np.arctan2(meet_y, meet_x))
    small_start = np.degrees(np.arctan2(-meet_y, meet_x - 0.55))
    outer = circle_points(0, 0, 1, big_start, 360 - big_start)
    inner = circle_points(0.55, 0, 0.8, small_start, small_start - (360 + 2 * small_start))
    return np.vstack([outer, inner])


def ring_path():
    """Annulus 0.5 <= r <= 1 as a compound path (outer counter-clockwise, inner clockwise)."""
    outer = circle_points(0, 0, 1, 0, 360)
    inner = circle_points(0, 0, 0.5, 360, 0)
    vertices = np.vstack([outer, inner])
    codes = ([Path.MOVETO] + [Path.LINETO] * (len(outer) - 1)
             + [Path.MOVETO] + [Path.LINETO] * (len(inner) - 1))
    return Path(vertices, codes)


fig, axes = plt.subplots(2, 3, figsize=(9.0, 6.0))
fig.subplots_adjust(hspace=0.62, wspace=0.12)
for ax in axes.flat:
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_xlim(-1.25, 1.25)
    ax.set_ylim(-1.25, 1.25)


def add_shape(ax, patch, fc, ec):
    patch.set_facecolor(fc)
    patch.set_edgecolor(ec)
    patch.set_linewidth(1.4)
    ax.add_patch(patch)


def segment(ax, a, b, color, escape_point=None):
    """Draw segment ab with endpoint dots; mark where it leaves the set, if given."""
    ax.plot([a[0], b[0]], [a[1], b[1]], color=color, lw=2, zorder=3)
    for p in (a, b):
        ax.plot([p[0]], [p[1]], "o", ms=7, color=C["navy"], mec="white", mew=1.2, zorder=4)
    if escape_point is not None:
        ax.plot([escape_point[0]], [escape_point[1]], "x", ms=9, mew=2.2, color=C["red"], zorder=5)


# ---- top row: convex -------------------------------------------------------------
blue_fill, blue_edge = C["fill_blue"], C["navy"]
ax = axes[0, 0]
add_shape(ax, Polygon([(-1, -0.9), (1.1, -0.9), (-1, 0.9)], closed=True), blue_fill, blue_edge)
segment(ax, (-0.75, 0.45), (0.65, -0.65), C["navy"])
ax.set_title("三角形（预算集）", fontsize=11.5, color=C["teal"])
ax = axes[0, 1]
add_shape(ax, PathPatch(Path(circle_points(0, 0, 1, 0, 360))), blue_fill, blue_edge)
segment(ax, (-0.6, 0.55), (0.7, -0.4), C["navy"])
ax.set_title("圆盘", fontsize=11.5, color=C["teal"])
ax = axes[0, 2]
hexagon = [(np.cos(np.radians(a)), np.sin(np.radians(a))) for a in range(0, 360, 60)]
add_shape(ax, Polygon(hexagon, closed=True), blue_fill, blue_edge)
segment(ax, (-0.75, 0.2), (0.55, 0.6), C["navy"])
ax.set_title("正六边形", fontsize=11.5, color=C["teal"])

# ---- bottom row: not convex -------------------------------------------------------
red_fill, red_edge = C["fill_orange"], C["orange"]
ax = axes[1, 0]
add_shape(ax, Polygon(crescent_polygon(), closed=True), red_fill, red_edge)
segment(ax, (0.3, 0.9), (0.3, -0.9), C["red"], escape_point=(0.3, 0))
ax.set_title("月牙", fontsize=11.5, color=C["red"])
ax = axes[1, 1]
L_SHAPE = [(-1, -1), (1, -1), (1, -0.2), (-0.2, -0.2), (-0.2, 1), (-1, 1)]
add_shape(ax, Polygon(L_SHAPE, closed=True), red_fill, red_edge)
segment(ax, (0.7, -0.6), (-0.6, 0.7), C["red"], escape_point=(0.05, 0.05))
ax.set_title("L 形", fontsize=11.5, color=C["red"])
ax = axes[1, 2]
add_shape(ax, PathPatch(ring_path()), red_fill, red_edge)
segment(ax, (-0.75, 0), (0.75, 0), C["red"], escape_point=(0, 0))
ax.set_title("圆环", fontsize=11.5, color=C["red"])

fig.text(0.5, axes[0, 1].get_position().y1 + 0.085, "凸集：任意两点的连线都留在里面", ha="center", va="center", fontsize=12, color=C["teal"])
fig.text(0.5, axes[1, 1].get_position().y1 + 0.085, "不是凸集：找得到两点，连线中间跑出去了（红叉）", ha="center", va="center", fontsize=12,
         color=C["red"])

save(fig, "cvx-sets", lecture="basics")
