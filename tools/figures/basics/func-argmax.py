"""func-argmax: max is a value, argmax is the set of places where the value is reached.

(a) scores 苹果 3, 香蕉 3, 橙子 2: max = 3, argmax = {苹果, 香蕉}.
(b) satisfaction f(s) = 9 - 0.36 (s - 5)^2 over sweetness s in [0, 10]: max = 9, argmax = {5}.
(c) two equal peaks at s = 2.5 and s = 7.5: argmax = {2.5, 7.5}.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, axes = plt.subplots(1, 3, figsize=(10.4, 3.7))
fig.subplots_adjust(wspace=0.3)

# ---- (a) a finite menu -------------------------------------------------------
ax = axes[0]
econ_axes(ax, (0, 3.6), (0, 4.2), None, "分数", ticks=True)
names, scores = ["苹果", "香蕉", "橙子"], [3, 3, 2]
colors = [C["orange"], C["orange"], C["blue"]]
ax.bar([0.8, 1.8, 2.8], scores, width=0.55, color=[C["fill_orange"], C["fill_orange"], C["fill_blue"]],
       edgecolor=colors, lw=1.4)
ax.plot([0, 3.4], [3, 3], color=C["muted"], lw=1, ls=DASH)
ax.set_xticks([0.8, 1.8, 2.8])
ax.set_xticklabels(names)
ax.set_yticks([1, 2, 3])
ax.set_title("（a）菜单上打分", pad=22)
ax.text(1.8, -1.25, "最大值 $=3$，最优者 $=\\{$苹果，香蕉$\\}$", ha="center", va="center", fontsize=10.5,
        color=C["ink2"])

# ---- (b) one peak ------------------------------------------------------------
ax = axes[1]
econ_axes(ax, (0, 10.8), (0, 10.5), "甜度 $s$", "$f(s)$", ticks=True)
s = np.linspace(0, 10, 200)
ax.plot(s, 9 - 0.36 * (s - 5) ** 2, color=C["navy"])
ax.plot([5, 5], [0, 9], color=C["muted"], lw=1, ls=DASH)
ax.plot([0, 5], [9, 9], color=C["muted"], lw=1, ls=DASH)
ax.plot([5], [9], "o", ms=7, color=C["orange"], mec="white", mew=1.2, zorder=4)
ax.set_xticks([0, 5, 10])
ax.set_yticks([9])
ax.set_title("（b）一个山顶", pad=22)
ax.text(5.2, -3.2, "最大值 $=9$，$\\arg\\max=\\{5\\}$", ha="center", va="center", fontsize=10.5, color=C["ink2"])

# ---- (c) two equal peaks -----------------------------------------------------
ax = axes[2]
econ_axes(ax, (0, 10.8), (0, 10.5), "甜度 $s$", "$g(s)$", ticks=True)
s = np.linspace(0.9, 9.1, 300)
ax.plot(s, 9 - 0.0576 * ((s - 2.5) * (s - 7.5)) ** 2, color=C["teal"])
for peak in (2.5, 7.5):
    ax.plot([peak, peak], [0, 9], color=C["muted"], lw=1, ls=DASH)
    ax.plot([peak], [9], "o", ms=7, color=C["orange"], mec="white", mew=1.2, zorder=4)
ax.plot([0, 7.5], [9, 9], color=C["muted"], lw=1, ls=DASH)
ax.set_xticks([2.5, 5, 7.5])
ax.set_xticklabels(["$2.5$", "$5$", "$7.5$"])
ax.set_yticks([9])
ax.set_title("（c）两个一样高的山顶", pad=22)
ax.text(5.2, -3.2, "最大值 $=9$，$\\arg\\max=\\{2.5,\\,7.5\\}$", ha="center", va="center", fontsize=10.5,
        color=C["ink2"])

save(fig, "func-argmax", lecture="basics")
