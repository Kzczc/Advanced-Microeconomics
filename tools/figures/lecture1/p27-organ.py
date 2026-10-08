"""p27-organ: Johnson & Goldstein (2003, Science), "Do Defaults Save Lives?".

(a) Effective consent rates by country: explicit consent (opt-in) vs presumed consent (opt-out).
(b) Online experiment, 161 respondents: share agreeing to be a donor under each default.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

OPT_IN = [("丹麦", 4.25), ("德国", 12), ("英国", 17.17), ("荷兰", 27.5)]
OPT_OUT = [("瑞典", 85.9), ("比利时", 98), ("波兰", 99.5), ("葡萄牙", 99.64), ("法国", 99.91),
           ("匈牙利", 99.997), ("奥地利", 99.98)]

fig, axes = plt.subplots(1, 2, figsize=(8.8, 4.0), gridspec_kw=dict(width_ratios=[3.9, 1.2]))
fig.subplots_adjust(wspace=0.12, bottom=0.27)

ax = axes[0]
for i, (name, v) in enumerate(OPT_IN + OPT_OUT):
    opt_in = i < len(OPT_IN)
    face, edge = (C["fill_orange"], C["orange"]) if opt_in else (C["fill_blue"], C["navy"])
    x = i * 1.18
    ax.bar(x, v, width=0.78, color=face, edgecolor=edge, lw=1.1)
    ax.text(x, v + 2, f"{v:g}", ha="center", va="bottom", fontsize=8.4, color=edge)
    ax.text(x, -3, name, ha="center", va="top", fontsize=9.2)
ax.text(1.5 * 1.18, 52, "选择加入\n（不登记就不是捐献者）", ha="center", va="bottom", fontsize=10.2,
        color=C["orange"], linespacing=1.35)
ax.text(7 * 1.18, 112, "选择退出（不声明反对就算同意）", ha="center", va="bottom", fontsize=10.2, color=C["navy"])
ax.set_xlim(-0.7, 10 * 1.18 + 0.7)
ax.set_ylim(0, 124)
ax.axis("off")
ax.text(5 * 1.18, -17, "（a）欧洲各国同意捐献器官的比例（\\%）", ha="center", va="top", fontsize=10.8)

ax = axes[1]
for i, (name, v, face, edge) in enumerate([("默认\n不捐", 42, C["fill_orange"], C["orange"]),
                                           ("默认\n捐献", 82, C["fill_blue"], C["navy"]),
                                           ("没有默认\n必须选", 79, C["fill_gray"], C["gray"])]):
    ax.bar(i, v, width=0.62, color=face, edgecolor=edge, lw=1.1)
    ax.text(i, v + 2, f"{v}\\%", ha="center", va="bottom", fontsize=10, color=edge)
    ax.text(i, -3, name, ha="center", va="top", fontsize=9.6, linespacing=1.25)
ax.set_xlim(-0.6, 2.6)
ax.set_ylim(0, 124)
ax.axis("off")
ax.text(1, -24, "（b）网上实验：只是改了默认", ha="center", va="top", fontsize=10.8)

fig.text(0.98, 0.99, "数据：Johnson、Goldstein（2003）", ha="right", va="top", fontsize=9.5, color=C["ink2"])

save(fig, "p27-organ", lecture="lecture1")
