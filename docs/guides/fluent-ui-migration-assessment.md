# ONote Fluent UI 使用盘点与去 Fluent UI 试点评估

## 目标

盘点 ONote 中 Fluent UI 的实际使用位置，标出高频路径上的关键组件，给出 Sidebar / Toolbar / Search results 的试点迁移范围，并形成一套 ONote 自有基础样式规范初稿，用于决定是否全面迁移。

---

## T1. Fluent UI 使用位置盘点

### 1) 总体分布

基于 `packages/renderer/src` 的实际 import 盘点：

- **涉及 Fluent UI 的文件数：43**
- 主要分布区域：
  - **FormInfra：12**
  - **Sidebar：9**
  - **Setting：9**
  - **FileBrowser：4**
  - **SharedComponents：3**
  - **MainOther：2**
  - **Auxiliary：2**
  - **FileList：1**
  - **ContentPanel：1**

这说明 Fluent UI 不是只用在零散控件上，而是已经进入：

1. **应用入口层**（`FluentProvider` / theme）
2. **高频主界面**（Sidebar / Toolbar / Search results / 空状态）
3. **中频配置界面**（Setting）
4. **表单基础设施层**（Form widgets / Drawer / Confirm / Toast）

### 2) 入口级依赖

#### 应用根入口
- `packages/renderer/src/main/index.tsx`
  - `FluentProvider`
  - `warmLightTheme`

#### 辅助窗口
- `packages/renderer/src/auxiliary/index.tsx`
  - `FluentProvider`
  - `webLightTheme`

#### 主题定义
- `packages/renderer/src/main/theme/warmLightTheme.ts`
  - 基于 `webLightTheme` 做大面积 token 覆盖

这意味着当前 UI 并不是“用几个 Fluent Button”这么简单，而是**整套视觉 token 和 provider 已经挂在应用根上**。

### 3) 高频主界面中的使用点

#### Sidebar 区域
- `main/containers/Sidebar/index.tsx`
  - `makeStyles`, `shorthands`, `Tooltip`
  - 图标：`DismissRegular`, `SearchRegular`, `AddRegular`
- `main/containers/Sidebar/ProjectSelector.tsx`
  - `Dialog`, `DialogTrigger`, `Button`, `DialogSurface`, `DialogBody`, `DialogTitle`, `DialogContent`
- `main/containers/Sidebar/components/ProjectSelect.tsx`
  - `TabList`, `Tab`, `makeStyles`
- `main/containers/Sidebar/components/local/LocalDirSelect.tsx`
  - `Button`
- `main/containers/Sidebar/components/ssh/SSHForm.tsx`
  - `Button`
- `main/containers/Sidebar/components/ssh/SSHDirSelect.tsx`
  - `Button`
- `main/containers/Sidebar/components/gitee/GiteeForm.tsx`
  - `Button`
- `main/containers/Sidebar/components/gitee/GiteeDirSelect.tsx`
  - `Button`
- `main/containers/Sidebar/NoDirectory.tsx`
  - `makeStyles`

#### Search results
- `main/containers/FileList/SearchList.tsx`
  - `makeStyles`, `tokens`
  - 图标：`DocumentRegular`

#### Toolbar
- `main/containers/FileBrowser/Toolbar/index.tsx`
  - `Tooltip`, `Button`, `makeStyles`, `tokens`, `Divider`
  - 图标：`QrCodeRegular`, `LayoutColumnTwoSplitLeftRegular`, `PlayRegular`

#### 空状态 / 内容区
- `main/containers/ContentPanel/index.tsx`
  - `makeStyles`, `Button`
  - 图标：`DocumentRegular`, `FolderOpenRegular`

### 4) 中频界面中的使用点

#### Setting 区域
- `main/containers/Setting/SettingTrigger.tsx`
  - `Dialog`, `DialogTrigger`, `Button`, `DialogSurface`, `DialogBody`, `makeStyles`
- `main/containers/Setting/Setting.tsx`
  - `TabList`, `Tab`, `makeStyles`, `shorthands`
- `main/containers/Setting/EditorPanel/index.tsx`
  - `Checkbox`, `Input`, `Field`, `makeStyles`
- `main/containers/Setting/GeneralPanel.tsx`
  - `Dropdown`, `Option`, `Field`, `makeStyles`
