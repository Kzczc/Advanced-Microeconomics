"""p16-45deg: the construction of u in Proposition 4 for preferences given by x1*x2.

The indifference curve through x = (1, 4) meets the 45-degree line at (2, 2), so u(x) = 2;
the curve through y = (4.5, 2) meets it at (3, 3), so u(y) = 3 and y is preferred to x.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

LIM = 5.4
fig, ax = plt.subplots(figsize=(5.4, 4.6))
econ_axes(ax, (0, LIM), (0, LIM), xlabel="$x_1$", ylabel="$x_2$")
ax.plot([0, LIM - 0.15], [0, LIM - 0.15], color=C["gray"], lw=1.2, ls=(0, (5, 3)))
ax.text(4.75, 5.05, "45° 线：$(\\alpha,\\alpha)$", ha="right", va="bottom", fontsize=10.5, color=C["gray"])

s = np.linspace(0.3, LIM, 400)
for alpha, color, point, name in [(2, C["navy"], (1.0, 4.0), "x"), (3, C["teal"], (4.5, 2.0), "y")]:
    curve = alpha**2 / s
    keep = curve <= LIM - 0.1
    ax.plot(s[keep], curve[keep], color=color, lw=2)
    ax.plot(*point, "o", ms=7.5, color=color, mec="white", mew=1.2, zorder=5)
    ax.plot(alpha, alpha, "s", ms=6.5, color=color, mec="white", mew=1.0, zorder=5)
    ax.plot([alpha, alpha], [0, alpha], color=color, lw=0.9, ls=(0, (2, 2)))
    ax.text(alpha, -0.12, f"${alpha}$", ha="center", va="top", fontsize=10.5, color=color)
    ax.annotate(f"${name}$", point, xytext=(7, 4), textcoords="offset points", fontsize=12, color=color)
ax.annotate("$u(x)=2$", (2, 2), xytext=(-60, -6), textcoords="offset points", fontsize=10.5,
            color=C["navy"], arrowprops=dict(arrowstyle="-", lw=0.8, color=C["navy"], shrinkB=4))
ax.annotate("$u(y)=3$", (3, 3), xytext=(-72, 16), textcoords="offset points", fontsize=10.5,
            color=C["teal"], arrowprops=dict(arrowstyle="-", lw=0.8, color=C["teal"], shrinkB=4))

save(fig, "p16-45deg", lecture="lecture1")
