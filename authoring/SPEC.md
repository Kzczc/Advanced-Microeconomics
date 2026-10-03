# 技术规范（SPEC）

本仓库把微观经济学课件做成一个**逐页精讲的静态网站**，部署在 GitHub Pages：
`https://kzczc.github.io/Advanced-Microeconomics/`。读者是数学零基础、英语较弱、没有经济学背景的学生。

所有参与者（建站、交互组件、内容写作）都以本文件为准。**不要修改不属于自己任务的文件。**

---

## 1. 目录结构

```
slides/lecture1.pdf …            原始课件（只读）
readings/*.pdf                   配套讲义（只读）；reading1_choice_theory.pdf 对应第 1 讲
content/
  course.yaml                    课程结构：讲、节、每节包含哪些页
  home.md                        首页正文
  lecture1/index.md              第 1 讲导读页
  lecture1/p01.md … p29.md       每一页课件的精讲（一页一个文件）
  basics/<id>.md                 数学基础页（id 见 course.yaml 的 basics）
  symbols.md                     符号速查
  glossary/<owner>.yaml          术语表（多个文件，构建时合并；key 不能重复）
public/                          原样复制到网站根目录
  slides/lecture1/pNN.webp       课件页图（1400×1050）
  figures/lecture1/*.svg         静态插图（tools/figures/ 生成）
site/
  build.mjs                      构建脚本：content/ + public/ → dist/
  lib/spec.mjs                   扩展语法表（方框、指令、组件名）——构建与检查共用
  lib/katex-macros.json          KaTeX 宏
  assets/css/site.css            全站样式（建站负责）
  assets/css/widgets.css         交互组件样式（组件负责）
  assets/js/site.js              全站脚本（建站负责）
  assets/js/widgets/<name>.js    交互组件（组件负责）
tools/
  figstyle.py                    静态图统一风格（XeLaTeX 排字：Times + 宋体 + Times 数学）
  figures/<lecture>/<name>.py    每张静态图一个脚本
  zoom.py                        放大 PDF 某页/某区域，核对公式
  check_content.mjs              内容检查（KaTeX、指令、链接、禁用词）
.work/                           工作区，不提交：
  png/lecture1/p-NN.png          课件页高清图（220 dpi），写作时对照
  png/reading1/r-NN.png          讲义页图（110 dpi）
  text/*.txt                     PDF 文字层（**不可全信**，会丢上横线、上下标、符号）
dist/                            构建输出（不提交）
```

## 2. 网址与页面

所有链接都用**相对路径**（网站部署在子路径 `/Advanced-Microeconomics/` 下，本地用 `python3 -m http.server` 预览）。

| 页面 | 路径 | 来源 |
|---|---|---|
| 首页 | `index.html` | `content/home.md` + course.yaml |
| 第 N 讲导读 | `lectureN/index.html` | `content/lectureN/index.md` + course.yaml |
| 节页面 | `lectureN/<section-id>.html` | 该节所有 `pNN.md` |
| 某一页课件 | `lectureN/<section-id>.html#pNN` | 锚点 |
| 数学基础 | `basics/<id>.html` | `content/basics/<id>.md` |
| 符号速查 | `symbols.html` | `content/symbols.md` |
| 术语表 | `glossary.html` | `content/glossary/*.yaml` |
| 搜索索引 | `search-index.json` | 构建生成 |
| 术语数据 | `glossary.json` | 构建生成（提示框用） |

## 3. Markdown 写法

标准 Markdown + GFM 表格 + 以下扩展（定义在 `site/lib/spec.mjs`）。

### 3.1 公式（KaTeX，构建时渲染，浏览器不再计算）

- 行内：`$x \succeq y$`；独立一行：`$$ ... $$`（`$$` 单独成行）。
- 宏：`\R` = $\mathbb{R}$，`\N` = $\mathbb{N}$。其余一律写标准 LaTeX。
- 课件符号约定：弱偏好 `\succeq`（⪰）、严格偏好 `\succ`、无差异 `\sim`、显示偏好 `\succeq_c`。
- **正文里不要直接打 Unicode 数学符号**（⪰ ∈ ∀ ⇒ …），一律写进 `$...$`。检查脚本会警告。

### 3.2 方框（容器指令）

```
:::def[完备性 Completeness]
对 $X$ 中任意两个选项 $x,y$，……
:::
```

