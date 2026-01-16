# 变更提案：移除 turbo，使用 yarn workspaces 管理项目

## Summary

移除 Turborepo 依赖，使用 Yarn Workspaces 原生功能管理 monorepo 构建流程，保持命令兼容。

## Why

1. 简化项目依赖，减少外部工具依赖
2. Yarn Workspaces 已能满足当前项目的构建需求
3. 降低维护成本和学习曲线
4. turbo.json 仅配置了 `build` 和 `dev` 任务，功能简单

## What Changes

- 删除 `turbo.json` 配置文件
- 修改 `package.json` 中的 `build` 脚本
- 移除对 turbo 的依赖（如有）

## Problem Statement

当前项目使用 Turborepo 管理 monorepo 构建，但仅使用了其基础的 `build` 和 `dev` 任务。对于这种简单场景，Yarn Workspaces 的 `workspaces run` 命令完全可以替代。

## Proposed Solution

使用 `yarn workspaces run <script>` 替代 `turbo <task>`：

**当前配置**:
```json
{
  "scripts": {
    "build": "rm -rf packages/*/dist && turbo build"
  }
}
```

**目标配置**:
```json
{
  "scripts": {
    "build": "rm -rf packages/*/dist && yarn workspaces run build"
  }
}
```

子包 `build` 脚本保持不变：
- `packages/electron`: `NODE_ENV=production webpack`
- `packages/renderer`: `NODE_ENV=production webpack`
- `packages/shared`: `tsc`

## Scope

### In Scope

- 删除 `turbo.json`
- 修改根目录 `package.json` build 脚本
- 移除 turbo 相关配置

### Out of Scope

- 修改子包构建脚本
- 修改其他脚本命令

## Dependencies

无

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 构建顺序变化 | 低 | 三个子包独立构建，无依赖 |
| 并行构建性能 | 低 | yarn workspaces 默认并行执行 |

## Success Criteria

1. `yarn build` 命令正常工作
2. 所有子包正确构建
3. `turbo.json` 已删除

## Timeline

- **Phase 1**: 删除 turbo.json，修改 package.json
- **Phase 2**: 验证构建命令

## Open Questions

无
