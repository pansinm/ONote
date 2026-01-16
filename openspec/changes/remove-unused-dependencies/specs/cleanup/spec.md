# 规格变更：移除无用依赖和 E2E 测试配置

## REMOVED Requirements

### Requirement: 删除 E2E 测试配置文件

`packages/electron/cucumber.json` 配置文件 MUST 被删除。

**优先级**: P1

**描述**: 删除 Cucumber 配置文件。

#### Scenario: 删除 cucumber.json

**Given** 文件 `packages/electron/cucumber.json` 存在

**When** 应用本变更

**Then** 该文件 MUST 被删除

---

### Requirement: 删除 E2E 测试特征文件

`packages/electron/features/` 目录 MUST 被删除，包括所有 feature 文件、步骤定义和支持文件。

**优先级**: P1

**描述**: 删除 E2E 测试目录。

**原内容**:
- `*.feature` 文件 (快捷插入.feature, 打开文件.feature, 插入日期.feature, 目录树.feature)
- `step_definitions/` (editor.step.ts, explorer.step.ts)
- `support/` (hooks.ts, utils.ts)

#### Scenario: 删除 features 目录

**Given** 目录 `packages/electron/features/` 存在

**When** 应用本变更

**Then** 该目录 MUST 被删除

**And** 所有相关测试文件 MUST 被删除

---

### Requirement: 移除根目录 E2E 依赖

根目录 `package.json` MUST 移除 `@cucumber/cucumber` 和 `chokidar` 依赖。

**优先级**: P1

**描述**: 移除根目录 E2E 相关依赖。

#### Scenario: 移除根目录依赖

**Given** package.json 包含 `@cucumber/cucumber` 和 `chokidar`

**When** 应用本变更

**Then** `@cucumber/cucumber` MUST 从 devDependencies 移除

**And** `chokidar` MUST 从 devDependencies 移除

---

### Requirement: 移除 electron 包 E2E 依赖

`packages/electron/package.json` MUST 移除 `playwright` 和 `chokidar` 依赖。

**优先级**: P1

**描述**: 移除 electron 包的 E2E 相关依赖。

#### Scenario: 移除 electron 包依赖

**Given** packages/electron/package.json 包含 `playwright` 和 `chokidar`

**When** 应用本变更

**Then** `playwright` MUST 从 devDependencies 移除

**And** `chokidar` MUST 从 devDependencies 移除

---

### Requirement: 移除 renderer 包 E2E 依赖

`packages/renderer/package.json` MUST 移除 `chokidar-cli` 依赖。

**优先级**: P1

**描述**: 移除 renderer 包的 E2E 相关依赖。

#### Scenario: 移除 renderer 包依赖

**Given** packages/renderer/package.json 包含 `chokidar-cli`

**When** 应用本变更

**Then** `chokidar-cli` MUST 从 devDependencies 移除

---

### Requirement: 移除 electron 包 E2E 脚本

`packages/electron/package.json` MUST 移除 `bdd` 脚本。

**优先级**: P1

**描述**: 移除 electron 包的 E2E 相关脚本。

**原脚本**:
```json
"bdd": "chokidar \"features/**\" -c \"yarn  cucumber-js\""
```

#### Scenario: 移除 electron 包脚本

**Given** packages/electron/package.json 包含 `bdd` 脚本

**When** 应用本变更

**Then** `bdd` 脚本 MUST 被删除

---

### Requirement: 移除 renderer 包 E2E 脚本

`packages/renderer/package.json` MUST 移除 `bdd` 和 `test:e2e` 脚本。

**优先级**: P1

**描述**: 移除 renderer 包的 E2E 相关脚本。

**原脚本**:
```json
"bdd": "chokidar \"features/**\" -c \"yarn  cucumber-js\"",
"test:e2e": "yarn cucumber-js"
```

#### Scenario: 移除 renderer 包脚本

**Given** packages/renderer/package.json 包含 `bdd` 和 `test:e2e` 脚本

**When** 应用本变更

**Then** `bdd` 脚本 MUST 被删除

**And** `test:e2e` 脚本 MUST 被删除

---

## ADDED Requirements

### Requirement: 项目构建正常

移除依赖后，项目 MUST 正常构建和测试。

**优先级**: P1

**描述**: 验证项目功能正常。

#### Scenario: 验证项目构建

**Given** 已移除 E2E 相关依赖和文件

**When** 执行 `yarn build`

**Then** 项目 MUST 成功构建

**And** 所有子包 MUST 正确构建

#### Scenario: 验证项目测试

**Given** 已移除 E2E 相关依赖和文件

**When** 执行 `yarn test`

**Then** 单元测试 MUST 成功执行

**And** 不应出现 E2E 相关错误
