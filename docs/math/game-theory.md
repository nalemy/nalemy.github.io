博弈相关定义参考：[博弈论简介 - OI Wiki](https://oi-wiki.org/math/game-theory/intro/)

## 性质与定义

我们抛开这个游戏的任何实质性内容（规则、状态），只着眼于每个状态所构成的图结构。

那么任何游戏都可以看作是“某个标记沿着图上的边移动”的过程。

并且对于公平组合游戏，我们只需知道这个图的构造，我们就可以依照下面两条显然的性质判定每个点是必胜点还是必败点。

- 如果后继所有点都为必胜点，那么这个点为必败点
- 否则这个点为必胜点

我们也可以根据这两个条件互为否定得出，这个图上的每个点一定是必胜点或必败点之一。

并且我们可以用某个点的所有后继节点（亦作为一个集合）构成的集合，形式化地描述任意一个 DAG 上的所有点。

那么两个能够由 DAG 描述的游戏的**复合**（这个游戏的每一步是在两个游戏中选一个进行）应当如下定义：

$$
A+B=\{a+B\mid a\in A\}\cup\{A+b\mid b\in B\}
$$

## SG 定理

所有的一般胜利条件下的公平组合游戏都能转换成 Nim 数表达的 Nim 游戏。

一个公平组合游戏的 Nim 数（即 SG 函数）定义为这个博弈的等价 Nim 数。

证明见 [Sprague–Grundy theorem - Wikipedia](https://en.wikipedia.org/wiki/Sprague%E2%80%93Grundy_theorem)。

## 典例

更多典例：[博弈论小计 - command block](https://www.luogu.com.cn/blog/command-block/bo-yi-lun-xiao-ji)。

### Nim 游戏

当 $n$ 堆石子个数异或和为 $0$ 时该状态为必败状态，否则为必胜状态。

证明见 [Nim 和 - OI Wiki](https://oi-wiki.org/math/game-theory/impartial-game/#nim-%E5%92%8C)。

### K-Nim 游戏

[SDOI2011 黑白棋](https://www.luogu.com.cn/problem/P2490)

每次取石子的堆数在 $[1,d]$ 范围内。

将每个石子堆的个数写成二进制形式并右侧对齐，如果每一位之和都是 $d+1$ 的倍数则为必败态，否则为必胜态。

### 限制取子个数的 Nim 游戏

[ABC297G](https://atcoder.jp/contests/abc297/tasks/abc297_g)

限制每次取的石子个数在 $[L,R]$ 范围内。

这个游戏的 SG 函数为

$$
\left\lfloor\frac{x\bmod(L+R)}L\right\rfloor
$$

证明见 [ABC297G Editorial](https://atcoder.jp/contests/abc297/editorial/6205)。