- `main/containers/Setting/PlantUMLPanel/index.tsx`
  - `Checkbox`, `Field`, `Input`
- `main/containers/Setting/PluginPanel/*`
  - `Button`, `TabList`, `Tab`, `makeStyles`

### 5) 基础设施层使用点

#### Form 基础模板 / widgets
- `components/Form/templates/*`
  - `Field`, `Button`, `Subtitle1`
- `components/Form/widgets/*`
  - `Slider`, `Label`, `Checkbox`, `Textarea`, `Dropdown`, `RadioGroup`, `Radio`

#### 共享组件
- `components/Drawer.tsx`
- `components/Confirm.tsx`
- `components/Toast.tsx`

### 6) 高频组件类型统计

按 import 次数粗看，当前最常见的 Fluent UI 组件是：

- `Button` × 17
- `makeStyles` × 13
- `Field` × 6
- `Checkbox` × 4
- `TabList` × 3
- `Tab` × 3
- `Input` × 3
- `Tooltip` × 2
- `Dialog` 系列 × 2
- `Dropdown` × 2

结论很明确：

> 当前 ONote 最深的 Fluent UI 依赖，不是某个特殊弹窗，而是 **Button / styles / form / tabs / dialog** 这几条基础骨架。

---

## T2. 高频使用路径上的关键组件判断

### ONote 当前高频路径

按真实使用逻辑，ONote 的高频路径基本是：

1. 打开目录 / 连接项目
2. 在 Sidebar 找文件
3. 搜索文件
4. 打开文件
5. 在 Toolbar 切换布局 / 打开独立预览
6. 在内容区开始编辑
7. 没文件时通过空状态进入下一步

### Fluent UI 在高频路径上的落点

#### A. Sidebar header
包含：
- 搜索框容器样式（部分已是原生 input + Fluent styles）
- 新建按钮提示（Tooltip）
- 打开目录按钮（ProjectSelector trigger）
- 设置按钮（SettingTrigger）

影响：**高**

原因：
- 每次进入项目几乎都会碰到
- 用户在这里决定“找文件 / 开目录 / 新建 / 进设置”
- 任何视觉层级不清、按钮感过重、提示语气不对，都会立刻放大

#### B. Search results
包含：
- 结果列表项容器样式
- 文本颜色 / 路径颜色 / 高亮 / focus-visible
- 文件图标

影响：**很高**

原因：
- 搜索结果直接决定“扫一眼能不能定位”
- 已经证明需要大量定制才能顺手
- 这个区域本质上已经不像 Fluent 标准组件，而是产品专属结果项

#### C. Toolbar
包含：
- 布局状态按钮
- 独立预览按钮
- 二维码入口
- Tooltip
- Divider

影响：**高**

原因：
- 这是编辑前的关键控制区
- 主次关系稍不清楚，就会把高频动作和低频能力混成一层
- 目前已经在靠手动分组、手动样式修正 Fluent 的默认表达

#### D. 空状态
包含：
- 主按钮 / 次按钮
- 图标
- 容器样式

影响：**中高**

原因：
- 空状态不是常驻，但它承担“第一次理解界面”和“卡住时指路”
- 文案和按钮样式必须一致，不然用户会怀疑下一步是否真在这里

### 哪些 Fluent UI 组件最影响“理解与顺手”

按体验影响排序：

1. **Button**
   - 最广泛出现
   - 直接决定主次关系、可点击感、产品气质
   - 目前 ONote 的很多修正，本质上都在修 Button 的默认表达

2. **Tooltip**
   - 影响理解补充方式
   - 如果外观和触发逻辑太像企业后台，会削弱轻量工具感

3. **Dialog / TabList**
   - 主要影响项目选择、设置这类中高频面板
   - 不是第一批最该拆，但明显属于第二批

4. **makeStyles / tokens**
   - 这不是一个单独组件问题，而是**样式体系被 Fluent 绑住**
   - 尤其在 Search results / Toolbar 这种已经高度定制的地方，继续靠 Fluent tokens 只会增加替换成本

结论：

> 如果只看高频路径，最该优先收回控制权的不是 Dialog，而是 **Button / Tooltip / 自定义样式体系**。

---

## T3. 去 Fluent UI 试点方案

### 试点原则

