"""p24-decoy: The Economist subscription menus from Ariely (2008, Predictably Irrational, ch. 1).

With the print-only "decoy" on the menu (nobody chose it), 84 of 100 MIT Sloan students took
print + web; without it, only 32 of 100 did.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

PANELS = [
    ("（a）三个选项：多了“仅印刷版”", [("仅网络版\n59 美元", 16, "blue"), ("仅印刷版\n125 美元", 0, "gray"),
                                   ("印刷 + 网络\n125 美元", 84, "orange")]),
    ("（b）去掉没人选的“仅印刷版”", [("仅网络版\n59 美元", 68, "blue"), ("印刷 + 网络\n125 美元", 32, "orange")]),
]
FILL = {"blue": C["fill_blue"], "gray": C["fill_gray"], "orange": C["fill_orange"]}
EDGE = {"blue": C["navy"], "gray": C["gray"], "orange": C["orange"]}

fig, axes = plt.subplots(1, 2, figsize=(8.4, 3.7), gridspec_kw=dict(width_ratios=[3, 2.2]))
fig.subplots_adjust(wspace=0.18, bottom=0.25)
for ax, (title, bars) in zip(axes, PANELS):
    for i, (label, n, col) in enumerate(bars):
        ax.bar(i, n, width=0.6, color=FILL[col], edgecolor=EDGE[col], lw=1.3)
        ax.text(i, n + 2.5, f"{n} 人", ha="center", va="bottom", fontsize=11, color=EDGE[col])
        ax.text(i, -6, label, ha="center", va="top", fontsize=10.5, linespacing=1.4)
    ax.set_xlim(-0.6, len(bars) - 0.4)
    ax.set_ylim(0, 100)
    ax.axis("off")
    ax.text((len(bars) - 1) / 2, -33, title, ha="center", va="top", fontsize=11.2)

fig.text(0.98, 0.985, "每种菜单 100 名学生；数据：Ariely（2008）", ha="right", va="top", fontsize=9.5,
         color=C["ink2"])

save(fig, "p24-decoy", lecture="lecture1")
