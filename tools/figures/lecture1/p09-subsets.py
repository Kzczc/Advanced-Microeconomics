"""p09-subsets: the eight subsets of X = {x, y, z}, i.e. the elements of the collection B.

Lines join a set to the sets obtained by adding one more option. The seven non-empty
subsets are the possible menus; the empty set is drawn in grey.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

LEVELS = {
    0: ["{}"],
    1: ["x", "y", "z"],
    2: ["xy", "xz", "yz"],
    3: ["xyz"],
}
XS = {0: [3.0], 1: [1.2, 3.0, 4.8], 2: [1.2, 3.0, 4.8], 3: [3.0]}


def label(s):
    if s == "{}":
        return "$\\varnothing$"
    return "$\\{" + ",".join(s) + "\\}$"


pos = {}
for level, sets in LEVELS.items():
    for s, x in zip(sets, XS[level]):
        pos[s] = (x, 0.8 + 1.15 * level)

fig, ax = plt.subplots(figsize=(6.4, 4.4))
ax.set_xlim(-0.6, 7.6)
ax.set_ylim(0.2, 4.75)
ax.axis("off")

for a, (xa, ya) in pos.items():
    for b, (xb, yb) in pos.items():
        sa = set() if a == "{}" else set(a)
        sb = set() if b == "{}" else set(b)
        if sa < sb and len(sb) == len(sa) + 1:
            ax.plot([xa, xb], [ya + 0.24, yb - 0.24], color=C["line"] if "line" in C else C["grid"], lw=1.2,
                    zorder=1)

for s, (x, y) in pos.items():
    empty = s == "{}"
    face, edge = (C["fill_gray"], C["gray"]) if empty else (C["fill_blue"], C["navy"])
    w = 0.95 if len(s) < 3 else 1.25
    ax.add_patch(FancyBboxPatch((x - w / 2, y - 0.24), w, 0.48, boxstyle="round,pad=0.02,rounding_size=0.1",
                                fc=face, ec=edge, lw=1.2, zorder=3))
    ax.text(x, y, label(s), ha="center", va="center", fontsize=12, zorder=4,
            color=C["gray"] if empty else C["ink"])

notes = {0: "空集：不算菜单", 1: "只有一个选项的菜单", 2: "两个选项的菜单", 3: "全部三个选项"}
for level, text in notes.items():
    ax.text(5.65, 0.8 + 1.15 * level, text, ha="left", va="center", fontsize=10.5,
            color=C["gray"] if level == 0 else C["ink2"])

save(fig, "p09-subsets", lecture="lecture1")
