---
title_zh: 定义与命题速查
---

本讲出现的全部定义、命题，以及几个课件没有编号、但后面反复要用的概念，按页码排在一页上。每一条依次是：课件原文、中文意思、一个例子（或反例）、讲解所在的页。课件没有编号的概念标“未编号”。课件的编号从定义 4 直接跳到定义 6，没有定义 5，这里照课件编号。

“每页一句话”在本页最后：本讲 29 页，每页一句话，适合考前从头扫一遍。

## 一、偏好与选择规则（第 3–7 页） {#preferences}

### 三个基本符号：弱偏好、严格偏好、无差异（未编号） {#notation}

:::orig
Weak preference: $x \succeq y \iff$ “$x$ at least as good as $y$”.

Strict preference: $x \succ y$ if $x \succeq y$ but not $y \succeq x$.

Indifference: $x \sim y$ if $x \succeq y$ and $y \succeq x$.
:::

- **意思**：$x\succeq y$ 读作“$x$ 不比 $y$ 差”（可能更好，也可能一样好），叫 :term[弱偏好]{k=weak-preference}。另外两个都由它定义：$x\succ y$ 是“$x$ 真的更好”，叫 :term[严格偏好]{k=strict-preference}；$x\sim y$ 是“一样好”，叫 :term[无差异]{k=indifference}。
- **例子**：小王觉得牛肉面和盖浇饭一样好，都比白粥好。写成符号：面 $\sim$ 饭，面 $\succ$ 粥，饭 $\succ$ 粥；由此也有面 $\succeq$ 饭、饭 $\succeq$ 面、面 $\succeq$ 粥。
- **详见**：:slide[第 3 页]{n=3}

### 定义 1：完备性（Completeness） {#def1}

:::orig
**Definition 1 (Completeness)** For all $x, y \in X$, either $x \succeq y$ or $y \succeq x$, or both.
:::

- **意思**：任意两个选项都能比较：$x\succeq y$ 和 $y\succeq x$ 至少有一个成立，两个都成立就是一样好。不允许“没法比”。这叫 :term[完备性]{k=completeness}。
- **反例**：问小王牛肉面和盖浇饭哪个不差，他可以说“一样好”，但如果他说“这两样没法比”，他的偏好就不完备。
- **详见**：:slide[第 3 页]{n=3}

### 定义 2：传递性（Transitivity） {#def2}

:::orig
**Definition 2 (Transitivity)** If $x \succeq y$ and $y \succeq z$, then $x \succeq z$.
:::

- **意思**：“不比……差”可以接力：$x$ 不比 $y$ 差、$y$ 不比 $z$ 差，那么 $x$ 不比 $z$ 差。这叫 :term[传递性]{k=transitivity}。完备性加传递性，合称 :term[理性偏好]{k=rational-preference}。
- **例子**：面 $\succeq$ 饭、饭 $\succeq$ 粥，就必须有面 $\succeq$ 粥。第 4 页的框架效应（同样省 5 美元，态度却不同）是课件给的违反传递性的例子。
- **详见**：:slide[第 3 页]{n=3}、:slide[第 4 页]{n=4}

### 最优选择集 $C(B;\succeq)$（未编号） {#choice-set}

:::orig
$$
C(B;\succeq)=\{\,x\in B \mid x\succeq y\ \ \forall y\in B\,\}
$$

$C(B;\succeq)$ = set of most-preferred items in $B$.

Finite $B$: non-empty. Infinite $B$: may be empty.
:::

- **意思**：给一份菜单 $B$，$C(B;\succeq)$ 是菜单里“不比任何一个选项差”的那些选项，也就是最喜欢的那些，可能不止一个。这叫 :term[最优选择集]{k=optimal-choice-set}。菜单有限时它一定非空；菜单无限时可能是空集。
- **例子**：$B=\{\text{面},\text{饭},\text{粥}\}$，面 $\sim$ 饭 $\succ$ 粥，那么 $C(B;\succeq)=\{\text{面},\text{饭}\}$。空集的例子：允许你拿走不到 1 元的任意金额（区间 $(0,1)$），钱越多越好，可是没有“最多”的那个金额，$C$ 是空集。
- **详见**：:slide[第 5 页]{n=5}

