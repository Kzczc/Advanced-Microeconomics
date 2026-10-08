"""p27-defaults: two field studies of defaults.

(a) Madrian & Shea (2001, QJE): 401(k) participation at 3-15 months of tenure, employees who had
    to sign up (WINDOW cohort, 37%) vs employees enrolled automatically (NEW cohort, 86%); share
    sitting exactly at the default (3% contribution, all in the money market fund): 1% vs 61%.
(b) He, Pan, Park, Sawada & Tan (2023, Science): Eleme orders with "no cutlery", 3.1% before the
    green nudges (default switched to "no cutlery"), +20.1 percentage points after.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, axes = plt.subplots(1, 2, figsize=(8.8, 3.9), gridspec_kw=dict(width_ratios=[2.2, 1.25]))
fig.subplots_adjust(wspace=0.22, bottom=0.27)


def bar(ax, x, v, label, face, edge):
    ax.bar(x, v, width=0.62, color=face, edgecolor=edge, lw=1.2)
    ax.text(x, v + 2, label, ha="center", va="bottom", fontsize=10.5, color=edge)


ax = axes[0]
bar(ax, 0, 37, "37\\%", C["fill_gray"], C["gray"])
bar(ax, 1, 86, "86\\%", C["fill_teal"], C["teal"])
bar(ax, 2.6, 1, "1\\%", C["fill_gray"], C["gray"])
bar(ax, 3.6, 61, "61\\%", C["fill_teal"], C["teal"])
for x, t in [(0, "要自己\n报名"), (1, "自动\n加入"), (2.6, "要自己\n报名"), (3.6, "自动\n加入")]:
    ax.text(x, -4, t, ha="center", va="top", fontsize=10, linespacing=1.3)
ax.text(0.5, 100, "参加的比例", ha="center", va="bottom", fontsize=10.5)
ax.text(3.1, 100, "原封不动停在默认上\n（存 3\\%、全买货币基金）", ha="center", va="bottom", fontsize=10,
        linespacing=1.35)
ax.set_xlim(-0.55, 4.15)
ax.set_ylim(0, 122)
ax.axis("off")
ax.text(1.8, -26, "（a）美国一家大公司的 401(k) 养老计划\nMadrian、Shea（2001）", ha="center", va="top",
        fontsize=10.8, linespacing=1.4)

ax = axes[1]
bar(ax, 0, 3.1, "3.1\\%", C["fill_gray"], C["gray"])
bar(ax, 1, 23.2, "约 23\\%", C["fill_teal"], C["teal"])
for x, t in [(0, "改版前\n（默认给餐具）"), (1, "改版后\n（默认不要）")]:
    ax.text(x, -1.2, t, ha="center", va="top", fontsize=10, linespacing=1.3)
ax.text(0.5, 30, "选“不要餐具”的订单比例", ha="center", va="bottom", fontsize=10.5)
ax.set_xlim(-0.6, 1.6)
ax.set_ylim(0, 36.6)
ax.axis("off")
ax.text(0.5, -7.8, "（b）饿了么，北京、上海、天津\nHe 等（2023）", ha="center", va="top", fontsize=10.8,
        linespacing=1.4)

save(fig, "p27-defaults", lecture="lecture1")
