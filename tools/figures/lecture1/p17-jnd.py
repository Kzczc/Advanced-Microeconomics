"""p17-jnd: just noticeable differences make indifference intransitive.

Three cups of coffee with utilities 0, 0.6 and 1.2 (one unit = one just noticeable
difference). Neighbours differ by 0.6 < 1, so a ~ b and b ~ c; but a and c differ
by 1.2 >= 1, so c > a.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

POINTS = [("a", 0.0), ("b", 0.6), ("c", 1.2)]

fig, ax = plt.subplots(figsize=(6.4, 2.9))
ax.set_xlim(-0.35, 1.75)
ax.set_ylim(-1.2, 1.62)
ax.axis("off")

# Utility axis with unit ticks.
ax.annotate("", xy=(1.7, 0), xytext=(-0.3, 0),
            arrowprops=dict(arrowstyle="-|>", lw=1.0, color=C["ink2"], mutation_scale=11))
ax.text(1.72, 0, "$u$", ha="left", va="center", fontsize=11.5)
for t in (0.0, 1.0):
    ax.plot([t, t], [-0.06, 0.06], color=C["ink2"], lw=1)
ax.text(1.0, -0.17, "$1$", ha="center", va="top", fontsize=10, color=C["ink2"])

for name, value in POINTS:
    ax.plot([value], [0], "o", ms=8, color=C["navy"], mec="white", mew=1.3, zorder=5)
    ax.text(value, -0.17 if value != 1.0 else -0.4, f"${name}$：${value:g}$",
            ha="center", va="top", fontsize=10.5)


def arc(x0, x1, height, color, label):
    """Half-sine arc from (x0, 0.1) to (x1, 0.1) peaking at 0.1 + height, label just above."""
    xs = np.linspace(x0, x1, 120)
    ax.plot(xs, 0.1 + height * np.sin(np.pi * (xs - x0) / (x1 - x0)), color=color, lw=1.4)
    ax.text((x0 + x1) / 2, 0.22 + height, label, ha="center", va="bottom", fontsize=10.5,
            color=color)


arc(0.0, 0.6, 0.3, C["teal"], "$a\\sim b$")
arc(0.6, 1.2, 0.3, C["teal"], "$b\\sim c$")
arc(0.0, 1.2, 1.05, C["red"], "$c\\succ a$")

ax.text(0.6, -0.62, "相邻两杯差 $0.6<1$，察觉不出；$a$ 与 $c$ 差 $1.2\\ge1$，察觉得出",
        ha="center", va="top", fontsize=10.5, color=C["ink2"])
ax.text(0.6, -0.9, "所以 $a\\sim b$、$b\\sim c$，却有 $c\\succ a$：$\\sim$ 不传递",
        ha="center", va="top", fontsize=10.5, color=C["ink2"])

save(fig, "p17-jnd", lecture="lecture1")
