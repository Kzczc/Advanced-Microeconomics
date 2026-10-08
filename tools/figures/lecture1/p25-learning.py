"""p25-learning: a rule of thumb that learns from past success gets close to optimal only
when the same decision is repeated (simulated, illustrative).

2000 simulated commuters choose between two subway routes every day. Route B is 6 minutes
faster on average, but daily times are noisy. Rule: try both routes once, then take the route
whose past average was faster, and on 1 day in 10 try the other one.
"""

import sys

sys.path.insert(0, "tools")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from figstyle import C, save, setup  # noqa: E402

setup()
rng = np.random.default_rng(25)

PEOPLE, DAYS = 2000, 40
MEAN = np.array([40.0, 34.0])
SD = 8.0
EXPLORE = 0.1

total = np.zeros((PEOPLE, 2))
count = np.zeros((PEOPLE, 2))
share_b = np.zeros(DAYS)
first = rng.integers(0, 2, PEOPLE)
for day in range(DAYS):
    if day < 2:
        pick = first if day == 0 else 1 - first
    else:
        avg = total / count
        pick = np.where(avg[:, 1] < avg[:, 0], 1, 0)
        flip = rng.random(PEOPLE) < EXPLORE
        pick = np.where(flip, 1 - pick, pick)
    times = rng.normal(MEAN[pick], SD)
    total[np.arange(PEOPLE), pick] += times
    count[np.arange(PEOPLE), pick] += 1
    share_b[day] = pick.mean()

days = np.arange(1, DAYS + 1)
fig, ax = plt.subplots(figsize=(7.2, 3.9))
ax.axvspan(0.5, 2.5, color=C["fill_orange"], lw=0, zorder=0)
ax.axhline(100, color=C["teal"], lw=1.0, ls=(0, (4, 3)))
ax.text(DAYS, 101.5, "最优：天天走更快的 B 线", ha="right", va="bottom", fontsize=10, color=C["teal"])
ax.plot(days, share_b * 100, color=C["navy"], lw=2, marker="o", ms=3.2, zorder=3)
ax.set_xlim(0.5, DAYS + 0.5)
ax.set_ylim(40, 108)
ax.set_xticks([1, 5, 10, 20, 30, 40])
ax.set_yticks([50, 60, 70, 80, 90, 100])
ax.set_yticklabels([f"{v}\\%" for v in [50, 60, 70, 80, 90, 100]])
ax.set_xlabel("第几次做这个决定（上班的第几天）")
ax.set_ylabel("选到更快路线的人所占比例")
ax.annotate("前两天还没经验，只有一半人走对；\n一次性的决定，永远停在这一段", (2, share_b[1] * 100), xytext=(6.5, 52),
            textcoords="data", ha="left", va="center", fontsize=10, color=C["orange"], linespacing=1.4,
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["orange"], shrinkA=2, shrinkB=4))
ax.annotate("做得越多，越接近最优", (26, share_b[25] * 100), xytext=(24, 72), textcoords="data",
            ha="left", va="center", fontsize=10.5, color=C["navy"],
            arrowprops=dict(arrowstyle="-", lw=0.8, color=C["navy"], shrinkA=2, shrinkB=4))
ax.text(DAYS, 41.5, "模拟 2000 名通勤者（示意）", ha="right", va="bottom", fontsize=9.5, color=C["ink2"])

save(fig, "p25-learning", lecture="lecture1")