### 命题 1：理性偏好保证的两件事 {#prop1}

:::orig
**Proposition 1.** If $\succeq$ is complete and transitive:

1. For every finite non-empty $B$, $C(B;\succeq)\neq\varnothing$.
2. If $x,y\in A\cap B$, $x\in C(A;\succeq)$, $y\in C(B;\succeq)$, then $x\in C(B;\succeq)$ and $y\in C(A;\succeq)$.
:::

- **意思**：偏好理性时，（1）有限、非空的菜单上总能选出最好的；（2）$x$、$y$ 在两份菜单上都有，$x$ 是 $A$ 里最好的之一、$y$ 是 $B$ 里最好的之一，那么 $x$ 在 $B$ 里、$y$ 在 $A$ 里也都是最好的之一。
- **例子**：$A=\{\text{面},\text{饭},\text{粥}\}$ 里面是最好的之一，$B=\{\text{面},\text{饭}\}$ 里饭是最好的之一。由（2），面和饭在两份菜单里都是最好的之一，说明面 $\sim$ 饭。
- **详见**：:slide[第 6 页]{n=6}（证明在 :slide[第 7 页]{n=7}）

## 二、显示偏好（第 8–13 页） {#revealed}

### 定义 3：选择规则（choice rule） {#def3}

:::orig
**Definition 3.** Let $\mathcal{B}$ = collection of subsets of $X$. A choice rule is a function $C:\mathcal{B}\to\mathcal{B}$ with $C(B)\subseteq B$ for all $B\in\mathcal{B}$.
:::

- **意思**：$\mathcal{B}$ 是若干份菜单（$X$ 的子集）组成的集合。:term[选择规则]{k=choice-function}给每份菜单 $B$ 指定被选中的选项 $C(B)$，唯一的要求是只能从菜单上选：$C(B)\subseteq B$。它和 $C(B;\succeq)$ 不同：这里的 $C$ 是**观察到的**选择，不预设任何偏好。
- **例子**：记录到 $C(\{\text{面},\text{饭}\})=\{\text{面}\}$、$C(\{\text{面},\text{饭},\text{粥}\})=\{\text{面}\}$，这就是一个选择规则在两份菜单上的取值。
- **详见**：:slide[第 9 页]{n=9}

### 定义 4：HARP（Houthakker 显示偏好公理） {#def4}

:::orig
**Definition 4 (HARP).** A choice function $C:\mathcal{B}\to\mathcal{B}$ satisfies Houthakker's Axiom of Revealed Preference (HARP) if:

$$
x,y\in A\cap B,\ x\in C(A),\ y\in C(B)\ \Rightarrow\ x\in C(B),\ y\in C(A).
$$
:::

- **意思**：和命题 1 的第（2）条一字不差，只是把 $C(\cdot;\succeq)$ 换成了观察到的 $C(\cdot)$：$x$、$y$ 在两份菜单上都有，$x$ 在一份里被选、$y$ 在另一份里被选，那么两样在两份菜单里都应该被选。这就是 :term[HARP]{k=harp}。
- **反例**：$C(\{\text{面},\text{饭}\})=\{\text{面}\}$，但 $C(\{\text{面},\text{饭},\text{粥}\})=\{\text{饭}\}$。取 $x=$ 面、$y=$ 饭，HARP 要求面也在第二份菜单的选择里，实际没有，所以违反 HARP：多了一碗粥，他就从面改选了饭。
- **详见**：:slide[第 9 页]{n=9}

### 命题 2：能被理性偏好解释，当且仅当满足 HARP {#prop2}

:::orig
**Statement:** If $C:\mathcal{B}\to\mathcal{B}$ is non-empty, then there exists a complete and transitive $\succeq$ such that

$$
C(\cdot)=C(\cdot;\succeq)
$$

