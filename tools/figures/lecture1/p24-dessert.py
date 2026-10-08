"""p24-dessert: the handout's dessert-menu example as two menus and the choice made from each.

Menu A has a tempting chocolate cake: you order the apple pie. Menu B is the same without the
cake: you order fruit. Apple pie and fruit are on both menus, so this pair violates HARP.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

fig, ax = plt.subplots(figsize=(8.6, 4.2))
ax.set_xlim(0, 10.4)
ax.set_ylim(0.5, 5.9)
ax.axis("off")

CARD_W = 3.5
ROW_W, ROW_H = 2.9, 0.62


def card(cx, top, title, n_rows):
    height = 1.0 + n_rows * 0.8
    ax.add_patch(FancyBboxPatch((cx - CARD_W / 2, top - height), CARD_W, height,
                                boxstyle="round,pad=0.02,rounding_size=0.16",
                                fc="white", ec=C["ink2"], lw=1.2, zorder=1))
    ax.text(cx, top - 0.38, title, ha="center", va="center", fontsize=11.5, zorder=3)
    ax.plot([cx - CARD_W / 2 + 0.2, cx + CARD_W / 2 - 0.2], [top - 0.72, top - 0.72],
            color=C["grid"], lw=1.0, zorder=2)


def row(cx, y, name, chosen=False, tempting=False):
    face = C["fill_teal"] if chosen else (C["fill_orange"] if tempting else C["fill_gray"])
    edge = C["teal"] if chosen else (C["orange"] if tempting else C["gray"])
    ax.add_patch(FancyBboxPatch((cx - ROW_W / 2, y - ROW_H / 2), ROW_W, ROW_H,
                                boxstyle="round,pad=0.02,rounding_size=0.1",
                                fc=face, ec=edge, lw=2.0 if chosen else 1.1, zorder=3))
    ax.text(cx - ROW_W / 2 + 0.25, y, name, ha="left", va="center", fontsize=11, zorder=4)
    if chosen:
        ax.text(cx + ROW_W / 2 - 0.22, y, "你点了它", ha="right", va="center", fontsize=10.5,
                color=C["teal"], zorder=4)
    if tempting:
        ax.text(cx + ROW_W / 2 - 0.22, y, "没点", ha="right", va="center", fontsize=10.5,
                color=C["orange"], zorder=4)


TOP = 5.65
AX, BX = 2.35, 8.05
card(AX, TOP, "菜单 A：有巧克力蛋糕", 3)
row(AX, TOP - 1.25, "巧克力蛋糕", tempting=True)
row(AX, TOP - 2.05, "苹果派", chosen=True)
row(AX, TOP - 2.85, "水果")

card(BX, TOP, "菜单 B：没有巧克力蛋糕", 2)
row(BX, TOP - 1.25, "苹果派")
row(BX, TOP - 2.05, "水果", chosen=True)

ax.add_patch(FancyArrowPatch((AX + CARD_W / 2 + 0.15, TOP - 1.6), (BX - CARD_W / 2 - 0.15, TOP - 1.6),
                             arrowstyle="-|>", mutation_scale=13, lw=1.3, color=C["ink2"], zorder=2))
ax.text((AX + BX) / 2, TOP - 1.33, "只拿掉蛋糕", ha="center", va="bottom", fontsize=10.5,
        color=C["ink2"])
ax.text((AX + BX) / 2, TOP - 1.85, "其余不变", ha="center", va="top", fontsize=10.5, color=C["ink2"])

ax.text(BX, TOP - 2.95, "蛋糕在场时，苹果派显得“不算放纵”；\n蛋糕一走，参照点回落，你就点了水果",
        ha="center", va="top", fontsize=10.2, color=C["orange"], linespacing=1.5)

ax.add_patch(FancyBboxPatch((0.55, 0.62), 9.3, 1.0, boxstyle="round,pad=0.02,rounding_size=0.14",
                            fc=C["fill_red"], ec=C["red"], lw=1.2, zorder=1))
ax.text(5.2, 1.12, "苹果派和水果在两份菜单上都有：A 里选了苹果派，B 里却选了水果。\n"
        "HARP（第 9 页）要求苹果派在 B 里也被选中——违反了。",
        ha="center", va="center", fontsize=10.8, linespacing=1.55, zorder=2)

save(fig, "p24-dessert", lecture="lecture1")