| 名字 | 标签 | 用途 |
|---|---|---|
| `def` | 定义 | 课件或补充的正式定义 |
| `prop` | 命题 | 命题、定理（标题写原编号，如“命题 1（Proposition 1）”） |
| `intuition` | 直观理解 | 大白话、类比、图像化解释 |
| `example` | 例子 | 具体例子、数字例子、反例（楷体排版由 CSS 决定，写作者不用管） |
| `pitfall` | 易错点 | 常见误解、容易混淆的地方 |
| `prereq` | 先补基础 | 本页用到的基础知识（集合、函数、极限……） |
| `proof` | 证明拆解 | 分步证明，每步配 `:why[理由]` |
| `orig` | 课件原文 | 课件英文原文的**准确转录**（公式用 LaTeX 重排） |
| `note` | 补充 | 讲义里有、课件没展开的内容 |
| `check` | 核对 | 课件与讲义不一致、课件笔误、文字层与图片不一致等 |
| `summary` | 要点 | 本页要点（每页结尾） |
| `quiz` | 自测 | 自测题，内部必须嵌一个 `answer` |

方括号里的标题可省略。方框里可以嵌套其他方框，外层用更多冒号：

```
::::quiz[判断题]
题目……
:::answer
答案和解析……
:::
::::
```

### 3.3 插图与交互组件（叶子指令，单独一行）

```
::fig{src="figures/lecture1/p19-convexity.svg" caption="凸偏好：上等高集是凸集" alt="三幅图对比" width="90"}
::widget{name="upper-contour" caption="拖动 α，看上等高集怎么变"}
```

- `fig.src` 相对 `public/`；`width` 是占正文宽度的百分比（默认 100）。图号由构建自动编。
- `widget.name` 必须是 `spec.mjs` 里 `WIDGETS` 列出的名字；`opts` 可传 JSON 字符串（组件自己解析）。

### 3.4 行内指令

| 写法 | 效果 |
|---|---|
| `:term[完备性]{k=completeness}` | 带下划虚线，悬停/点按弹出术语解释（来自术语表） |
| `:en[completeness]` | 英文术语样式 |
| `:go[凸集]{to="basics/convexity#convex-set"}` | 站内链接；`to` 可为 `basics/<id>#<anchor>`、`lecture1#p05`、`symbols`、`glossary`、`index` |
| `:slide[第 5 页]{n=5}` | 链接到本讲第 5 页 |
| `:why[由传递性]` | 证明步骤右侧的“理由”小标签 |
| `:hl[重点]` | 高亮 |

注意：英文冒号紧跟字母会被当成指令（如 `a:b`）。正文用中文冒号“：”即可避免。

### 3.5 数学基础页的固定锚点

数学基础页用 `## 标题 {#anchor}` 写二级标题，锚点**必须**是下面这些（讲义页会提前链接它们）：

- `basics/sets-logic`：`set` `subset` `set-builder` `cardinality` `real-numbers` `cartesian` `logic` `quantifiers` `iff-proof` `induction` `contradiction`
- `basics/functions-relations`：`function` `image-range` `increasing` `composition` `argmax` `relation` `relation-properties` `order`
- `basics/sequences-continuity`：`sequence` `limit` `distance-ball` `closed-set` `continuity-function` `countable`
- `basics/convexity`：`convex-combination` `convex-set` `upper-contour` `concave` `quasi-concave` `strict`

### 3.6 每页课件文件（`content/lectureN/pNN.md`）

```
---
slide: 3
title_en: "Preferences"                       # 课件原标题，照抄
title_zh: "偏好：用一个符号描述“谁比谁好”"      # 中文标题，说清主题（不是直译）
summary: "……一句话概括，≤ 45 字……"
---

### 这一页在讲什么
……
```

- 文件里只能用 `###` 和 `####` 标题（`#` 是节标题，`##` 是本页标题，由构建生成）。
- 写作规范见 `authoring/WRITING.md`，样板见 `content/lecture1/p03.md`。

### 3.7 术语表（`content/glossary/<owner>.yaml`）

```yaml
- k: completeness            # 英文短横线命名，全站唯一
  zh: 完备性
  en: Completeness
  short: "任意两个选项都能比较：$x\\succeq y$ 或 $y\\succeq x$（或两者都成立）。"
  where: lecture1#p03         # 首次讲解的位置（可选）
```

`short` 可含 Markdown 和公式（YAML 里反斜杠要写两个，或用单引号字符串）。每人只写自己文件；key 冲突构建报错。

## 4. 视觉规范

### 4.1 字体（用户明确要求：Times New Roman + 宋体）

```css
--font-body: "Times New Roman", Times, "Nimbus Roman", "TeX Gyre Termes", "Liberation Serif",
             "Songti SC", "STSong", "SimSun", "宋体", "Noto Serif CJK SC", "Source Han Serif SC", serif;
```

全站正文、标题、方框内文字、按钮都用这一套（拉丁字母走 Times，中文走宋体）。例子框用楷体：
`--font-kai: "Times New Roman", Times, "Kaiti SC", "STKaiti", "KaiTi", "楷体", "LXGW WenKai", serif;`
公式用 KaTeX 自带字体，字号约为正文的 1.05 倍。

