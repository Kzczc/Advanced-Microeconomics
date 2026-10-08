"""sets-quantifiers: "every dish costs at most 20 yuan" checked on two canteens.

Top strip: all four prices are below the dashed line, the "for all" statement holds.
Bottom strip: one dish (26 yuan) is above it -- a single counterexample is enough
to make the "for all" statement false, i.e. "there exists a dish above 20" is true.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

ROWS = [
    (2.55, "食堂甲", [("包子", 8), ("面条", 11), ("饺子", 14), ("盖饭", 18)],
     "“所有菜 $\\le 20$ 元”：成立（每一道都在虚线左边）", C["teal"]),
    (0.85, "食堂乙", [("煎饼", 9), ("米线", 14), ("盖饭", 17), ("牛排", 26)],
     "“所有菜 $\\le 20$ 元”：不成立。一个反例就够：存在一道菜（牛排）超过 20 元", C["red"]),
]

fig, ax = plt.subplots(figsize=(7.6, 3.3))
ax.set_xlim(2.0, 31.5)
ax.set_ylim(0.0, 3.6)
ax.axis("off")

for y, name, dishes, verdict, col in ROWS:
    ax.annotate("", xy=(30.5, y), xytext=(6.5, y),
                arrowprops=dict(arrowstyle="-|>", lw=1.0, color=C["ink2"], mutation_scale=10))
    ax.text(30.7, y, "元", ha="left", va="center", fontsize=10, color=C["ink2"])
    for t in (10, 15, 20, 25, 30):
        ax.plot([t, t], [y - 0.06, y + 0.06], color=C["ink2"], lw=1)
        ax.text(t, y - 0.12, f"${t}$", ha="center", va="top", fontsize=9.5, color=C["ink2"])
    ax.text(5.6, y, name, ha="right", va="center", fontsize=11)
    for dish, price in dishes:
        bad = price > 20
        c = C["red"] if bad else C["teal"]
        ax.plot([price], [y], "o", ms=8, color=c, mec="white", mew=1.2, zorder=4)
        ax.text(price, y + 0.17, f"{dish} ${price}$", ha="center", va="bottom", fontsize=9.5, color=c)
    ax.text(18.5, y - 0.52, verdict, ha="center", va="center", fontsize=10.5, color=col)
    ax.plot([20, 20], [y + 0.08, y + 0.62], color=C["gray"], lw=1, ls=(0, (4, 3)))

save(fig, "sets-quantifiers", lecture="basics")
