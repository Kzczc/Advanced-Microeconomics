# 写作规范（WRITING）

> 读者：数学基础几乎为零、英语不好、没有经济学背景的研究生。他会一页一页对照课件看我们的讲解，
> **只靠课件 + 我们的讲解就要能自学懂**。做不到这一点就是失败。

先读 `authoring/SPEC.md`（语法），再看样板 `content/lecture1/p03.md`（标准）。

---

## 一、七条硬规则

1. **讲，不是翻译。** 每页先说清“这一页要解决什么问题、为什么要讲它、和上一页什么关系”，再逐句读懂，
   再用例子讲透。把英文换成中文就交差的写法一律不合格。
2. **基础概念第一次出现必须讲清楚。** 集合、$\in$、$\subseteq$、$\forall$、$\exists$、$\Rightarrow$、$\iff$、
   函数、序列、收敛、凸集……本讲第一次用到时放在 `:::prereq` 里讲（三五句 + 一个小例子），并用
   `:go[…]{to="basics/…#…"}` 链接到数学基础页。不要假设读者“应该知道”。
3. **每个公式都要“读出来、拆开讲、说人话”：**
   - 用 LaTeX 重新排版（不贴图、不用 Unicode 符号凑）；
   - **读法**：这串符号怎么念（“$x$ 弱偏好于 $y$”）；
   - **逐个符号**说明含义（尤其是下标、上横线、量词）；
   - **大白话**一句话讲它的意思；
   - 抽象时配**数字例子**。
4. **推导和证明不跳步。** 先用大白话说“证明思路”；再用 `:::proof` 分步写，每一步写清“做了什么”，
   并用 `:why[…]` 标出依据（哪个定义、哪个假设、上一步的哪个结论）；最后说“这个证明用到了哪些假设，
   少了会怎样”。禁用“显然”“易知”“不难看出”“同理可得”（检查脚本会报）。
5. **每个新概念至少一个具体例子**（生活化 + 数字），能配反例就配反例。例子要真的算一遍，不要只说“比如……”。
6. **图要讲清楚。** 课件里的图：逐一说明坐标轴、每条曲线/区域/箭头代表什么，再说图想表达的结论。
   课件没有图但适合画图的概念（凸性、上等高集、无差异曲线、连续性失败……），**主动配图**：
   静态图用 `tools/figstyle.py` 画；已有交互组件（SPEC §5）的，在对应页嵌入。每张图都要有图注，
   正文里要引导读者“看图的什么地方”。
7. **公式不能只信 PDF 文字层。** `.work/text/*.txt` 会丢上横线、上下标、特殊符号（例：第 22 页
   “$(t,\bar y)$”在文字层里变成了“(t, y)”）。**每一页都必须打开 `.work/png/lecture1/p-NN.png` 逐字核对**；
   看不清就 `python3 tools/zoom.py slides/lecture1.pdf NN --box …` 放大。课件和讲义
   （`readings/reading1_choice_theory.pdf`，页图在 `.work/png/reading1/`）说法不一致、或课件有笔误时，
   用 `:::check` 写明两边各怎么写、以哪个为准、为什么。

## 二、每页的固定结构（小标题不能省）

```
### 这一页在讲什么        必有。2–5 句：本页的核心问题、它在整讲中的位置、与上一页的衔接。
### 先补基础              需要时有。:::prereq 框，讲本页用到、之前没讲过的数学或经济概念。
### 逐句读懂              必有。按课件顺序，每个要点：:::orig 原文 → 读法 / 意思 / 例子。
### （本页主体）           按内容取名：“命题 1 在说什么”“证明拆解”“图解”“为什么需要这个假设”……
### 例子                  必有（纯标题页、纯引言页除外）。
### 常见困惑              必有。:::pitfall，1–3 个最容易错或最困惑的点。
### 这一页的要点          必有。:::summary，不超过 3 条。
### 自测                  必有（标题页除外）。1–2 道题，::::quiz + :::answer，答案要带解析。
```

课件自己的结构也要保留：`Definition 3`、`Proposition 2` 等**原编号**写进方框标题，例如
`:::prop[命题 2（Proposition 2）]`、`:::def[定义 4：HARP（Houthakker 显示偏好公理）]`。

## 三、“逐句读懂”的写法

````
:::orig
Strict preference: $x \succ y$ if $x \succeq y$ but not $y \succeq x$.
:::

- **读法**：$x \succ y$ 读作“$x$ 严格偏好于 $y$”。
- **意思**：两个条件同时成立：① ……；② ……。合起来就是“$x$ 真的更好”。
````

- `:::orig` 里是**课件原文的准确转录**：英文照抄，公式用 LaTeX 重排，保留原来的编号和粗体。
- 下面的讲解用中文。专业词第一次出现写“中文（English）”并加提示：`:term[完备性]{k=completeness}`。
- 课件里的项目符号很多时，可以把相关几条合并成一个 `:::orig`，但每条都要讲到，不能漏。

## 四、语气与排版

