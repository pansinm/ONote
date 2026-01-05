# 贡献指南

感谢你有兴趣为 ONote 做出贡献！本文档将指导你如何参与项目开发。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [代码审查](#代码审查)
- [获取帮助](#获取帮助)

---

## 行为准则

### 我们的承诺

为了营造开放和友好的环境，我们承诺：

- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

- 使用性别化语言或图像，以及不受欢迎的性关注或示好
- 挑衅、侮辱/贬损的评论，以及人身或政治攻击
- 公开或私下骚扰
+ 未经明确许可发布他人的私人信息
- 其他在专业场合可能被合理认为不适当的行为

---

## 如何贡献

### 贡献方式

#### 1. 报告 Bug

如果你发现了 Bug，请：

1. 在 [Issues](https://github.com/your-org/ONote/issues) 中搜索，确保问题未被报告
2. 创建新 Issue，使用 Bug Report 模板
3. 提供详细信息：
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（OS、Node.js 版本等）
   - 截图或日志（如果有）

#### 2. 提出新功能

1. 先在 Issues 中讨论你的想法
2. 说明功能的用途和使用场景
3. 等待维护者反馈
4. 获得批准后开始开发

#### 3. 改进文档

- 修正错别字和错误
- 添加示例和说明
- 翻译文档
- 改进文档结构

#### 4. 提交代码

- 修复 Bug
- 实现新功能
- 优化性能
- 重构代码

---

## 开发流程

### 1. Fork 仓库

点击 GitHub 页面右上角的 Fork 按钮，将项目 Fork 到你的账号下。

### 2. 克隆仓库

```bash
# 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/ONote.git
cd ONote

# 添加上游仓库
git remote add upstream https://github.com/ORIGINAL_OWNER/ONote.git
```

### 3. 安装依赖

```bash
# 安装依赖
yarn install

# 运行开发模式
yarn dev
```

### 4. 创建功能分支

```bash
# 更新主分支
git checkout master
git pull upstream master

# 创建功能分支
git checkout -b feature/your-feature-name

# 或者修复分支
git checkout -b fix/bug-description
```

**分支命名规范：**

- `feature/` - 新功能
  ```
  feature/add-user-profile
  feature/dark-mode
  feature/export-to-pdf
  ```

- `fix/` - Bug 修复
  ```
  fix/memory-leak-in-editor
  fix/scroll-sync-issue
  fix/typo-in-documentation
  ```

- `docs/` - 文档更新
  ```
  docs/update-readme
  docs/add-api-documentation
  ```

- `refactor/` - 代码重构
  ```
  refactor/optimize-ipcs-handlers
  refactor/clean-up-unused-code
  ```

- `test/` - 测试相关
  ```
  test/add-unit-tests-for-store
  test/improve-test-coverage
  ```

- `chore/` - 构建配置等
  ```
  chore/update-dependencies
  chore/upgrade-webpack
  ```

### 5. 进行开发

按照[代码规范](./docs/代码规范.md)编写代码：

```bash
# 查看改动
git status

# 添加文件
git add .

# 提交（参考下面的提交规范）
git commit -m "feat: 添加用户头像功能"
```

### 6. 运行测试

```bash
# 运行测试
yarn test

# 运行 lint
yarn lint

# 修复 lint 问题
yarn lint --fix
```

### 7. 同步上游更新

```bash
# 获取上游更新
git fetch upstream

# 合并上游更新
git rebase upstream/master
```

---

## 提交规范

### Conventional Commits

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新功能也不是修复 Bug）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI 配置文件和脚本的变动
- `revert`: 回退之前的 commit

### 示例

#### 新功能

```bash
feat(editor): 添加代码折叠功能

- 实现基础的代码折叠逻辑
- 添加折叠/展开按钮
- 支持保存折叠状态

Closes #123
```

#### Bug 修复

```bash
fix(previewer): 修复滚动同步问题

修复了编辑器和预览器之间滚动位置不同步的问题。
原因是滚动事件监听器没有正确处理。

Fixes #456
```

#### 文档更新

```bash
docs: 更新开发指南安装说明

修正了 Node.js 版本要求，从 16.x 改为 18.x。
```

#### 重构

```bash
refactor(stores): 优化 UserStore 结构

- 将用户相关逻辑分离到独立方法
- 改进类型定义
- 添加详细注释
```

#### 性能优化

```bash
perf(renderer): 实现虚拟滚动优化长列表

使用 react-window 实现虚拟滚动，
显著提升大文件渲染性能。

Before: 1000 items - 200ms
After:  1000 items - 20ms
```

### 提交消息最佳实践

1. **使用祈使句**
   ```
   ✅ "feat: 添加暗色模式"
   ❌ "feat: 添加了暗色模式" 或 "feat: 暗色模式"
   ```

2. **首字母小写**
   ```
   ✅ "fix: 修复内存泄漏"
   ❌ "Fix: 修复内存泄漏"
   ```

3. **不要以句号结尾**
   ```
   ✅ "docs: 更新 README"
   ❌ "docs: 更新 README."
   ```

4. **简洁明了**
   ```
   ✅ "feat: 添加用户头像上传"
   ❌ "feat: 添加一个功能让用户可以上传他们的个人头像图片"
   ```

---

## Pull Request 流程

### 1. 推送到你的 Fork

```bash
# 推送分支
git push origin feature/your-feature-name
```

### 2. 创建 Pull Request

1. 访问你 Fork 的 GitHub 页面
2. 点击 "Compare & pull request" 按钮
3. 填写 PR 模板

### Pull Request 标题格式

与 commit message 格式相同：

```
feat(editor): 添加代码折叠功能
fix(previewer): 修复滚动同步问题
docs: 更新 API 文档
```

### Pull Request 描述模板

```markdown
## 变更说明
<!-- 简要描述你的变更 -->

## 变更类型
- [ ] Bug 修复 (修复了一个问题)
- [ ] 新功能 (添加了一个功能)
- [ ] 破坏性变更 (会导致现有功能无法正常工作)
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 测试相关

## 相关 Issue
关闭 #(issue number)

## 测试
描述你如何测试这些变更：
- [ ] 单元测试通过
- [ ] 手动测试
- [ ] 添加了新的测试

## 截图 (如果适用)
<!-- 添加截图展示你的变更 -->

## 检查清单
- [ ] 代码遵循项目的代码规范
- [ ] 已经进行了自我审查
- [ ] 添加了注释到难理解的代码段
- [ ] 已经更新了文档
- [ ] 没有新的警告产生
- [ ] 添加了测试来证明功能有效
- [ ] 新旧测试都通过
- [ ] 所有提交都有清晰的提交消息
```

### PR 最佳实践

1. **保持 PR 小而专注**
   - 每个 PR 只做一件事
   - 避免大规模改动
   - 如果改动很大，考虑拆分成多个 PR

2. **提供清晰的上下文**
   - 说明为什么要做这个改动
   - 展示变更前后的对比
   - 附上截图或录屏（如果适用）

3. **及时响应反馈**
   - 关注 PR 的评论
   - 及时回应问题
   - 根据反馈修改代码

---

## 代码审查

### 审查者的角色

作为审查者，你应该：

1. **检查代码质量**
   - 代码是否符合规范
   - 是否有潜在的 Bug
   - 性能是否有问题

2. **检查设计**
   - 实现方式是否合理
   - 是否有更好的实现方式
   - 是否考虑了边界情况

3. **提供建设性反馈**
   - 具体指出问题
   - 提供改进建议
   - 解释为什么需要修改

### 被审查者的角色

作为被审查者，你应该：

1. **保持开放心态**
   - 接受建设性批评
   - 理解审查者的意图
   - 不要把批评当成人身攻击

2. **及时修改**
   - 根据反馈修改代码
   - 解释不同意的理由
   - 主动讨论问题

3. **感谢审查者**
   - 花时间审查是自愿的
   - 表达感激之情
   - 学习改进

---

## 开发环境配置

### 必需工具

- Node.js 18.x+
- Yarn 1.22.x+
- Git

### 推荐工具

- Visual Studio Code
- ESLint 插件
- Prettier 插件
- Error Lens 插件

### Git 配置

```bash
# 设置你的名字
git config --global user.name "Your Name"

# 设置你的邮箱
git config --global user.email "your.email@example.com"

# 设置默认分支名
git config --global init.defaultBranch master
```

### VS Code 设置

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.workingDirectories": [
    "packages/electron",
    "packages/renderer",
    "packages/shared"
  ]
}
```

---

## 获取帮助

### 资源

- [架构说明](./docs/架构说明.md)
- [开发指南](./docs/开发指南.md)
- [新手教程](./docs/新手教程.md)
- [代码规范](./docs/代码规范.md)
- [常见问题](./docs/常见问题.md)

### 联系方式

- **GitHub Issues**: 报告 Bug 和功能请求
- **GitHub Discussions**: 技术讨论
- **Email**: your-email@example.com

### 社区

- 加入我们的讨论组
- 关注项目动态
- 分享你的使用经验

---

## 许可证

通过贡献代码，你同意你的贡献将根据项目的许可证进行授权。

---

## 致谢

感谢所有为 ONote 做出贡献的人！

---

## 最后的话

再次感谢你对 ONote 的关注和贡献！每一个贡献，无论大小，都让项目变得更好。

如果你是第一次贡献，不要担心，我们都会帮助你。最重要的是开始行动！

欢迎加入 ONote 社区！🎉
