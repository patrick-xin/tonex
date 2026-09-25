# exp/syntax-theme — tonex → VS Code 语法主题生成器

把一个种子色变成可安装的 VS Code 语法高亮主题。三层架构，和调研过的成熟主题
（One Dark Pro / Catppuccin / Dracula）同构：

```
scope-table.json    TextMate scope → 槽位名（静态，零 hex，写一次）
      ×
mappings/*.json     槽位 → tonex token / 色相意图（改风格只动这里）
      ×
recipes/*.json      seed / --second-color / --custom / --chart-palette（tonex CLI 参数）
      │
build.mjs           跑 tonex generate 解析引用 → out/ 可安装主题 + tonex check 门禁
```

## 用法

```bash
node exp/syntax-theme/build.mjs
# 产出 out/package.json + out/themes/*.json，拷进扩展目录即装：
cp -r exp/syntax-theme/out ~/.vscode/extensions/tonex-theme-demo-0.2.0
```

改风格 → 编辑 `mappings/`；换种子 → 编辑或新增 `recipes/`；加语言覆盖 → 只动
`scope-table.json`。三者互不牵连。

## 映射引用语法（mappings 里的取色表达）

| 写法 | 含义 |
|---|---|
| `"primary"` / `"tertiary"` / `"outline"` / `"orange"` | 显式 tonex token（MD 角色或 custom slug） |
| `"chart-4"` | chart token（`--to json` 的 `schemes.{mode}.chartN`） |
| `"hue(265)"` | **色相意图**：从当前种子实际产出的彩色 token 里就近解析（详见下） |
| `"@keyword"` | 别名到另一个槽位 |
| chrome 值 `"{string}@40"` | 槽位引用 + alpha 百分比；不带 `{}` 且非槽位名则按 token 解析 |

## 两张映射表 = 两个学派

调研结论（`~/dev/github/highlight-themes/analysis.md`）：角色→色相有两大学派。

- **editor-school**（Tokyo Night / Catppuccin / One Dark）：品牌色承载 function，
  keyword 落紫族 `hue(265)`，string 用第二源色（tertiary），数据色（number/parameter）
  走暖系，type 青 `hue(195)`，tag 红粉 `hue(350)`。
- **github-school**（primer）：keyword 红（error 家族）、string 冷水色 `hue(205)`、
  function/type 共用紫 `hue(270)`（GitHub 的 entity 本就同色）、tag 绿 `hue(130)`、
  变量保持前景色、操作符不着色。

同一份 emerald 调色板下两表的输出完全不同（editor：绿函数+紫关键字+金字符串；
github：红关键字+青字符串+紫函数+绿标签）。

## 门禁

`build.mjs` 对每个组合 × 模式跑 `tonex check --pairs`（theme-free hex 对）：
全部语法槽位对 `editor.background` 必须过 AA(4.5)，`expectSubAA` 声明的槽位
（comment，刻意压低层级——所有主流主题都低于 AA，Tokyo Night 是 2.5）只报告
不拦截。注释太暗的话 recipe 加 `--contrast 0.3` 重跑即可整体抬升。

## 发现（给将来 core 的 syntax token 组）

1. **chart 色相随种子旋转，固定 token 索引会漂移**。蓝种子下 chart-4 是紫，
   emerald 种子下 chart-4 是青。映射表如果写死 `keyword → chart-4`，换种子后
   "紫 keyword" 就漂没了。这就是 `hue(N)` 引用的由来：映射表表达色相意图，
   生成器对实际调色板就近解析（排除已被显式引用的 token 和 error/secondary，
   保证唯一分配）。这个解析器就是 core 里 `--color-syntax-keyword` 这类
   hue-role token 的原型——chart 的 `hueSpread`/`hueAnchor` 已有同思路先例。
2. **色相池密度随种子变化**。蓝种子下冷色拥挤（primary 和 chart-1 同为蓝族，
   editor-school 的 `hue(195)` type 只能拿到蓝族 token，和 function 同族不同调）；
   emerald 种子下七族全开。core 版应该保证 hue-role 槽位间的最小色相间距，
   而不是就近认领。
3. **custom 色的 4-role 组正好是 diff/invalid 的 text+bg 对**（`orange` +
   `orange-container`），chart token 没有容器对——需要容器语义的角色走 `--custom`。

## 文件

- `build.mjs` — 生成器（recipe → CLI → 解析 → 主题 + 门禁）
- `scope-table.json` — 26 槽位 × TextMate scopes
- `mappings/editor-school.json` / `mappings/github-school.json`
- `recipes/night-blue.json`（seed #7aa2f7）/ `recipes/emerald.json`（seed #10b981）
- `out/` — 构建产物（可安装扩展：6 个主题 = 2 学派 × 2 种子部分组合 × 明暗）