if and only if $C$ satisfies HARP.
:::

- **意思**：只要每份菜单他都会选点东西（$C$ 非空），那么“能找到一套理性偏好，正好解释他在每份菜单上的选择”和“他的选择满足 HARP”是一回事。所以要检验一个人是否理性，只需检查 HARP。
- **证明思路**：必要性直接用命题 1。充分性用他的选择定义显示偏好关系 $\succeq_c$（下一条），再证明 $\succeq_c$ 完备、传递，并且按 $\succeq_c$ 选正好还原 $C$。证明用到了每个两元素菜单 $\{x,y\}$ 和三元素菜单 $\{x,y,z\}$ 上的选择，所以默认这些菜单上的选择都观察得到。
- **详见**：:slide[第 10 页]{n=10}（证明在 :slide[第 11 页]{n=11}、:slide[第 12 页]{n=12}）

### 显示偏好关系 $\succeq_c$（未编号） {#revealed-relation}

:::orig
Define revealed preference relation:

$$
x\succeq_c y\quad\text{if there exists } A\subseteq X,\ y\in A,\ x\in C(A).
$$
:::

- **意思**：只要在某份有 $y$ 的菜单上看到他选了 $x$，就说“$x$ 被显示为不比 $y$ 差”。这是从选择**反推**出来的偏好，叫 :term[显示偏好关系]{k=revealed-preference-relation}。
- **例子**：看到 $C(\{\text{面},\text{饭},\text{粥}\})=\{\text{面}\}$，就得到面 $\succeq_c$ 饭、面 $\succeq_c$ 粥（以及面 $\succeq_c$ 面）。
- **详见**：:slide[第 11 页]{n=11}

### WARP（弱显示偏好公理，MWG 的表述） {#warp}

:::orig
HARP requires observing $C(A)$ for all $A\subseteq X$.

Real data: limited (e.g. only budget sets).

Weaker condition: **WARP** (Weak Axiom of Revealed Preference).
:::

- **表述**：如果某份菜单 $B\in\mathcal{B}$ 中 $x,y\in B$ 且 $x\in C(B)$，那么对任何 $B'\in\mathcal{B}$，只要 $x,y\in B'$ 且 $y\in C(B')$，就必须有 $x\in C(B')$。
- **意思**：:term[WARP]{k=warp} 和 HARP 的式子一样，区别只在能检查的菜单范围：HARP 要看所有菜单上的选择，WARP 只在观察到的菜单上检查。现实数据往往只有预算集上的选择，所以只能用 WARP；它要求少，推出的结论也少：数据不全时，满足 WARP 也不一定能被理性偏好解释。
- **详见**：:slide[第 13 页]{n=13}

## 三、效用函数（第 14–17 页） {#utility}

### 效用表示（未编号） {#representation}

:::orig
$u:X\to\R$ represents $\succeq$ if

$$
x\succeq y\ \iff\ u(x)\ge u(y).
$$

Then choice: $C(B;\succeq)=\arg\max_{y\in B}u(y)$.
:::

- **意思**：给每个选项打一个分 $u(x)$，分数的高低顺序和偏好完全一致，就说 $u$ 表示 $\succeq$，这叫 :term[效用表示]{k=utility-representation}。这时“选最好的”就是“选分数最高的”。
- **例子**：面 $\sim$ 饭 $\succ$ 粥，可以取 $u(\text{面})=u(\text{饭})=2$、$u(\text{粥})=1$；取 $10,10,3$ 也一样。分数只有顺序有意义，数值本身没有意义。
- **详见**：:slide[第 14 页]{n=14}

### 命题 3：选项有限时，理性偏好一定能用效用表示 {#prop3}

:::orig
**Proposition 3.** If $X$ is finite, any complete and transitive $\succeq$ can be represented by some $u$.
:::

- **意思**：选项只有有限个时，任何完备、传递的偏好都能找到效用函数来表示。证明思路是对选项个数归纳：最好的选项给最高分，再对剩下的选项重复。
- **注意**：选项有无限多个时就不一定了，见下面的字典序偏好。
- **详见**：:slide[第 14 页]{n=14}