试点不是为了“先替几个组件”，而是为了回答 3 个问题：

1. 去 Fluent UI 后，界面是否更像 ONote 自己，而不是换个轮子继续套？
2. 高频路径的理解成本是否下降？
3. 替换成本是否可控，不会立刻波及 Setting / Form / 全局 provider？

### 试点方案 A（优先）：Sidebar header + Search results

#### 范围
- `main/containers/Sidebar/index.tsx`
- `main/containers/Sidebar/index.module.scss`
- `main/containers/FileList/SearchList.tsx`

#### 包含内容
- 搜索框容器与清除按钮
- 新建按钮触发区
- 搜索结果列表项
- 搜索结果高亮、active、focus-visible、hover
- Tooltip 可同步替换为更轻的自有实现，或先暂时去掉非必要 tooltip

#### 明确边界
**本试点不碰：**
- `ProjectSelector` 的 Dialog
- Sidebar 项目连接流程（local / ssh / gitee）
- Directory 树本身
- Setting 入口弹窗

#### 为什么先选它
因为这里已经满足“最适合试点”的 4 条：

1. **高频**：几乎每次打开笔记都要经过这里
2. **局部**：替换不会马上波及全局表单系统
3. **已半脱 Fluent**：搜索框本身就是原生 input，自定义程度已经很高
4. **收益直观**：能立刻看出产品气质是否更统一

#### 预期收益
- 让 Sidebar 从“若干 Fluent 控件拼起来”变成真正一体化面板
- 统一搜索框、搜索结果、按钮的语气与视觉逻辑
- 建立第一批 ONote 私有控件样式：输入框 / icon button / result item / focus ring

#### 主要风险
- 搜索结果可访问性要自己继续兜住
- Tooltip 若一并替换，要注意 hover / focus / positioning 的细节
- 如果同时想改 Directory，会把试点拖大，不值得

### 试点方案 B（并列优先，可与 A 连做）：Toolbar + 空状态

#### 范围
- `main/containers/FileBrowser/Toolbar/index.tsx`
- `main/containers/ContentPanel/index.tsx`

#### 包含内容
- 工具栏主按钮 / 图标按钮 / 分组容器 / divider
- 布局切换按钮
- 独立预览入口
- 二维码入口外壳
- 空状态主按钮 / 次按钮 / 容器样式

#### 明确边界
**本试点不碰：**
- 二维码生成逻辑本身
- ResourceTabs
- Monaco 编辑区
- 文件预览业务逻辑

#### 为什么选它
因为这个区域最能验证一个核心问题：

> ONote 自己的按钮层级和面板边界，能不能比 Fluent 默认表达更清楚。

这里的交互密度比 Setting 低，但“主次关系”要求更高，特别适合建立自有按钮规范。

#### 预期收益
- 用最小范围验证自有按钮系统是否成立
- 工具栏能形成更克制的产品气质
- 空状态能和 Sidebar / Search 语言统一

#### 主要风险
- 如果没有统一的按钮规范，Toolbar 和空状态会各写各的，越改越散
- 如果过早追求动画或复杂反馈，会偏离“轻工具”的方向

### 为什么这轮不先选 Setting 做试点
因为 Setting 虽然 Fluent 用得多，但它不是最好的第一试点：

- 表单种类更多，复杂度更高
- Dialog / Tab / Dropdown / Checkbox / Input 一起上，容易把试点拖成大迁移
- 用户不在 Setting 里完成主要任务，它更适合第二阶段处理

结论：

> 第一批试点应该先拿下 **Sidebar header + Search results**，再接着做 **Toolbar + 空状态**。这两块最能验证“去 Fluent UI 是否真的让 ONote 更顺手”。

---

## T4. ONote 自有基础样式规范初稿

下面这版不是设计口号，是后续可直接落地的界面规则。

### 总体原则

1. **先清楚，再精致**
   - 每个控件先保证一眼看懂，再谈质感。
2. **高频动作前置，低频能力后退**
   - 不让所有按钮站成一排争注意力。
3. **边界轻，但要清楚**
   - ONote 适合安静的界面，不适合重描边，但也不能糊成一片。
4. **焦点必须可见**
   - 键盘用户不允许迷路。
5. **文案和样式要说同一种话**
   - 文案是“下一步引导”，样式就不能像后台配置页。