- 像耐心的助教讲给学弟学妹听：短句，一段一个意思，多用“也就是说”“换句话说”“举个例子”。
- 先直观、后严格；先具体、后一般。
- 行内公式两侧与中文之间留一个空格（`偏好 $x\succeq y$ 表示`），英文单词两侧也留空格。
- 数学符号全部进 `$...$`；中文标点用全角；不要在 Markdown 里写 HTML 样式或颜色（样式由网站统一控制）。
- 篇幅：一般每页讲解 1000–2500 字；证明页、概念密集页可以更长；纯引言、行为经济学的叙述页 600–1200 字。
  宁可讲透，不要省略推理。

## 五、每页交付前的自查清单

- [ ] 对照页图逐字核对了所有公式、下标、上横线、量词、编号；与讲义不一致处写了 `:::check`
- [ ] 课件上的每一条内容都讲到了（没有漏掉任何一个项目符号）
- [ ] 所有第一次出现的符号/概念都有解释或 `:::prereq`
- [ ] 每个命题：说了“它在说什么 / 为什么成立 / 有什么用”；每个证明：思路 + 分步 + 理由
- [ ] 至少一个真正算过的例子；需要时配了图或交互组件，并在正文里引导读者看图
- [ ] 固定小标题齐全；结尾有要点和自测（带解析）
- [ ] `node tools/check_content.mjs content/lecture1/pNN.md` 没有 error
- [ ] 新术语写进了自己的 `content/glossary/<owner>.yaml`（key 不与他人重复）

## 六、反面示例（不要这样写）

> **Choice Rule**：$C(B;\succeq)$ 是 $B$ 中最偏好的元素的集合。有限的 $B$ 非空，无限的 $B$ 可能为空。

问题：只是翻译；没说 $C$、$B$、分号、大括号、“$\forall y\in B$”分别是什么；没说为什么有限就非空、
无限为什么可能为空；没有例子；读者看完还是不懂。

## 七、术语表归属（避免 key 冲突）

**统一 key（引用别人负责的术语时，照抄这里的 key）：**

- `basics.yaml`：`set` `element` `subset` `empty-set` `union` `intersection` `cartesian-product` `real-numbers`
  `function` `domain` `range` `increasing-function` `composite-function` `argmax` `binary-relation` `reflexivity`
  `sequence` `convergence` `epsilon-ball` `closed-set` `continuous-function` `countable` `convex-combination`
  `convex-set` `concave-function` `induction` `proof-by-contradiction` `iff` `for-all` `there-exists`
  `sufficient-condition` `necessary-condition`
- `lecture1-p03.yaml`：`choice-set` `weak-preference` `strict-preference` `indifference` `completeness`
  `transitivity` `rational-preference`
- `lecture1-a.yaml`：`rational-choice` `utility-maximization` `utilitarianism` `comparative-statics`
  `welfare-analysis` `framing-effect` `choice-rule`
- `lecture1-b.yaml`：`revealed-preference` `choice-function` `rationalize` `harp` `warp` `revealed-preference-relation`
- `lecture1-c.yaml`：`utility-function` `utility-representation` `lexicographic-preference` `continuity-preference`
  `ordinal-utility` `monotone-transformation` `interpersonal-comparison` `veil-of-ignorance` `just-noticeable-difference`
- `lecture1-d.yaml`：`monotonicity` `strict-monotonicity` `local-nonsatiation` `convex-preference`
  `strictly-convex-preference` `upper-contour-set` `quasi-concave` `strictly-quasi-concave` `separability`
  `quasi-linear` `numeraire` `wealth-effect`
- `lecture1-e.yaml`：`behavioral-economics` `context-dependence` `heuristic` `bounded-rationality` `anchoring`
  `coherent-arbitrariness` `default-effect` `opt-in-opt-out` `temptation`

需要的术语不在表里：加在自己负责的文件里，key 用英文短横线命名，并在最终回复里告诉主控。

**中文名对照：**

| 文件 | 负责的术语 |
|---|---|
| `glossary/basics.yaml` | 数学通用：集合、元素、子集、空集、并集/交集、笛卡尔积、函数、定义域、值域、单调递增、复合函数、argmax、二元关系、自反性、序列、收敛、极限、ε-邻域、闭集、连续函数、可数、凸组合、凸集、凹函数、数学归纳法、反证法、当且仅当、全称量词、存在量词、充分条件、必要条件 |
| `glossary/lecture1-p03.yaml` | 选择集、弱偏好、严格偏好、无差异、完备性、传递性、理性偏好 |
| `glossary/lecture1-a.yaml`（p01–p07） | 理性选择、效用最大化、功利主义、比较静态、福利分析、框架效应、选择规则、最优选择集 |
| `glossary/lecture1-b.yaml`（p08–p13） | 显示偏好、选择函数/选择规则（作为原始对象）、合理化、HARP、WARP、显示偏好关系 |
| `glossary/lecture1-c.yaml`（p14–p18） | 效用函数、效用表示、字典序偏好、偏好的连续性、序数效用、单调变换、人际比较、无知之幕、最小可觉差 |
| `glossary/lecture1-d.yaml`（p19–p22） | 单调性、严格单调、局部非饱和、凸偏好、严格凸偏好、上等高集、拟凹函数、严格拟凹、可分性、拟线性偏好、计价物、财富效应 |
| `glossary/lecture1-e.yaml`（p23–p29） | 行为经济学、情境依赖、启发式、有限理性、锚定效应、一致的任意性、默认选项效应、选择加入/选择退出、诱惑 |
