# 高级微观经济学 · 逐页精讲

面向数学零基础、英语较弱、没有经济学背景的同学的课件复习站（Siguang Li, HKUST(GZ)）。
每一页课件配一段中文精讲：先说这一页要解决什么问题，再逐句读懂原文和公式，然后用例子、图和交互小实验讲透。

在线地址：<https://kzczc.github.io/Advanced-Microeconomics/>

## 本地预览

```bash
npm ci
npm run build          # 生成 dist/
npm run serve          # 打开 http://127.0.0.1:8766/
```

## 仓库结构

- `slides/`、`readings/`：原始课件与配套讲义 PDF
- `content/`：全部讲解内容（Markdown）
  - `course.yaml`：课程结构（讲 → 部分 → 每部分包含哪些页）
  - `lecture1/pNN.md`：第 1 讲每一页课件的精讲
  - `basics/*.md`：数学基础（集合与逻辑、函数与关系、序列与连续、凸性）
  - `glossary/*.yaml`：术语表；`symbols.md`：符号速查
- `public/`：课件页图（`slides/`）与静态插图（`figures/`），原样复制到网站
- `site/`：构建脚本 `build.mjs`、样式、脚本与交互组件
- `tools/`：内容检查 `check_content.mjs`、插图脚本 `figures/`、放大课件的 `zoom.py`
- `authoring/`：写作规范（`WRITING.md`）与技术规范（`SPEC.md`）

## 写作与检查

```bash
node tools/check_content.mjs                 # 检查全部内容：公式、指令、链接、禁用词
python3 tools/figures/lecture1/p19-convexity.py   # 重新生成某张插图
```

公式在构建时由 KaTeX 排版，浏览器端不做公式计算；推送到 `main` 后由 GitHub Actions 自动构建并发布到 GitHub Pages。