### 字典序偏好：理性，却不能用效用表示（未编号） {#lexicographic}

:::orig
Example: **Lexicographic preferences**: prioritize $x_1$ before $x_2$.

No real-valued utility function exists.
:::

- **意思**：先比第一种商品，多者为好；第一种一样多时，才比第二种。准确地说，$x\succ y$ 当且仅当 $x_1>y_1$，或者 $x_1=y_1$ 且 $x_2>y_2$。这种 :term[字典序偏好]{k=lexicographic-preference}完备、传递，却找不到任何实值效用函数来表示它。
- **例子**：$(2,0)\succ(1,100)$：第一种商品多一点，第二种商品少得再多也不管。
- **详见**：:slide[第 15 页]{n=15}

### 定义 6：连续性（Continuity） {#def6}

:::orig
**Definition 6 (Continuity).** $\succeq$ continuous if $(x_n,y_n)\to(x,y)$ and $x_n\succeq y_n\ \forall n\Rightarrow x\succeq y$.
:::

- **意思**：“不比……差”在取极限时不会突然反转：每一对都有 $x_n$ 不比 $y_n$ 差，那么极限 $x$ 也不比极限 $y$ 差。这叫偏好的 :term[连续性]{k=continuity-preference}。
- **反例**：字典序偏好不连续。取 $x_n=(1+\tfrac1n,\ 0)$、$y_n=(1,1)$：每个 $n$ 都有 $x_n\succ y_n$（第一种商品多），可是极限 $(1,0)$ 比 $(1,1)$ 差。
- **详见**：:slide[第 15 页]{n=15}

### 命题 4：连续的理性偏好有连续的效用函数 {#prop4}

:::orig
**Proposition 4.** If $X\subseteq\R^n$ and $\succeq$ is complete, transitive, continuous, then $\succeq$ has a continuous utility representation.
:::

- **意思**：选项是 $n$ 种商品的组合时，偏好只要完备、传递、连续，就一定能用一个连续的效用函数表示。
- **证明思路**（第 16 页，额外假设偏好严格单调）：对每个组合 $x$，找一个数 $\alpha(x)$，使“每种商品各 $\alpha(x)$ 份”和 $x$ 一样好，令 $u(x)=\alpha(x)$。在图上，$\alpha(x)$ 就是经过 $x$ 的无差异曲线与 45° 线交点的坐标。
- **详见**：:slide[第 15 页]{n=15}、:slide[第 16 页]{n=16}

### 效用不唯一：严格递增变换（未编号） {#transform}

:::orig
Utility not unique: any increasing transform $v(u(\cdot))$ also represents $\succeq$.

No interpersonal comparisons of utility levels.
:::

- **意思**：$u$ 表示 $\succeq$ 时，对分数做任何严格递增的变换 $v$（比如乘 2 再加 1，或者开立方），得到的 $v(u(x))$ 仍表示同一个偏好。所以效用只有顺序有意义（:term[序数效用]{k=ordinal-utility}），不能拿两个人的效用数值比高低。
- **例子**：在 $x_1,x_2>0$ 上，$u=x_1x_2$ 和 $\ln u=\ln x_1+\ln x_2$ 表示同一个偏好，因为 $\ln$ 严格递增。
- **详见**：:slide[第 16 页]{n=16}

### 刚可察觉差异（未编号） {#jnd}

:::orig
**Just noticeable differences:** $x\succ y\iff u(x)\ge u(y)+1$.
:::

- **意思**：分数至少高出 1，人才觉察得到“更好”；差距小于 1 时觉得一样好。这叫 :term[刚可察觉差异]{k=just-noticeable-difference}。这样的“一样好”不满足传递性。
- **例子**：$u(x)=0$、$u(y)=0.6$、$u(z)=1.2$。$x$ 与 $y$ 差 0.6，觉得一样好；$y$ 与 $z$ 差 0.6，也觉得一样好；可是 $z$ 比 $x$ 高 1.2，明显更好。
- **详见**：:slide[第 17 页]{n=17}

