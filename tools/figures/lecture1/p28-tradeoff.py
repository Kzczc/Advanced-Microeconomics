"""p28-tradeoff: realism versus tractability and predictive power (qualitative sketch).

Each model family is placed roughly; positions only show the direction of the trade-off.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(7.0, 4.6))
econ_axes(ax, (0, 10), (0, 10))
ax.text(10, -0.35, "现实性：能描述多少真实行为", ha="right", va="top", fontsize=11)
ax.text(-0.3, 10, "可处理性与预测力\n（好不好算、预测明不明确）", ha="right", va="top", fontsize=11,
        linespacing=1.4, rotation=0)

t = np.linspace(0, 1, 200)
fx = 0.8 + 8.6 * t
fy = 9.2 - 8.0 * t ** 1.8
ax.plot(fx, fy, color=C["gray"], lw=1.0, ls=(0, (4, 3)), zorder=1)

POINTS = [
    (0.06, "标准理性选择模型", C["navy"], (8, 4), "left"),
    (0.3, "加入参照点、情境依赖", C["teal"], (8, 4), "left"),
    (0.5, "诱惑与自我控制", C["teal"], (8, 4), "left"),
    (0.68, "有限理性：会犯错、只部分优化", C["orange"], (-8, -12), "right"),
    (0.83, "学习规则、习惯形成", C["orange"], (-8, -12), "right"),
    (0.97, "“什么都能解释”的模型", C["red"], (-6, 10), "right"),
]
for tt, label, col, off, ha in POINTS:
    x, y = 0.8 + 8.6 * tt, 9.2 - 8.0 * tt ** 1.8
    ax.plot(x, y, "o", ms=7, color=col, mec="white", mew=1.2, zorder=3)
    ax.annotate(label, (x, y), xytext=off, textcoords="offset points", ha=ha, va="center",
                fontsize=10.5, color=col)

ax.annotate("", xy=(5.6, 1.5), xytext=(0.9, 1.5),
            arrowprops=dict(arrowstyle="-|>", lw=1.2, color=C["ink2"], mutation_scale=12))
ax.text(0.9, 1.8, "越往右越像真人，\n也越难用、越难被检验", ha="left", va="bottom", fontsize=10,
        color=C["ink2"], linespacing=1.4)
ax.text(9.9, 0.25, "示意图：位置只表示大致方向", ha="right", va="bottom", fontsize=9.5, color=C["ink2"])

save(fig, "p28-tradeoff", lecture="lecture1")
