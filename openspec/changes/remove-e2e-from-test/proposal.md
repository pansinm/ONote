# 变更提案：移除 e2e 测试，仅保留单元测试

## Summary

简化 `yarn test` 命令，仅执行 Jest 单元测试，移除构建和 E2E 测试步骤。

## Why

当前 `yarn test` 命令执行完整流程：单元测试 → 构建项目 → E2E 测试。这种配置导致：

1. 单元测试执行时间延长，需要等待不必要的构建步骤
2. E2E 测试需要完整应用环境，频繁运行增加开销
3. 开发者日常开发仅需验证单元测试结果

## What Changes

- 修改 package.json 中的 test 脚本配置
- 移除 test:e2e 脚本

## Problem Statement

当前 `yarn test` 命令执行完整流程：单元测试 → 构建项目 → E2E 测试。这种配置导致开发者需要等待不必要的构建和 E2E 测试步骤。

## Proposed Solution

修改 package.json 中的 test 脚本，移除 build 和 test:e2e 步骤，仅保留 jest 单元测试。

### 详细配置变更

**当前配置**:
```json
{
  "scripts": {
    "test": "jest --coverage=false && yarn build && yarn test:e2e",
    "test:e2e": "yarn cucumber-js"
  }
}
```

**目标配置**:
```json
{
  "scripts": {
    "test": "jest --coverage=false"
  }
}
```

### 可选清理项（后续可执行）

如需完全移除 E2E 测试功能，可额外执行：
- 删除 `packages/electron/features/` 目录
- 移除 `@cucumber/cucumber` 依赖
- 删除 `cucumber.json` 配置文件

本提案仅包含 test 脚本修改。

## Scope

### In Scope

- 修改 package.json 中的 test 脚本配置
- 移除 test:e2e 脚本

### Out of Scope

- 移除 E2E 测试相关文件和依赖（可作为后续变更）
- 修改 CI/CD 配置

## Dependencies

无

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CI/CD 流程依赖原有配置 | 低 | CI 通常独立配置 test 命令 |

## Success Criteria

1. `yarn test` 仅执行 Jest 单元测试
2. test:e2e 脚本已移除
3. 单元测试正常运行

## Timeline

- **Phase 1**: 修改 package.json 配置
- **Phase 2**: 验证测试执行

## Open Questions

无