## 四、对偏好的常用限制（第 18–22 页） {#restrictions}

### 定义 7：单调性（Monotonicity） {#def7}

:::orig
**Definition 7 (Monotonicity)** $x\ge y\ \Rightarrow\ x\succeq y$.
:::

- **意思**：$x\ge y$ 指每种商品 $x$ 都不比 $y$ 少。东西多一点，至少不会更差。这叫 :term[单调性]{k=monotonicity}。
- **例子**：第一种商品是苹果、第二种是梨，那么 $(3,2)\succeq(2,2)$：多一个苹果，不会更差。
- **详见**：:slide[第 19 页]{n=19}

### 定义 8：局部非饱和（Local Non-satiation） {#def8}

:::orig
**Definition 8 (Local Non-satiation)** For any $y$, $\varepsilon>0$, $\exists x$ near $y$ with $x\succ y$.
:::

- **意思**：不管现在拥有什么组合 $y$，在离它不到 $\varepsilon$ 的地方（$\varepsilon$ 再小都行）总有一个更好的组合 $x$。永远不会“完全满足”。这叫 :term[局部非饱和]{k=local-nonsatiation}。
- **反例**：如果存在一个“最理想”的组合，比如刚好吃饱的那份饭菜，在它附近找不到更好的，就违反局部非饱和。
- **详见**：:slide[第 19 页]{n=19}

### 定义 9：凸性（Convexity） {#def9}

:::orig
**Definition 9 (Convexity)** If $x\succeq y$ and $x'\succeq y$, then $tx+(1-t)x'\succeq y$ for $t\in(0,1)$.
:::

- **意思**：两个都不比 $y$ 差的组合，按任何比例混合以后仍然不比 $y$ 差。直观上就是“喜欢搭配，不喜欢极端”。这叫 :term[凸偏好]{k=convex-preference}。
- **例子**：$(4,0)\succeq(1,1)$、$(0,4)\succeq(1,1)$，凸性要求一半一半的 $(2,2)\succeq(1,1)$。反例：甜豆花、咸豆花都爱喝，却不想要一半甜一半咸的一碗。
- **详见**：:slide[第 19 页]{n=19}

### 命题 5：三条限制换成效用函数的性质 {#prop5}

:::orig
**Proposition 5** If $u$ represents $\succeq$:

1. $\succeq$ monotone $\Leftrightarrow$ $u$ non-decreasing.
2. $\succeq$ locally non-satiated $\Leftrightarrow$ $u$ has no local maxima.
3. $\succeq$ convex $\Leftrightarrow$ $u$ quasi-concave.
:::

- **意思**：单调对应“商品增加时效用不下降”；局部非饱和对应“效用没有局部最大值”；凸性对应“效用拟凹”。做题时通常直接检查效用函数。
- **例子**：$u=\sqrt{x_1}+\sqrt{x_2}$ 在 $\R^2_+$ 上不减、没有局部最大值、拟凹，所以它表示的偏好单调、局部非饱和、凸。
- **详见**：:slide[第 19 页]{n=19}

### 拟凹与严格拟凹（未编号） {#quasi-concave}

:::orig
Let $f:C\to\mathbb{R}$ with $C\subseteq\mathbb{R}^n$ convex. $f$ is **quasi-concave** iff for every $\alpha\in\mathbb{R}$, the set $U_\alpha=\{\,x\in C\mid f(x)\ge\alpha\,\}$ is convex.

For all $x,y\in C$ and all $\lambda\in[0,1]$, $f\big(\lambda x+(1-\lambda)y\big)\ \ge\ \min\{f(x),f(y)\}$.
:::

