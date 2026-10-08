"""p26-ssn-wtp: Ariely, Loewenstein & Prelec (2003, QJE), Experiment 1, Table I.

Average stated willingness to pay (US dollars) by quintile of the sample's distribution of the
last two digits of the social security number (55 MIT Sloan MBA students).
(a) cordless keyboard; (b) the two wines: both rise with the anchor, the rare wine stays on top.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

GROUPS = ["最小的\n20\\%", "第 2\n组", "第 3\n组", "第 4\n组", "最大的\n20\\%"]
KEYBOARD = [16.09, 26.82, 29.27, 34.55, 55.64]
AVG_WINE = [8.64, 14.45, 12.55, 15.45, 27.91]
RARE_WINE = [11.73, 22.45, 18.09, 24.55, 37.55]
x = np.arange(5)

fig, axes = plt.subplots(1, 2, figsize=(8.8, 3.9))
fig.subplots_adjust(wspace=0.28, bottom=0.27)

ax = axes[0]
ax.bar(x, KEYBOARD, width=0.6, color=C["fill_blue"], edgecolor=C["navy"], lw=1.2)
for i, v in enumerate(KEYBOARD):
    ax.text(i, v + 1.2, f"{v:.2f}", ha="center", va="bottom", fontsize=10, color=C["navy"])
ax.set_ylim(0, 64)
ax.set_xticks(x)
ax.set_xticklabels(GROUPS, fontsize=9.5, linespacing=1.2)
ax.set_ylabel("平均出价（美元）")
ax.text(0.5, -0.36, "（a）无线键盘：末两位越大，出价越高", transform=ax.transAxes, ha="center", va="top",
        fontsize=11)

ax = axes[1]
ax.plot(x, RARE_WINE, color=C["red"], marker="o", ms=5)
ax.plot(x, AVG_WINE, color=C["navy"], marker="s", ms=5)
ax.text(4.1, RARE_WINE[-1], "稀有红酒", ha="left", va="center", fontsize=10.5, color=C["red"])
ax.text(4.1, AVG_WINE[-1], "普通红酒", ha="left", va="center", fontsize=10.5, color=C["navy"])
ax.set_xlim(-0.3, 5.1)
ax.set_ylim(0, 42)
ax.set_xticks(x)
ax.set_xticklabels(GROUPS, fontsize=9.5, linespacing=1.2)
ax.set_ylabel("平均出价（美元）")
ax.text(0.45, -0.36, "（b）两条线都被锚带着走，稀有红酒却始终在上", transform=ax.transAxes, ha="center",
        va="top", fontsize=11)

fig.text(0.5, 0.985, "横轴：按社保号末两位从小到大把学生分成 5 组；数据：Ariely、Loewenstein、Prelec（2003）表 I",
         ha="center", va="top", fontsize=9.5, color=C["ink2"])

save(fig, "p26-ssn-wtp", lecture="lecture1")