### 1) 按钮层级规范

#### Primary button
用途：
- 当前区域唯一最推荐动作
- 例如：打开目录、创建第一篇笔记、确认打开项目

规则：
- 实心暖色底
- 白色文字
- 高度固定，不追求大
- 一个区域里原则上不超过 1 个 primary

禁止：
- 同一区域出现两个同权 primary
- 把低频能力做成 primary

#### Secondary button
用途：
- 与主操作并列，但不是默认第一步
- 例如：布局切换状态按钮

规则：
- 浅底 + 清晰边界
- 文字色比普通文本更重，但不抢 primary

#### Tertiary / subtle button
用途：
- 辅助动作、次要入口、轻量触发
- 例如：独立预览、去左侧选文件、设置、清除搜索

规则：
- 透明或极浅底
- hover 才明显出现点击感
- 不靠大面积底色吸引注意力

#### Icon button
用途：
- 工具栏、Sidebar header 中的短动作

规则：
- 点击区至少 `32x32`
- 图标永远不能是唯一反馈，要配 hover / focus / title / aria-label
- 同一排 icon button 的视觉重量必须一致

### 2) 输入框规范

用途：搜索、连接参数、设置输入。

规则：
- 默认高度统一
- 默认浅底 + 轻边框
- focus 时不只改边框色，还要有轻微 focus ring
- placeholder 用较弱文字，但必须清楚可读
- 搜索框允许内嵌图标和清除按钮，但不允许影响文字可读区

建议视觉语义：
- 默认：纸面浅底
- hover：边框稍增强
- focus：暖色描边 + 柔和 ring
- disabled：降低对比，但仍可辨认

### 3) 面板边界规范

适用：Sidebar、搜索面板、工具栏区、设置侧栏、弹层内部面板。

规则：
- 边界以“分区”为目标，不以“装饰”为目标
- 常规用法优先：
  - 背景色差
  - 单侧分隔线
  - 内边距
- 少用四边全描边卡片，容易显碎
- 同层级面板不要同时争边界强度

建议：
- Sidebar 内部区域靠浅底差和 1px 分隔线区分
- Toolbar 靠分组、间距、divider 区分，不靠厚边框
- 空状态不要做成孤立卡片，保持内容区整体感

### 4) 焦点态规范

这是必须项，不是加分项。

规则：
- 只对键盘焦点显示明显 focus-visible
- 焦点环颜色统一使用 ONote 暖色品牌描边
- 焦点环不能只剩 1px 边框，要有外扩感
- 焦点态不依赖 hover 存在

建议实现：
- `outline: none`
- `border-color: 品牌暖色`
- `box-shadow: 0 0 0 2px rgba(品牌色, 0.18~0.24)`

适用对象：
- 输入框
- 结果项
- 工具栏按钮
- 弹窗中的可操作项
- Tabs

### 5) 空状态规范

用途：用户还没开始 / 当前路径断了 / 不知道下一步去哪。

规则：
- 标题只说当前关键缺口
- 描述只解释“为什么现在不能继续 + 下一步会得到什么”
- 动作按钮直接对应下一步，不用系统口吻
- 一个主动作 + 最多一个次动作

推荐结构：
- 图标
- 标题
- 1~2 句描述
- 主按钮
- 次按钮（可选）

禁止：
- 同时摆太多操作
- 用抽象文案代替具体下一步
- 把空状态做成说明书

---

## 是否适合全面迁移的当前判断

### 现在适合做的
- 先做高频路径试点
- 先从 **Sidebar header + Search results** 开始
- 再做 **Toolbar + 空状态**
- 同时抽出一层 ONote 自有基础样式变量 / 原子 class / 组件皮肤

### 现在不适合做的
- 直接移除全局 `FluentProvider`
- 一次性重写 Setting / Form 基础设施 / Drawer / Confirm / Toast
- 为了“摆脱 Fluent”而手搓整套复杂弹层与表单系统

### 建议的迁移顺序

#### Phase 1：高频试点
- Sidebar header
- Search results
- Toolbar
- 空状态

#### Phase 2：中频面板
- ProjectSelector（Dialog + Tabs + open flow）
- SettingTrigger / Setting tabs
- General / Editor / PlantUML 面板

