# 规格变更：使用 yarn workspaces 替代 turbo

## REMOVED Requirements

### Requirement: turbo.json 配置

`turbo.json` 配置文件必须被删除。

**优先级**: P1

**描述**: 删除 turbo.json 配置文件。

#### Scenario: 删除 turbo.json

**Given** 项目根目录存在 `turbo.json` 文件

**When** 应用本变更

**Then** `turbo.json` 文件必须被删除

**And** 不再使用 turbo 命令

---

## MODIFIED Requirements

### Requirement: build 脚本使用 yarn workspaces

根目录 `package.json` 中的 `build` 脚本 MUST 使用 `yarn workspaces run build` 替代 `turbo build`。

**优先级**: P1

**描述**: 修改 build 脚本配置。

**原配置**:
```json
{
  "scripts": {
    "build": "rm -rf packages/*/dist && turbo build"
  }
}
```

**新配置**:
```json
{
  "scripts": {
    "build": "rm -rf packages/*/dist && yarn workspaces run build"
  }
}
```

#### Scenario: 修改 build 脚本

**Given** package.json 脚本配置

**When** 应用本变更

**Then** `build` 脚本必须使用 `yarn workspaces run build`

**And** 执行 `yarn build` 时必须构建所有子包

---

### Requirement: 子包构建脚本不变

子包的 `build` 脚本 MUST 保持不变。

**优先级**: P1

**描述**: 子包构建命令兼容。

**当前子包配置**:
- `packages/electron`: `"build": "NODE_ENV=production webpack"`
- `packages/renderer`: `"build": "NODE_ENV=production webpack"`
- `packages/shared`: `"build": "tsc"`

#### Scenario: 子包构建验证

**Given** 子包 `build` 脚本配置

**When** 执行 `yarn workspaces run build`

**Then** `packages/electron` 必须使用 webpack 构建

**And** `packages/renderer` 必须使用 webpack 构建

**And** `packages/shared` 必须使用 tsc 构建

---

## ADDED Requirements

### Requirement: yarn workspaces 命令执行

`yarn workspaces run build` 命令 MUST 在所有 workspace 中执行 build 脚本。

**优先级**: P1

**描述**: yarn workspaces 命令功能。

#### Scenario: 执行 workspaces build

**Given** 所有子包配置了 build 脚本

**When** 执行 `yarn workspaces run build`

**Then** 必须在所有子包并行执行 build 脚本

**And** 每个子包的构建产物必须输出到对应目录
