"""p21-separability: what u(x, y) = U(v(x), y) means, and why researchers like it.

(a) two-step scoring: x enters the total only through the single score v(x);
(b) two-step budgeting: decide the entertainment budget first, then split it among
    entertainment goods using entertainment prices only.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()


def box(ax, x, y, w, h, text, face, edge, size=10.5):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h,
                                boxstyle="round,pad=0.02,rounding_size=0.14", fc=face, ec=edge,
                                lw=1.3, zorder=3))
    ax.text(x, y, text, ha="center", va="center", fontsize=size, zorder=4, linespacing=1.45)


def arrow(ax, p, q, color=C["ink2"], lw=1.3):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle="-|>", mutation_scale=12, lw=lw, color=color,
                                 shrinkA=0, shrinkB=0, zorder=2))


fig, axes = plt.subplots(1, 2, figsize=(9.2, 3.7), gridspec_kw=dict(width_ratios=[1, 1.08]))
fig.subplots_adjust(wspace=0.08)
for ax in axes:
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis("off")

# (a) Two-step scoring.
ax = axes[0]
box(ax, 2.1, 4.5, 3.7, 1.15, "$x$：娱乐\n电影、演唱会、酒吧", C["fill_orange"], C["orange"])
box(ax, 6.9, 4.5, 2.7, 1.15, "娱乐得分\n$v(x)$", C["fill_orange"], C["orange"])
box(ax, 2.1, 1.75, 3.7, 1.15, "$y$：其他\n住房、吃饭、衣服", C["fill_blue"], C["navy"])
box(ax, 6.9, 1.75, 2.7, 1.15, "总效用\n$U(v(x),y)$", C["fill_teal"], C["teal"])
arrow(ax, (3.95, 4.5), (5.55, 4.5), C["orange"])
ax.text(4.75, 4.62, "打分 $v$", ha="center", va="bottom", fontsize=10, color=C["orange"])
arrow(ax, (6.9, 3.92), (6.9, 2.33), C["orange"])
ax.text(7.05, 3.12, "只传一个数", ha="left", va="center", fontsize=10, color=C["orange"])
arrow(ax, (3.95, 1.75), (5.55, 1.75), C["navy"])
ax.text(5.0, 6.0, "（a）两步打分：$u(x,y)=U(v(x),y)$", ha="center", va="top", fontsize=11.5)
ax.text(5.0, 0.55, "$x$ 只通过 $v(x)$ 影响总效用；$U$ 对第一格递增", ha="center", va="center",
        fontsize=10.5, color=C["ink2"])

# (b) Two-step budgeting.
ax = axes[1]
box(ax, 5.0, 4.75, 3.4, 0.8, "每月可花 5000 元", C["fill_gray"], C["gray"])
box(ax, 2.55, 3.05, 2.9, 0.8, "娱乐 800 元", C["fill_orange"], C["orange"])
box(ax, 7.45, 3.05, 2.9, 0.8, "其他 4200 元", C["fill_blue"], C["navy"])
arrow(ax, (4.2, 4.35), (3.0, 3.46))
arrow(ax, (5.8, 4.35), (7.0, 3.46))
for x, name in ((0.95, "电影"), (2.55, "演唱会"), (4.15, "酒吧")):
    box(ax, x, 1.55, 1.4, 0.7, name, "white", C["orange"], size=10)
    arrow(ax, (2.55 + 0.25 * (x - 2.55), 2.64), (x, 1.91), C["orange"], lw=1.1)
for x, name in ((5.85, "房租"), (7.45, "吃饭"), (9.05, "衣服")):
    box(ax, x, 1.55, 1.4, 0.7, name, "white", C["navy"], size=10)
    arrow(ax, (7.45 + 0.25 * (x - 7.45), 2.64), (x, 1.91), C["navy"], lw=1.1)
ax.text(1.0, 4.2, "第一步：分大类", ha="center", va="center", fontsize=10, color=C["ink2"])
ax.text(5.0, 6.0, "（b）两步花钱：先分大类，再分小类", ha="center", va="top", fontsize=11.5)
ax.text(5.0, 0.55, "第二步：800 元怎么分，只看娱乐的价格", ha="center", va="center",
        fontsize=10.5, color=C["orange"])

save(fig, "p21-separability", lecture="lecture1")