#### Phase 3：基础设施替换
- Form widgets
- Drawer / Confirm / Toast
- 入口级 `FluentProvider` 与 theme 解绑

### Phase 1 样式实现约定（补充）

这部分不是建议，是 Phase 1 实施约束。

#### 1) 样式统一方案
- **统一使用 `SCSS Modules` 作为 Phase 1 的样式落地方案**。
- Phase 1 新增或重写的 Sidebar / Toolbar / Search results / 空状态样式，**不再新增 `makeStyles`**。
- 现有 `makeStyles` 只允许减少，不允许在试点范围内继续扩张。
- 允许保留 React 组件逻辑不动，但样式定义需要逐步迁到 `.module.scss`。

#### 2) 设计令牌管理
- Phase 1 不引入新的 CSS-in-JS token 层。
- 颜色、边框、焦点态、间距等试点期设计令牌统一沉淀到 SCSS 变量文件中。
- 推荐新增：
  - `packages/renderer/src/styles/tokens.scss`
  - 或 `packages/renderer/src/styles/variables.scss`
- Sidebar / Toolbar / Search results / 空状态中出现的重复值，应优先抽到变量，不允许同一个颜色值在试点文件里四处散落。

#### 3) 基础样式复用方式
- 可复用的按钮、focus ring、panel 边界规则，优先通过：
  1. SCSS 变量
  2. 语义 class（如 `iconButton` / `subtleButton` / `panelSection`）
  3. 局部模块复用
- Phase 1 先建立“可复用样式片段”，**不急着抽成通用 React 基础组件**。
- 原因很简单：现在先验证视觉和交互规则，别过早抽象。

#### 4) 图标策略
- **Phase 1 允许继续使用 `@fluentui/react-icons`**。
- 这轮试点的目标是先去掉 Fluent UI 的组件与样式耦合，不强制连图标一起替换。
- 图标替换放到后续阶段统一评估，避免这轮把试点做大。

#### 5) Provider / theme 边界
- Phase 1 **不移除全局 `FluentProvider`**。
- `warmLightTheme` / `webLightTheme` 可以继续存在，用于承接尚未迁移的区域。
- 试点代码不得新增对 `tokens`、`webLightTheme`、`warmLightTheme` 的新耦合。

#### 6) Confirm / Toast / Drawer 边界
- `Confirm.tsx` 当前独立 `Provider` 模式暂不动。
- `Toast.tsx` / `Drawer.tsx` 保持现状，不纳入本轮改造。
- `Drawer` 在后续迁移中应明确标记为**高风险项**。

### Sidebar header：`makeStyles` → `SCSS Modules` 迁移路径（补充）

这是 Phase 1 的明确迁移路径，不允许长期并存两套样式体系。

#### 迁移对象
- `packages/renderer/src/main/containers/Sidebar/index.tsx`
- `packages/renderer/src/main/containers/Sidebar/index.module.scss`
- `packages/renderer/src/main/containers/Sidebar/NoDirectory.tsx`

#### 路径要求
1. 把 `Sidebar/index.tsx` 中当前 `useStyles` 定义的以下样式迁入 `index.module.scss`：
   - `header`
   - `inputWrap`
   - `searchIcon`
   - `input`
   - `clearBtn`
   - `iconBtn`
2. 迁移完成后，`Sidebar/index.tsx` 中删除 `makeStyles` / `shorthands` import 和 `useStyles` 定义。
3. `Sidebar/index.tsx` 只保留 **一个样式来源**：`index.module.scss`。
4. `NoDirectory.tsx` 视为试点 A 的一部分；若改动到其样式，也必须同步迁到 SCSS Modules，不允许继续追加 `makeStyles`。

#### 为什么要这么做
- `Sidebar/index.tsx` 现在已经同时依赖 `index.module.scss` 和 `makeStyles`。
- 如果试点之后仍保留“双轨样式”，后面只会更乱，不会更清楚。
- 这块必须借试点顺手收干净，不然 Phase 1 没有示范价值。

### Phase 1 试点边界冻结

为避免试点范围蔓延，先冻结这轮允许改动的文件边界。

