"""func-arrows: what is (and is not) a function, drawn as arrow diagrams.

(a) a function: every fruit sends exactly one arrow to a score; 4 is never hit.
(b) not a function: 香蕉 sends two arrows.
(c) not a function: 梨 sends no arrow.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyBboxPatch  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()

FRUITS = ["苹果", "香蕉", "橙子", "梨"]
SCORES = [4, 3, 2, 1]
LEFT_X, RIGHT_X = 1.0, 4.0
ROW_Y = [3.6, 2.6, 1.6, 0.6]


def score_y(score):
    """Vertical position of a score on the right column (4 at the top)."""
    return ROW_Y[SCORES.index(score)]


def draw_panel(ax, title, arrows, verdict, verdict_color, hit_scores):
    """Draw one arrow diagram. arrows = list of (fruit_index, score, color)."""
    ax.set_xlim(-0.2, 5.2)
    ax.set_ylim(-1.25, 4.75)
    ax.axis("off")
    for x0, fc, ec, label in [(LEFT_X, C["fill_teal"], C["teal"], "$X$（水果）"),
                              (RIGHT_X, C["fill_orange"], C["orange"], "$\\mathbb{R}$ 中的分数")]:
        ax.add_patch(FancyBboxPatch((x0 - 0.62, 0.1), 1.24, 4.0, boxstyle="round,pad=0.02,rounding_size=0.5",
                                    fc=fc, ec=ec, lw=1.2, zorder=1))
        ax.text(x0, 4.32, label, ha="center", va="center", fontsize=10.5, color=C["ink2"])
    for name, y in zip(FRUITS, ROW_Y):
        ax.text(LEFT_X, y, name, ha="center", va="center", fontsize=11.5, zorder=3)
    for score in SCORES:
        color = C["ink"] if score in hit_scores else C["muted"]
        ax.text(RIGHT_X, score_y(score), f"${score}$", ha="center", va="center", fontsize=12, color=color, zorder=3)
    for fruit_index, score, color in arrows:
        ax.annotate("", xy=(RIGHT_X - 0.3, score_y(score)), xytext=(LEFT_X + 0.42, ROW_Y[fruit_index]),
                    arrowprops=dict(arrowstyle="-|>", lw=1.6, color=color, mutation_scale=12,
                                    shrinkA=0, shrinkB=0), zorder=2)
    ax.text(2.5, 4.68, title, ha="center", va="center", fontsize=11.5)
    for k, line in enumerate(verdict):
        ax.text(2.5, -0.35 - 0.48 * k, line, ha="center", va="center", fontsize=10.5, color=verdict_color)


fig, axes = plt.subplots(1, 3, figsize=(10.2, 3.9))
fig.subplots_adjust(wspace=0.08)

navy = C["navy"]
draw_panel(axes[0], "（a）是函数",
           [(0, 3, navy), (1, 3, navy), (2, 2, navy), (3, 1, navy)],
           ["每个水果恰好一个箭头", "4 没人指到，也没关系"], C["teal"], {1, 2, 3})
draw_panel(axes[1], "（b）不是函数",
           [(0, 3, navy), (1, 3, C["red"]), (1, 4, C["red"]), (2, 2, navy), (3, 1, navy)],
           ["香蕉有两个箭头：", "它到底几分？说不清"], C["red"], {1, 2, 3, 4})
draw_panel(axes[2], "（c）不是函数",
           [(0, 3, navy), (1, 3, navy), (2, 2, navy)],
           ["梨没有箭头：", "它没有分数"], C["red"], {2, 3})
axes[2].text(LEFT_X + 0.75, ROW_Y[3], "？", ha="left", va="center", fontsize=14, color=C["red"])

save(fig, "func-arrows", lecture="basics")