### 4.2 颜色（CSS 变量；静态图 `tools/figstyle.py` 的 `C` 与交互组件使用同一套）

| 变量 | 值 | 用途 |
|---|---|---|
| `--bg` | `#f6f4ef` | 页面底色（暖白纸色） |
| `--paper` | `#ffffff` | 卡片、正文栏 |
| `--ink` | `#1d2433` | 正文 |
| `--ink-2` | `#4a5263` | 次要文字 |
| `--muted` | `#8a90a0` | 说明文字 |
| `--line` | `#e3dfd6` | 分割线、边框 |
| `--accent` | `#1f4e8c` | 主色（深蓝） |
| `--accent-2` | `#b5452f` | 强调（砖红） |
| `--navy` `#1f4e8c` · `--blue` `#3b73c4` · `--red` `#c0392b` · `--teal` `#0f7b6c` · `--orange` `#d97706` · `--purple` `#6d28d9` · `--green` `#2f7d32` · `--gray` `#6b7280` |||
| `--fill-blue` `#dbe7f6` · `--fill-red` `#f8dcd8` · `--fill-teal` `#d5efe9` · `--fill-orange` `#fdecd3` · `--fill-gray` `#eceae4` · `--fill-purple` `#ebe4fb` |||

方框配色（边框色 / 底色）：def 深蓝 `#1f4e8c`/`#eef3fa`；prop 紫 `#5b3f99`/`#f3effa`；intuition 青 `#0f7b6c`/`#eaf6f3`；
example 绿 `#2f7d32`/`#eef7ee`；pitfall 琥珀 `#b26a00`/`#fff6e8`；prereq 橙 `#c2410c`/`#fff1ea`；proof 灰蓝 `#475569`/`#f4f6f9`；
orig 灰 `#6b7280`/`#fafaf7`；note 天蓝 `#0369a1`/`#eef7fc`；check 红 `#b91c1c`/`#fdf0f0`；summary 深蓝 `#1f4e8c`/`#f1f5fb`；quiz 紫 `#7c3aed`/`#f6f2fe`。

### 4.3 版式

- 顶栏（固定，56px）：站名、面包屑、搜索按钮（`/` 或 `Ctrl/⌘+K`）、字号 A−/A+、窄屏的目录按钮。
- 左栏（≥1200px 常驻，272px，自身可滚动）：讲 → 节 → 本节各页标题；滚动时高亮当前页（scrollspy）。另有“数学基础 / 符号速查 / 术语表”入口。窄屏变抽屉。
- 节页面：每页课件是一个 `section.slide-block#pNN`，宽屏两栏——左侧课件图 **sticky 固定**（读长讲解时图一直可见），右侧讲解（最大约 720px 宽）；<1024px 变上下排。
- 课件图下方：“第 3 / 29 页 · Preferences”+ 放大按钮；点击图打开灯箱（← → 切换本页面内的课件，Esc 关闭）。
- 讲解栏顶部：小字“第 3 页”，二级标题 = `title_zh`，下方英文原标题与一句话概括。
- 节页面底部：上一节/下一节。
- 正文：字号 17px（可调 15–21px），行高约 1.9，段距 0.8em，左对齐。

### 4.4 流畅度（用户明确抱怨过“下滑不流畅”）

- 公式构建时渲染；**不要**在浏览器端跑 KaTeX/MathJax。
- 图片写明 `width`/`height`，除首屏外 `loading="lazy" decoding="async"`。
- 滚动监听用 `IntersectionObserver`，不要在 `scroll` 事件里做布局计算。
- 不用 `backdrop-filter`、大面积阴影、滚动驱动的动画；交互组件进入视口附近才加载（动态 `import()`）。
- 字体只用本机字体（不下载中文网络字体）；KaTeX 只带 woff2。

## 5. 交互组件接口

- 文件：`site/assets/js/widgets/<name>.js`，ES module，导出 `export function mount(stage, opts)`。
- 构建生成的 HTML：
  ```html
  <figure class="widget" data-widget="pref-checker" data-opts="{}">
    <div class="widget-stage"><p class="widget-loading">交互图加载中…</p></div>
    <figcaption>交互图 1：……</figcaption>
  </figure>
  ```
  `site.js` 在组件进入视口附近时 `import()` 对应模块，调用 `mount(stage, opts)`：`stage` 是 `.widget-stage` 元素（组件先清空它再渲染），
  `opts` 是 `data-opts` 解析出的对象（可能为 `{}`）。组件不得改动 `figcaption` 与 `stage` 以外的 DOM。
