"""seq-closed: closed means "limits of sequences in the set stay in the set".

The same sequence x_n = 1 - 1/n (0, 1/2, 2/3, 3/4, ...) lives in both intervals and converges to 1.
Top: [0, 1] contains the limit 1 (solid dot) -- closed.
Bottom: [0, 1) does not contain 1 (hollow dot) -- the sequence "escapes", so [0, 1) is not closed.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(8.2, 3.6))
ax.set_xlim(-0.35, 1.9)
ax.set_ylim(0.05, 2.55)
ax.axis("off")
TERMS = [1 - 1 / n for n in range(1, 41)]

for y, closed, title, verdict, color in [
        (1.75, True, "$[0,1]$", "极限 1 在集合里：闭集", C["teal"]),
        (0.55, False, "$[0,1)$", "极限 1 不在集合里：不是闭集", C["red"])]:
    ax.plot([-0.1, 1.15], [y, y], color=C["ink2"], lw=1)
    ax.plot([0, 1], [y, y], color=C["navy"], lw=4, solid_capstyle="butt", zorder=1)
    ax.plot([0], [y], "o", ms=8, color=C["navy"], zorder=3)
    if closed:
        ax.plot([1], [y], "o", ms=9, color=C["teal"], zorder=4)
    else:
        ax.plot([1], [y], "o", ms=9, mfc="white", mec=C["red"], mew=1.8, zorder=4)
    ax.plot(TERMS, [y + 0.22] * len(TERMS), "|", ms=9, mew=1.4, color=C["orange"], zorder=2)
    for value, label in [(0, "$0$"), (0.5, "$\\tfrac12$"), (2 / 3, "$\\tfrac23$"), (1, "$1$")]:
        ax.text(value, y - 0.14, label, ha="center", va="top", fontsize=10.5, color=C["ink2"])
    ax.text(-0.2, y, title, ha="right", va="center", fontsize=12)
    ax.text(1.2, y + 0.05, verdict, ha="left", va="center", fontsize=10.5, color=color)

ax.text(0.75, 2.42, "橙色竖线：数列 $x_n=1-1/n$ 的各项，越往右挤得越密，极限是 1", ha="center",
        va="center", fontsize=10.5, color=C["orange"])

save(fig, "seq-closed", lecture="basics")
