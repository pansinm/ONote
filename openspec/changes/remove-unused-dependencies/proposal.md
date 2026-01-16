# 变更提案：移除无用依赖和 E2E 测试配置

## Summary

清理项目中不再使用的 E2E 测试相关依赖和配置文件，包括 Cucumber、Playwright、chokidar 等。

## Why

1. E2E 测试已被移除（之前的变更），相关依赖不再需要
2. 减少依赖数量，降低安装时间和包体积
3. 减少维护负担和潜在安全漏洞
4. 保持项目整洁

## What Changes

- 移除根目录的 `@cucumber/cucumber` 和 `chokidar` 依赖
- 移除 `packages/electron` 的 `playwright` 和 `chokidar` 依赖及脚本
- 移除 `packages/renderer` 的 `chokidar-cli`、bdd 和 test:e2e 脚本
- 删除 `packages/electron/cucumber.json` 配置文件
- 删除 `packages/electron/features/` 目录

## Problem Statement

之前的变更移除了 E2E 测试的执行，但相关依赖和配置文件仍保留在项目中，造成冗余。

## Proposed Solution

完整清理 E2E 测试相关配置和依赖。

### 需要删除的文件/目录

- `packages/electron/cucumber.json`
- `packages/electron/features/` (包含 step_definitions, support, *.feature 文件)

### 需要修改的依赖

**根目录 package.json**:
```diff
- "@cucumber/cucumber": "^10.3.1",
- "chokidar": "^3.5.3",
```

**packages/electron/package.json**:
```diff
- "chokidar": "^3.5.3",
- "playwright": "1.19.1",
```

**packages/renderer/package.json**:
```diff
- "chokidar-cli": "^3.0.0",
```

### 需要修改的脚本

**packages/electron/package.json**:
```diff
- "bdd": "chokidar \"features/**\" -c \"yarn  cucumber-js\"",
```

**packages/renderer/package.json**:
```diff
- "bdd": "chokidar \"features/**\" -c \"yarn  cucumber-js\"",
- "test:e2e": "yarn cucumber-js",
```

## Scope

### In Scope

- 删除 E2E 测试相关文件
- 移除 E2E 测试相关依赖
- 移除 E2E 测试相关脚本

### Out of Scope

- 修改其他功能相关的依赖
- 修改构建配置

## Dependencies

无

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 误删有用文件 | 低 | 仅删除 features/ 和 cucumber.json |
| CI/CD 依赖 | 低 | CI 通常独立配置 |

## Success Criteria

1. `@cucumber/cucumber`, `playwright`, `chokidar` 相关依赖已移除
2. `features/` 目录和 `cucumber.json` 已删除
3. E2E 相关脚本已移除
4. 项目正常构建和测试

## Timeline

- **Phase 1**: 删除文件和清理依赖
- **Phase 2**: 验证项目功能

## Open Questions

无