#### 试点 A：Sidebar header + Search results
**允许改动：**
- `packages/renderer/src/main/containers/Sidebar/index.tsx`
- `packages/renderer/src/main/containers/Sidebar/index.module.scss`
- `packages/renderer/src/main/containers/Sidebar/NoDirectory.tsx`
- `packages/renderer/src/main/containers/FileList/SearchList.tsx`
- 可新增与上述组件强相关的 `.module.scss` 文件
- 可新增试点所需的 SCSS tokens / variables 文件

**不允许扩展到：**
- `ProjectSelector.tsx`
- `components/ProjectSelect.tsx`
- `Directory.tsx`
- local / ssh / gitee 连接流程
- `SettingTrigger.tsx`

#### 试点 B：Toolbar + 空状态
**允许改动：**
- `packages/renderer/src/main/containers/FileBrowser/Toolbar/index.tsx`
- `packages/renderer/src/main/containers/ContentPanel/index.tsx`
- 可新增与上述组件强相关的 `.module.scss` 文件
- 可复用试点期基础样式 tokens / variables

**不允许扩展到：**
- `ResourceTabs`
- Monaco 编辑器
- 文件预览业务逻辑
- 二维码生成逻辑
- Setting 面板

### Phase 1 验收标准

这轮不是“看起来差不多”就算过，必须按下面标准验收。

#### 通用验收
- 试点范围内不再新增 `@fluentui/react-components` 的新使用点。
- 试点范围内移除 `makeStyles` / `tokens` 依赖。
- 现有功能逻辑不变：
  - 创建文件仍可用
  - 打开目录仍可用
  - 打开独立预览仍可用
  - 切换布局仍可用
  - 搜索结果点击与聚焦行为不退化
- 没有破坏键盘可达性。

#### Sidebar header / Search results 验收
- 搜索框仍支持：
  - 输入搜索
  - `Escape` 清空
  - `ArrowDown` 聚焦第一个结果
- 搜索结果项仍支持：
  - 点击打开
  - 高亮关键词
  - active 状态可辨认
  - `focus-visible` 清楚可见
- 新建按钮仍能正常创建文件。
- 视觉上 Sidebar header、搜索结果面板、Directory 区域层级更统一，不再像“不同体系拼接”。

#### Toolbar / 空状态验收
- Toolbar 中主次层级清楚：
  - 布局切换是主要控制
  - 独立预览、二维码是次要控制
- Tooltip 即使保留，也不能再依赖 Fluent 视觉 token。
- 空状态中主按钮 / 次按钮关系清楚，且文案与动作匹配。
- 焦点态必须可见，建议实现改为：
  - `outline: 2px solid transparent`
  - `border-color: 品牌暖色`
  - `box-shadow: 0 0 0 2px rgba(品牌色, 0.18~0.24)`

### Phase 1 结论：进入 Phase 2 前必须先收束的基础样式项

基于 Sidebar / Search results / Toolbar / 空状态试点，以及后续类型与架构复审，Phase 2 不是先“迁更多组件”，而是先把已经验证有效的规则收束成可复制起点。

#### 必须先处理的 4 个基础样式收束项
1. **全局 outline 策略**
   - 当前全局 `* { outline: 0; }` 是风险项。
   - Phase 2 必须先改成不会吞掉键盘焦点的安全写法。
   - 目标不是恢复浏览器默认蓝框，而是保证任何新迁移组件在未额外补样式前，也不会直接失去焦点可见性。

2. **统一 focus ring 实现**
   - Sidebar / Search results / Toolbar / 空状态已经证明：
     - `outline: 2px solid transparent`
     - `border-color: 暖色品牌边框`
     - `box-shadow: 0 0 0 2px rgba(品牌色, 0.18~0.24)`
     这套方向是对的。
   - Phase 2 要把它抽成统一 mixin，不允许继续每个文件各写一份、alpha 各不相同。

3. **补齐并统一暖色 CSS 变量**
   - Phase 1 中残留的辅助文字色、placeholder 色、active 背景色、高亮背景色，不能继续硬编码散落。
   - Phase 2 必须先补齐 `:root` 变量，再允许继续扩迁。

4. **二维码弹层键盘可达性 + 样式抽离**
   - 当前二维码入口已经脱离 Fluent Tooltip，但还不算完整：
     - 缺少 `Escape` 关闭
     - 仍有 inline style
   - Phase 2 必须把它收成可复用、可键盘关闭、样式落在 SCSS Modules 的实现。

