"""p23-inference: why stable preferences give the theory its empirical content.

Top row: preferences are stable, so a choice seen in one situation (the canteen) predicts the
choice in another (a delivery app). Bottom row: preferences shift with context (the app labels
the rice dish a "best seller"), so the same inference breaks at the second arrow.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(8.8, 4.3))
ax.set_xlim(0, 10.6)
ax.set_ylim(0, 5.4)
ax.axis("off")

COLS = [1.85, 5.3, 8.75]
BOX_W, BOX_H = 2.5, 1.05
ROWS = {"a": 3.55, "b": 1.15}


def box(x, y, text, face, edge, size=10.5):
    ax.add_patch(FancyBboxPatch((x - BOX_W / 2, y - BOX_H / 2), BOX_W, BOX_H,
                                boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=face, ec=edge, lw=1.3, zorder=3))
    ax.text(x, y, text, ha="center", va="center", fontsize=size, zorder=4, linespacing=1.45)


def arrow(x0, x1, y, color, dashed=False):
    ax.add_patch(FancyArrowPatch((x0, y), (x1, y), arrowstyle="-|>", mutation_scale=13, lw=1.4,
                                 color=color, linestyle=(0, (4, 3)) if dashed else "-", zorder=2))


# Column headers.
for x, head in zip(COLS, ["第 1 步：在一个情境里看选择", "第 2 步：推断他的偏好", "第 3 步：预测另一个情境"]):
    ax.text(x, 5.05, head, ha="center", va="center", fontsize=11, color=C["ink2"])

# Row (a): stable preferences, the chain holds.
ya = ROWS["a"]
ax.text(0.02, ya + 0.82, "（a）偏好稳定：推得过去", ha="left", va="center", fontsize=11.5, color=C["teal"])
box(COLS[0], ya, "食堂：牛肉面和盖浇饭\n他选了牛肉面", C["fill_gray"], C["gray"])
box(COLS[1], ya, "牛肉面 $\\succ$ 盖浇饭", C["fill_blue"], C["navy"], size=11)
box(COLS[2], ya, "外卖上两样都有\n预测：他点牛肉面", C["fill_teal"], C["teal"])
arrow(COLS[0] + BOX_W / 2 + 0.05, COLS[1] - BOX_W / 2 - 0.05, ya, C["ink2"])
arrow(COLS[1] + BOX_W / 2 + 0.05, COLS[2] - BOX_W / 2 - 0.05, ya, C["teal"])
ax.text(COLS[2], ya - BOX_H / 2 - 0.22, "实际也点了牛肉面：预测对了", ha="center", va="center",
        fontsize=10, color=C["teal"])

# Row (b): context-dependent preferences, the second arrow breaks.
yb = ROWS["b"]
ax.text(0.02, yb + 0.82, "（b）偏好随情境变：推不过去", ha="left", va="center", fontsize=11.5,
        color=C["red"])
box(COLS[0], yb, "食堂：牛肉面和盖浇饭\n他选了牛肉面", C["fill_gray"], C["gray"])
box(COLS[1], yb, "牛肉面 $\\succ$ 盖浇饭", C["fill_blue"], C["navy"], size=11)
box(COLS[2], yb, "外卖首页把盖浇饭\n标成“爆款”放第一位", C["fill_red"], C["red"])
arrow(COLS[0] + BOX_W / 2 + 0.05, COLS[1] - BOX_W / 2 - 0.05, yb, C["ink2"])
# A broken link: dashed stub, a red cross in the gap, then a short arrow into the last box.
mx = (COLS[1] + COLS[2]) / 2
ax.plot([COLS[1] + BOX_W / 2 + 0.05, mx - 0.2], [yb, yb], color=C["red"], lw=1.4,
        ls=(0, (4, 3)), zorder=2)
arrow(mx + 0.2, COLS[2] - BOX_W / 2 - 0.05, yb, C["red"], dashed=True)
ax.plot([mx - 0.12, mx + 0.12], [yb - 0.12, yb + 0.12], color=C["red"], lw=2.2, zorder=5)
ax.plot([mx - 0.12, mx + 0.12], [yb + 0.12, yb - 0.12], color=C["red"], lw=2.2, zorder=5)
ax.text(COLS[2], yb - BOX_H / 2 - 0.22, "实际点了盖浇饭：预测落空", ha="center", va="center",
        fontsize=10, color=C["red"])

save(fig, "p23-inference", lecture="lecture1")
