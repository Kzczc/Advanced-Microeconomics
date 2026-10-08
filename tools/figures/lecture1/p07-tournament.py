"""p07-tournament: the induction proof of Proposition 1 (1) as a king-of-the-hill tournament.

Xiao Zhang: mango ≻ apple ~ banana ≻ orange ≻ pear. Fruits enter in the order
orange, pear, banana, mango, apple; each newcomer faces the current champion.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

ROUNDS = [
    ("橙子", "橙子", "起点"),
    ("梨", "橙子", "擂主守住"),
    ("香蕉", "香蕉", "挑战者赢"),
    ("芒果", "芒果", "挑战者赢"),
    ("苹果", "芒果", "擂主守住"),
]

fig, ax = plt.subplots(figsize=(9.0, 3.6))
ax.set_xlim(0, 10)
ax.set_ylim(0, 5)
ax.axis("off")


def box(x, y, text, face, edge, w=1.3, h=0.7, size=11, bold=False):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h,
                                boxstyle="round,pad=0.02,rounding_size=0.12", fc=face, ec=edge,
                                lw=1.6 if bold else 1.2, zorder=3))
    ax.text(x, y, text, ha="center", va="center", fontsize=size, zorder=4)


ax.text(0.15, 4.0, "上台", ha="left", va="center", fontsize=10.5, color=C["orange"])
ax.text(0.15, 2.2, "擂主", ha="left", va="center", fontsize=10.5, color=C["navy"])
xs = [1.75 + 1.85 * i for i in range(len(ROUNDS))]
prev = None
for i, (x, (new, champ, result)) in enumerate(zip(xs, ROUNDS)):
    won = champ == new
    box(x, 4.0, new, "white", C["orange"])
    last = i == len(ROUNDS) - 1
    box(x, 2.2, champ, C["fill_teal"] if won else C["fill_blue"], C["teal"] if won else C["navy"],
        bold=last)
    if won:
        ax.add_patch(FancyArrowPatch((x, 3.62), (x, 2.58), arrowstyle="-|>", mutation_scale=12,
                                     lw=1.4, color=C["teal"], zorder=2))
    else:
        ax.plot([x, x], [3.62, 2.62], color=C["muted"], lw=1, ls=(0, (3, 3)), zorder=1)
        ax.text(x + 0.12, 3.1, "输", ha="left", va="center", fontsize=10, color=C["muted"])
    ax.text(x, 1.55, result, ha="center", va="center", fontsize=10,
            color=C["teal"] if won and i else C["ink2"])
    if prev is not None:
        ax.add_patch(FancyArrowPatch((prev + 0.68, 2.2), (x - 0.68, 2.2), arrowstyle="-|>",
                                     mutation_scale=11, lw=1.1, color=C["ink2"], zorder=2))
    prev = x
ax.text(xs[-1], 0.85, "最后的擂主属于 $C(B)$", ha="center", va="center", fontsize=10.5,
        color=C["teal"])
ax.text(5.0, 0.3, "每一轮只比一场；没比过的对手，靠传递性也不会比擂主好", ha="center",
        va="center", fontsize=10.5, color=C["ink2"])

save(fig, "p07-tournament", lecture="lecture1")