### Phase 2 执行约束（新增）

#### 1) 先收束，再扩范围
- T2 完成前，不允许开始下一批低风险迁移。
- 原因很简单：如果基础样式层没先收住，后面只是把“试点成功”复制成“新的样式分叉”。

#### 2) Phase 2 统一样式落地方式
- 继续统一使用 **SCSS Modules + CSS variables + SCSS mixins**。
- 不新增 `makeStyles`。
- 不新增 `tokens` / `webLightTheme` / `warmLightTheme` 依赖。
- 不引入新的 CSS-in-JS token 层。

#### 3) 这轮允许抽取的基础样式层
- 可新增：
  - `packages/renderer/src/styles/_mixins.scss`
  - `packages/renderer/src/styles/tokens.scss`
  - 或等价的 SCSS 变量 / mixin 文件
- 本轮允许优先抽取：
  - `focus-ring` mixin
  - `icon-button` mixin
  - 已在试点里重复出现的暖色 CSS 变量
- **不要过早抽成 React 基础组件**。
- **不要把只出现 1 次的按钮模式强行抽象**（如某些 primary / subtle / status button 只在单处使用时，先保留局部 class）。

#### 4) Provider / theme / icon 边界
- Phase 2 仍然 **不移除全局 `FluentProvider`**。
- `@fluentui/react-icons` 仍允许继续使用。
- 目标依旧是先去掉 Fluent 组件和样式耦合，不在这轮把图标和 provider 一起清算。

### Phase 2 下一批低风险迁移范围（冻结）

#### 允许改动
- `packages/renderer/src/main/containers/FileBrowser/UnSupport/index.tsx`
- 可新增与其强相关的 `.module.scss` 文件
- 可复用本轮收束后的基础样式变量 / mixin

#### 明确不允许扩展到
- `packages/renderer/src/main/containers/Sidebar/ProjectSelector.tsx`
- `packages/renderer/src/main/containers/Setting/SettingTrigger.tsx`
- `Drawer.tsx`
- `Confirm.tsx`
- `Toast.tsx`
- `components/Form/**`
- `Setting/**`
- local / ssh / gitee 项目连接流程
- 任何 Dialog / Tab / Dropdown / Checkbox / Input 重表单基础设施区域

#### 为什么这一轮只放 `UnSupport`
- 它位于内容区边缘路径，风险比 Sidebar 主路径和 Setting / Form 低得多。
- 它能继续验证：
  - 基础按钮层级是否可复用
  - 空状态 / 提示态样式是否能脱离 Fluent 后仍然清楚
  - 新的 mixin / 变量是否真的能复制，而不是只在试点里成立
- `ProjectSelector` / `SettingTrigger` 虽然看起来小，但本质上是 **Dialog 迁移**，不算低风险，现阶段不要碰。

### Phase 2 验收标准（新增）

#### 基础样式层验收
- 全局 outline 策略已修正，不再用会直接吞掉焦点态的 `outline: 0` 方案。
- 试点与新增迁移范围中的 focus-visible 实现统一来源，不再出现多份 alpha 漂移。
- 暖色辅助变量不再在组件文件中散落硬编码。
- 二维码弹层支持键盘 `Escape` 关闭，样式已迁入 SCSS Modules。

#### 低风险迁移验收
- 新一批低风险范围内不再新增 `@fluentui/react-components` 依赖。
- 新迁移实现必须复用已收束的 mixin / variables，而不是重复复制上一轮样式。
- 行为逻辑不变，键盘可达性不退化。
- 视觉上应延续已建立的 ONote 自有语言：
  - 主次动作清楚
  - 焦点态统一
  - 提示态 / 空状态不再像独立控件库拼装

### Phase 2 结论

> Phase 2 的目标不是“把更多 Fluent 组件拔掉”，而是先证明 ONote 已经有了一套 **可复制、可维护、不会立刻失控** 的基础样式起点。
> 
> 只有基础样式层先收住，后面的低风险迁移才有参考价值；否则迁得越多，只会越散。

### 结论：进入实施

> ONote 现在可以进入 Phase 2，但必须坚持：**先收束基础样式，再做低风险扩展**。
> 这轮不追求扩大战线，追求把已经证明有效的做法变成规则。
