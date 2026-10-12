"""og-cover: 1200x630 social-share image (site/assets/img/og-cover.png).

Run from the repository root after the p01-triangle figure exists:
    python3 tools/figures/site/og-cover.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
REG = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc"
BOLD = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"
SC = 2  # face index of "Noto Serif CJK SC" inside the .ttc collections

W, H = 1200, 630
img = Image.new("RGB", (W, H), "#f6f4ef")
draw = ImageDraw.Draw(img)
draw.rectangle([0, 0, 14, H], fill="#1f4e8c")
draw.rectangle([14, 0, 20, H], fill="#b5452f")

title = ImageFont.truetype(BOLD, 66, index=SC)
sub = ImageFont.truetype(REG, 26, index=SC)
small = ImageFont.truetype(REG, 27, index=SC)
url = ImageFont.truetype(REG, 23, index=SC)
draw.text((70, 64), "高级微观经济学", font=title, fill="#1d2433")
draw.text((70, 150), "逐页精讲", font=title, fill="#1f4e8c")
draw.text((72, 252), "Advanced Microeconomics · Slide-by-slide Notes", font=sub, fill="#4a5263")
lines = ["写给零基础读者：课件逐页讲解", "每页配例子、配图和交互小实验", "选择理论 · 消费者理论 · 不确定性"]
for i, line in enumerate(lines):
    draw.text((72, 336 + 46 * i), line, font=small, fill="#4a5263")
draw.text((72, 560), "kzczc.github.io/Advanced-Microeconomics", font=url, fill="#8a90a0")

fig = ROOT / ".work" / "figpreview" / "lecture1-p01-triangle.png"
if fig.exists():
    pic = Image.open(fig).convert("RGBA")
    pic.thumbnail((450, 250))
    card = Image.new("RGB", (pic.width + 28, pic.height + 28), "#ffffff")
    card.paste(pic, (14, 14), pic)
    x, y = W - card.width - 46, H - card.height - 46
    draw.rectangle([x - 1, y - 1, x + card.width, y + card.height], outline="#d4cec2", width=2)
    img.paste(card, (x, y))

out = ROOT / "site" / "assets" / "img" / "og-cover.png"
img.save(out, optimize=True)
print(f"saved {out.relative_to(ROOT)}")
