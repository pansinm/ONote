# 规格变更：单元测试仅执行

## ADDED Requirements

### Requirement: test 脚本仅执行单元测试

`yarn test` 命令 MUST 仅执行 Jest 单元测试，不包含构建和 E2E 测试步骤。

**优先级**: P1

**描述**: `yarn test` 命令应仅执行 Jest 单元测试，不包含构建和 E2E 测试。

#### Scenario: 执行 test 脚本

**Given** 项目已安装依赖

**When** 用户执行 `yarn test` 命令

**Then** 仅运行 Jest 单元测试

**And** 不触发项目构建

**And** 不触发 E2E 测试

---

## MODIFIED Requirements

### Requirement: 修改 test 脚本配置

package.json 中的 test 脚本 MUST 移除 build 和 e2e 测试步骤，仅保留 jest 单元测试。

**优先级**: P1

**描述**: 修改 package.json 中的 test 脚本配置。

**原配置**:
```json
{
  "scripts": {
    "test": "jest --coverage=false && yarn build && yarn test:e2e",
    "test:e2e": "yarn cucumber-js"
  }
}
```

**新配置**:
```json
{
  "scripts": {
    "test": "jest --coverage=false"
  }
}
```

#### Scenario: 修改 test 脚本

**Given** package.json 脚本配置

**When** 应用本变更

**Then** `test` 脚本命令 MUST 缩短

**And** MUST 移除 `yarn build` 步骤

**And** MUST 移除 `yarn test:e2e` 步骤
