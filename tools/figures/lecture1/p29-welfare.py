"""p29-welfare: the rational-choice welfare chain and where behavioral evidence breaks it."""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(8.8, 4.4))
ax.set_xlim(0, 11)
ax.set_ylim(0, 5.6)
ax.axis("off")

XS = [1.3, 4.1, 6.9, 9.7]
Y, W, H = 4.15, 2.0, 1.0
TEXTS = ["观察人们\n怎么选", "推出偏好\n（第 8–13 页）", "预测每种政策\n下的结果", "用偏好比较，\n挑出更好的政策"]
for x, t in zip(XS, TEXTS):
    ax.add_patch(FancyBboxPatch((x - W / 2, Y - H / 2), W, H, boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=C["fill_blue"], ec=C["navy"], lw=1.3, zorder=3))
    ax.text(x, Y, t, ha="center", va="center", fontsize=10.8, linespacing=1.4, zorder=4)
for a, b in zip(XS[:-1], XS[1:]):
    ax.add_patch(FancyArrowPatch((a + W / 2 + 0.05, Y), (b - W / 2 - 0.05, Y), arrowstyle="-|>",
                                 mutation_scale=13, lw=1.4, color=C["navy"], zorder=2))

BREAKS = [
    ((XS[0] + XS[1]) / 2, 1.55, "默认选项、框架：\n同一份菜单，选择却不同\n（第 24、27 页）"),
    ((XS[1] + XS[2]) / 2, 1.55, "情境依赖：政策和环境\n本身就会改变偏好\n（第 23、24、26 页）"),
    ((XS[2] + XS[3]) / 2, 1.55, "诱惑、犯错：选的不一定\n是自己真正想要的\n（第 25、28 页）"),
]
for i, (x, y, t) in enumerate(BREAKS):
    bx = [1.75, 5.5, 9.25][i]
    ax.add_patch(FancyBboxPatch((bx - 1.6, y - 0.75), 3.2, 1.5, boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=C["fill_red"], ec=C["red"], lw=1.1, zorder=3))
    ax.text(bx, y, t, ha="center", va="center", fontsize=10, linespacing=1.4, zorder=4)
    ax.plot([bx, x], [y + 0.78, Y - 0.22], color=C["red"], lw=1.0, ls=(0, (3, 3)), zorder=1)
    ax.plot([x - 0.1, x + 0.1], [Y - 0.1, Y + 0.1], color=C["red"], lw=2.0, zorder=5)
    ax.plot([x - 0.1, x + 0.1], [Y + 0.1, Y - 0.1], color=C["red"], lw=2.0, zorder=5)

ax.text(5.5, 5.3, "理性选择的福利分析：每一环都要求“偏好稳定、只看结果、人会照着偏好选”", ha="center",
        va="center", fontsize=10.2, color=C["navy"])
ax.text(5.5, 0.35, "红叉：行为经济学的证据分别在这里打断链条", ha="center", va="center", fontsize=10.2,
        color=C["red"])

save(fig, "p29-welfare", lecture="lecture1")
