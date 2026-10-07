"""p04-framing: the same $5 is a third of the calculator price but a sliver of the stereo price."""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(7.6, 2.75))
rows = [("计算器", 15, 1.0), ("音响", 125, 0.0)]
for name, price, y in rows:
    ax.barh(y, price - 5, height=0.42, left=0, color=C["fill_blue"], edgecolor=C["navy"], lw=1.1)
    ax.barh(y, 5, height=0.42, left=price - 5, color=C["orange"], edgecolor=C["orange"], lw=1.1)
    ax.text(-2.5, y, f"{name}", ha="right", va="center", fontsize=12)
    share = 5 / price
    label = f"原价 {price} 美元：省 5 美元 = ${share * 100:.0f}\\%$"
    ax.text(price + 2.5, y, label, ha="left", va="center", fontsize=11.5,
            color=C["orange"] if share > 0.1 else C["ink2"])

LABEL = (62, 0.5)
ax.text(*LABEL, "两段橙色一样长：都是 5 美元", ha="center", va="center", fontsize=11, color=C["orange"])
for target in [(12.5, 0.78), (122.5, 0.22)]:
    ax.annotate("", xy=target, xytext=(LABEL[0] + (-40 if target[0] < 60 else 40), LABEL[1]),
                arrowprops=dict(arrowstyle="-", lw=0.9, color=C["orange"], shrinkA=0, shrinkB=2))

ax.set_xlim(-24, 188)
ax.set_ylim(-0.5, 1.5)
ax.axis("off")
ax.plot([0, 125], [-0.38, -0.38], color=C["ink2"], lw=0.9)
for t in (0, 25, 50, 75, 100, 125):
    ax.plot([t, t], [-0.38, -0.33], color=C["ink2"], lw=0.9)
    ax.text(t, -0.45, f"{t}", ha="center", va="top", fontsize=9.5, color=C["ink2"])
ax.text(130, -0.38, "美元", ha="left", va="center", fontsize=9.5, color=C["ink2"])

save(fig, "p04-framing", lecture="lecture1")
