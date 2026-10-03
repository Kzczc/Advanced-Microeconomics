"""Render one PDF page (or a region of it) at high resolution, to read formulas
exactly instead of trusting the PDF text layer.

Usage:
    python3 tools/zoom.py slides/lecture1.pdf 22
    python3 tools/zoom.py slides/lecture1.pdf 22 --box 0 0.3 1 0.6 --dpi 500
    python3 tools/zoom.py readings/reading1_choice_theory.pdf 20 --box 0 0.4 1 0.75

--box takes fractions of the page: x0 y0 x1 y1, measured from the top-left.
The PNG is written to .work/zoom/ and its path is printed.
"""

import argparse
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def page_size_pts(pdf: Path, page: int) -> tuple[float, float]:
    info = subprocess.run(["pdfinfo", "-f", str(page), "-l", str(page), str(pdf)],
                          capture_output=True, text=True, check=True).stdout
    match = re.search(r"Page\s+\d+\s+size:\s+([\d.]+)\s+x\s+([\d.]+)", info) or \
        re.search(r"Page size:\s+([\d.]+)\s+x\s+([\d.]+)", info)
    return float(match.group(1)), float(match.group(2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("page", type=int)
    parser.add_argument("--box", type=float, nargs=4, metavar=("X0", "Y0", "X1", "Y1"))
    parser.add_argument("--dpi", type=int, default=400)
    args = parser.parse_args()

    pdf = Path(args.pdf)
    out_dir = ROOT / ".work" / "zoom"
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{pdf.stem}-p{args.page:02d}"
    cmd = ["pdftoppm", "-png", "-r", str(args.dpi), "-f", str(args.page), "-l", str(args.page),
           "-singlefile"]
    if args.box:
        width_pts, height_pts = page_size_pts(pdf, args.page)
        scale = args.dpi / 72.0
        x0, y0, x1, y1 = args.box
        cmd += ["-x", str(int(x0 * width_pts * scale)), "-y", str(int(y0 * height_pts * scale)),
                "-W", str(int((x1 - x0) * width_pts * scale)),
                "-H", str(int((y1 - y0) * height_pts * scale))]
        stem += "-box" + "-".join(f"{v:g}" for v in args.box)
    out = out_dir / stem
    subprocess.run(cmd + [str(pdf), str(out)], check=True)
    print(f"{out}.png")


if __name__ == "__main__":
    main()
