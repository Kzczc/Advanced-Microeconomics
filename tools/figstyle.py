"""Shared style for every static figure on the site.

All text in figures is typeset by XeLaTeX (matplotlib's PGF backend):
Latin text in TeX Gyre Termes (a Times clone), Chinese in Noto Serif CJK SC
(a Song/宋体 style face), math in TeX Gyre Termes Math. Figures are saved as
PDF, converted to SVG with pdftocairo (text becomes outlines, so it renders
identically in every browser), and a PNG preview is written for review.

Typical use inside tools/figures/<lecture>/<name>.py:

    from figstyle import C, setup, econ_axes, save
    setup()
    fig, ax = plt.subplots(figsize=(5.6, 3.8))
    ...
    save(fig, "p19-convexity", lecture="lecture1")
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

import matplotlib as mpl

mpl.use("pgf")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
FIG_DIR = ROOT / "public" / "figures"
PREVIEW_DIR = ROOT / ".work" / "figpreview"

# One palette for figures, widgets and CSS boxes (see authoring/SPEC.md).
C = dict(
    ink="#1d2433",
    ink2="#4a5263",
    muted="#8a90a0",
    grid="#e7e4dc",
    navy="#1f4e8c",
    blue="#3b73c4",
    red="#c0392b",
    teal="#0f7b6c",
    orange="#d97706",
    purple="#6d28d9",
    green="#2f7d32",
    gray="#6b7280",
    fill_blue="#dbe7f6",
    fill_red="#f8dcd8",
    fill_teal="#d5efe9",
    fill_orange="#fdecd3",
    fill_gray="#eceae4",
    fill_purple="#ebe4fb",
)

PREAMBLE = "\n".join(
    [
        r"\usepackage{fontspec}",
        r"\usepackage{unicode-math}",
        r"\setmainfont{TeX Gyre Termes}",
        r"\setmathfont{TeX Gyre Termes Math}",
        r"\usepackage{xeCJK}",
        r"\setCJKmainfont{Noto Serif CJK SC}",
    ]
)


def setup() -> None:
    """Apply the site-wide matplotlib style. Call once at the top of a script."""
    mpl.rcParams.update(
        {
            "pgf.texsystem": "xelatex",
            "pgf.rcfonts": False,
            "pgf.preamble": PREAMBLE,
            "font.family": "serif",
            "font.size": 11,
            "text.color": C["ink"],
            "axes.edgecolor": C["ink2"],
            "axes.linewidth": 0.9,
            "axes.labelcolor": C["ink"],
            "axes.labelsize": 11.5,
            "axes.titlesize": 12,
            "axes.titlepad": 8,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "xtick.color": C["ink2"],
            "ytick.color": C["ink2"],
            "xtick.labelsize": 10,
            "ytick.labelsize": 10,
            "xtick.direction": "out",
            "ytick.direction": "out",
            "xtick.major.size": 3,
            "ytick.major.size": 3,
            "lines.linewidth": 2.0,
            "lines.solid_capstyle": "round",
            "legend.frameon": False,
            "legend.fontsize": 10,
            "figure.figsize": (6.0, 4.0),
            "savefig.transparent": True,
        }
    )


def econ_axes(ax, xlim, ylim, xlabel=None, ylabel=None, ticks=False):
    """Textbook-style axes: two arrows from the origin, labels at the arrow tips.

    xlim/ylim are (min, max) data ranges. With ticks=False (default) no tick
    labels are drawn, which is what most economics diagrams want.
    """
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    for side in ("left", "bottom", "top", "right"):
        ax.spines[side].set_visible(False)
    if not ticks:
        ax.set_xticks([])
        ax.set_yticks([])
    arrow = dict(arrowstyle="-|>", lw=1.0, color=C["ink2"], shrinkA=0, shrinkB=0,
                 mutation_scale=11)
    ax.annotate("", xy=(xlim[1], ylim[0]), xytext=(xlim[0], ylim[0]), arrowprops=arrow,
                annotation_clip=False)
    ax.annotate("", xy=(xlim[0], ylim[1]), xytext=(xlim[0], ylim[0]), arrowprops=arrow,
                annotation_clip=False)
    if xlabel:
        ax.annotate(xlabel, xy=(xlim[1], ylim[0]), xytext=(4, -4), textcoords="offset points",
                    ha="left", va="top", annotation_clip=False)
    if ylabel:
        ax.annotate(ylabel, xy=(xlim[0], ylim[1]), xytext=(-4, 4), textcoords="offset points",
                    ha="right", va="bottom", annotation_clip=False)
    return ax


def save(fig, name: str, lecture: str = "lecture1") -> Path:
    """Write public/figures/<lecture>/<name>.svg and a PNG preview for review."""
    out_dir = FIG_DIR / lecture
    out_dir.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    svg_path = out_dir / f"{name}.svg"
    with tempfile.TemporaryDirectory() as tmp:
        pdf_path = Path(tmp) / f"{name}.pdf"
        fig.savefig(pdf_path, bbox_inches="tight", pad_inches=0.05, transparent=True)
        subprocess.run(["pdftocairo", "-svg", str(pdf_path), str(svg_path)], check=True)
        subprocess.run(
            ["pdftoppm", "-png", "-r", "120", "-singlefile", str(pdf_path),
             str(PREVIEW_DIR / f"{lecture}-{name}")],
            check=True,
        )
    plt.close(fig)
    print(f"saved {svg_path.relative_to(ROOT)}  (preview: .work/figpreview/{lecture}-{name}.png)",
          file=sys.stderr)
    return svg_path