- **意思**：:term[拟凹]{k=quasi-concave}有两种等价的说法：每个“函数值至少为 $\alpha$”的区域 $U_\alpha$（:term[上等高集]{k=upper-contour-set}）都是凸的；或者，两点混合以后的函数值，不低于两端中较小的那个。
- **严格拟凹**：对任意 $x\ne y$ 和 $\lambda\in(0,1)$，都有 $f\big(\lambda x+(1-\lambda)y\big)>\min\{f(x),f(y)\}$。图上表现为无差异曲线没有直的一段。课件写的是“$x\ne y$ 且 $f(x)\ne f(y)$ 时不等式严格成立”，和这个标准定义不同；本站按标准定义讲，原因见第 20 页。
- **例子**：$x_1+x_2$ 拟凹但不严格拟凹（无差异曲线是直线）；$\sqrt{x_1}+\sqrt{x_2}$ 严格拟凹。
- **详见**：:slide[第 20 页]{n=20}

### 定义 10：$x$ 的选择不依赖 $y$ {#def10}

:::orig
**Definition 10** $x^*(S,y)$ independent of $y$ if $\forall y_0,y_1\in Y$, $x^*(S,y_0)=x^*(S,y_1)$.
:::

- **意思**：选择分成两块，$x$ 来自 $X$，$y$ 来自 $Y$。$x^*(S,y)$ 是 $y$ 固定时，菜单 $S\subseteq X$ 里最好的那些 $x$。“不依赖 $y$”就是：$y$ 换成什么，从 $S$ 里选出的 $x$ 都一样。阅读材料要求这对所有菜单 $S$ 都成立，课件省略了这一点。
- **例子**：不管主菜点牛排还是鱼，他从同一张酒水单里都选同一种饮料，饮料的选择就不依赖主菜。
- **详见**：:slide[第 21 页]{n=21}

### 命题 6：可分性 {#prop6}

:::orig
**Proposition 6** If $\succeq$ has utility $u(x,y)$, then $x^*$ independent of $y$ $\Leftrightarrow$

$$
u(x,y)=U(v(x),y),
$$

where $v:X\to\mathbb{R}$ and $U$ increasing in first argument.
:::

- **意思**：$x$ 的选择不受 $y$ 影响，当且仅当总效用能写成“先给 $x$ 打一个分 $v(x)$，$x$ 只通过这个分数进入总效用”，并且 $U$ 对这个分数严格递增。这叫 :term[可分性]{k=separability}。
- **例子**：$u(x,y)=m(y)\,v(x)+w(y)$，其中 $m(y)>0$。不管 $y$ 是什么，$x$ 都按 $v(x)$ 的高低来选。
- **详见**：:slide[第 21 页]{n=21}

### 拟线性偏好与命题 7 {#prop7}

:::orig
**Proposition 7** These conditions $\Leftrightarrow$ $\exists v:Y\to\mathbb{R}$ such that

$$
(a,y)\succeq(a',y')\ \Leftrightarrow\ a+v(y)\ge a'+v(y').
$$

Utility: $u(a,y)=a+v(y)$.
:::

- **三个条件**：选项是 $(a,y)$，$a\ge 0$ 是钱。① 钱越多越好：$(a,y)\succeq(a',y)$ 当且仅当 $a\ge a'$。② 钱能补偿：存在最差的 $\bar y$，并且对每个 $y$ 都有一笔钱 $t\ge0$，使 $(0,y)\sim(t,\bar y)$。课件这里写的是 $\prec$，本站按阅读材料讲，见第 22 页的核对框。③ 没有财富效应：如果 $(a,y)\succeq(a',y')$，那么两边各加同样的 $t$ 元，仍有 $(a+t,y)\succeq(a'+t,y')$。
- **意思**：满足这三条，比较两个选项只需把“钱 + $y$ 折合的钱 $v(y)$”加起来比大小。这叫 :term[拟线性]{k=quasi-linear}偏好。本来有多少钱，不影响他在钱和 $y$ 之间怎么取舍。
- **例子**：$v(\text{看电影})=50$、$v(\text{不看})=0$。不管口袋里有 100 元还是 1000 元，他为看一场电影最多都愿意付 50 元。
- **详见**：:slide[第 22 页]{n=22}
