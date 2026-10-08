"""seq-continuity: continuous = "close inputs give close outputs" (sequence version).

(a) tiered electricity bill: 0.5 yuan/kWh up to 200 kWh, 0.55 up to 400, 0.8 above.
    The graph bends but never jumps: continuous.
(b) delivery fee: 10 yuan up to 1 kg, 15 up to 2 kg, 20 up to 3 kg.
    w_n = 1 + 1/n -> 1, but fee(w_n) = 15 for every n while fee(1) = 10: not continuous at 1.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, econ_axes, save, setup  # noqa: E402

setup()

DASH = (0, (4, 3))
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.0, 3.9))
fig.subplots_adjust(wspace=0.28)


def bill(kwh):
    """Tiered electricity bill in yuan."""
    kwh = np.asarray(kwh, dtype=float)
    return (0.5 * np.minimum(kwh, 200) + 0.55 * np.clip(kwh - 200, 0, 200) + 0.8 * np.clip(kwh - 400, 0, None))


# ---- (a) continuous ------------------------------------------------------------
ax = ax1
econ_axes(ax, (0, 540), (0, 330), "用电（度）", "电费（元）", ticks=True)
k = np.linspace(0, 500, 400)
ax.plot(k, bill(k), color=C["teal"])
for kwh in (200, 400):
    ax.plot([kwh, kwh], [0, bill(kwh)], color=C["muted"], lw=1, ls=DASH)
    ax.plot([0, kwh], [bill(kwh), bill(kwh)], color=C["muted"], lw=1, ls=DASH)
ax.set_xticks([200, 400])
ax.set_yticks([100, 210])
ax.text(250, 290, "会拐弯，但不跳：连续", ha="center", va="center", fontsize=10.5, color=C["teal"])
ax.set_title("（a）阶梯电价", pad=22)

# ---- (b) jump ----------------------------------------------------------------
ax = ax2
econ_axes(ax, (0, 3.4), (0, 24), "重量（公斤）", "运费（元）", ticks=True)
for left, right, fee in [(0, 1, 10), (1, 2, 15), (2, 3, 20)]:
    ax.plot([left, right], [fee, fee], color=C["navy"], lw=2.2, solid_capstyle="butt")
    if left > 0:
        ax.plot([left], [fee], "o", ms=7, mfc="white", mec=C["navy"], mew=1.5, zorder=4)
    ax.plot([right], [fee], "o", ms=7, color=C["navy"], zorder=4)
weights = [1 + 1 / n for n in range(1, 9)]
ax.plot(weights[1:], [15] * 7, "o", ms=5, color=C["orange"], zorder=5)
ax.annotate("", xy=(1.06, 16.9), xytext=(1.55, 16.9),
            arrowprops=dict(arrowstyle="-|>", lw=1.1, color=C["orange"], mutation_scale=10, shrinkA=0, shrinkB=0))
ax.text(1.3, 17.6, "$w_n=1+\\frac1n\\to1$", ha="center", va="bottom", fontsize=10.5, color=C["orange"])
ax.plot([1, 1], [0, 10], color=C["muted"], lw=1, ls=DASH)
ax.text(1.05, 7.0, "这些重量的运费都是 15", ha="left", va="center", fontsize=10.5, color=C["red"])
ax.text(1.05, 4.6, "1 公斤却是 10：跳了", ha="left", va="center", fontsize=10.5, color=C["red"])
ax.set_xticks([1, 2, 3])
ax.set_yticks([10, 15, 20])
ax.set_title("（b）快递运费", pad=22)

save(fig, "seq-continuity", lecture="basics")