- 纯原生 JS + SVG（或 Canvas），**不引入任何库**；指针事件（鼠标和触屏都能拖）；响应式（`viewBox`，宽 100%）；拖动时用 `requestAnimationFrame`。
- 文字用中文，变量用 Times 斜体（CSS 类 `w-var`）。颜色只用 §4.2 的变量。样式写在 `site/assets/css/widgets.css`，类名以 `w-` 开头。
- 组件要“讲道理”：状态面板用一两句中文说明当前结论（例如“传递性不成立：$a\succeq b$、$b\succeq c$，但 $a \succeq c$ 不成立”），不要只给 ✓/✗。

| 名字 | 用在 | 功能 |
|---|---|---|
| `pref-checker` | p03, p04 | 三个选项（苹果 a、香蕉 b、橙子 c）；对每一对选“a 更好 / 一样好 / b 更好 / 说不出”；判断完备性、传递性，指出违反的链条；满足时显示排序（如 a ≻ b ∼ c）；三角形关系图；预设：理性例子、循环、不完备 |
| `choice-rule` | p05 | 5 个水果的固定偏好（含并列）；勾选组成 B，高亮 $C(B;\succeq)$；另一模式：$B=[0,1)$、数越大越好，滑块选 $x$，提示总有更好的 $(x+1)/2$，说明 $C(B)=\varnothing$ |
| `harp-checker` | p09–p12 | $X=\{x,y,z\}$；为 {x,y}、{x,z}、{y,z}、{x,y,z} 各勾选 $C(A)$（非空）；检查 HARP 并用中文列出违反；给出显示偏好 $\succeq_c$ 的 3×3 表；满足时给出一个能“解释”这些选择的排序；预设若干 |
| `utility-transform` | p14, p16 | 4 个选项的排序与效用值；选择变换 $v(t)$：$t$、$2t+1$、$t^3$、$e^t$、$-t$；柱状图显示新效用；递增变换保持排序、$-t$ 颠倒排序 |
| `lexi-continuity` | p15 | 平面上 $y=(0,1)$ 与序列 $x_n=(1/n,0)$；滑块 $n$；字典序下 $x_n\succ y$ 对所有 $n$，但极限 $(0,0)\prec y$——连续性失败；附“字典序比较器”：点两个点，说明按第一分量、再按第二分量比较 |
| `diagonal-utility` | p16 | 可拖动的点 $x\in\R^2_+$；偏好可选：$\sqrt{x_1x_2}$、$x_1+x_2$、$\min\{x_1,x_2\}$；画出经过 $x$ 的无差异曲线与 45° 线交点 $(\alpha,\alpha)$，显示 $u(x)=\alpha(x)$ |
| `upper-contour` | p19, p20 | 函数可选：$x_1x_2$、$\sqrt{x_1}+\sqrt{x_2}$、$\min\{x_1,x_2\}$、$x_1^2+x_2^2$；滑块 $\alpha$；阴影显示 $U_\alpha=\{x: f(x)\ge\alpha\}$；两个可拖动点及连线，判断线段是否整段留在 $U_\alpha$ 内（跑出去的部分标红），据此说明是否拟凹 |
| `qc-1d` | p20 | 一元函数：钟形 $e^{-(x-5)^2/4}$（拟凹不凹）、$\sqrt{x}$（凹）、双峰（非拟凹）；两个可拖动点 $x,y$、滑块 $\lambda$；比较 $f(\lambda x+(1-\lambda)y)$ 与 $\min\{f(x),f(y)\}$ |
| `quasilinear` | p22 | 横轴非货币商品 $y$、纵轴钱 $a$；$u=a+v(y)$，$v(y)=4\sqrt{y}$；无差异曲线是彼此上下平移的；两个可拖动的选项 P、Q；滑块 $t$ 给两者都加 $t$ 元，显示效用值与排序不变（没有财富效应） |

## 6. 静态图

- 每张图一个脚本 `tools/figures/<lecture>/<name>.py`，开头 `sys.path.insert(0, 'tools')` 后 `from figstyle import C, setup, econ_axes, save`，结尾 `save(fig, "<name>", lecture="lecture1")`。
- 命名：`pNN-<描述>`（如 `p19-convexity`）；导读页用 `overview-<描述>`。
- 输出 `public/figures/lecture1/<name>.svg`，预览 `.work/figpreview/lecture1-<name>.png`——**必须打开预览检查**：文字不重叠、不出界、配色一致、线条粗细一致（曲线 2pt，辅助线 1pt 虚线）。
- 图中文字：中文 + `$...$` 公式可混排（XeLaTeX 排版）。字号 10–12pt。宽度一般 5.5–6.5 英寸，多面板不超过 9 英寸。

## 7. 构建与检查

```
node tools/check_content.mjs [files…]   # 内容检查
npm run build                          # 生成 dist/
npm run serve                          # http://127.0.0.1:8766/
```

截图检查可用本机 Chrome：`google-chrome --headless=new --disable-gpu --window-size=1440,900 --screenshot=/tmp/x.png http://127.0.0.1:8766/lecture1/preferences.html`。
