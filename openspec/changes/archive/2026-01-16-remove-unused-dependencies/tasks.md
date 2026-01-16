# 任务列表：移除无用依赖和 E2E 测试配置

## 任务 1: 删除 E2E 测试相关文件

**状态**: ✅ 已完成

**验收条件**:
- [x] 删除 `packages/electron/cucumber.json`
- [x] 删除 `packages/electron/features/` 目录及其所有内容

**验证步骤**:
```bash
ls packages/electron/cucumber.json        # 应不存在
ls packages/electron/features/            # 应不存在
```

**依赖**: 无

---

## 任务 2: 清理根目录 package.json 依赖

**状态**: ✅ 已完成

**验收条件**:
- [x] 移除 `@cucumber/cucumber`
- [x] 移除 `chokidar`

**原配置**:
```json
"devDependencies": {
  "@cucumber/cucumber": "^10.3.1",
  "chokidar": "^3.5.3",
  "sharp": "^0.34.5"
}
```

**验证步骤**:
```bash
grep -A2 "devDependencies" package.json | grep -E "cucumber|chokidar"
# 应无输出
```

**依赖**: 任务 1 完成

---

## 任务 3: 清理 packages/electron/package.json

**状态**: ✅ 已完成

**验收条件**:
- [x] 移除 `chokidar` 依赖
- [x] 移除 `playwright` 依赖
- [x] 移除 `bdd` 脚本

**原配置**:
```json
"scripts": {
  "bdd": "chokidar \"features/**\" -c \"yarn  cucumber-js\"",
  ...
}
"devDependencies": {
  "chokidar": "^3.5.3",
  "playwright": "1.19.1",
  ...
}
```

**验证步骤**:
```bash
grep -E "bdd|chokidar|playwright" packages/electron/package.json
# 应无输出
```

**依赖**: 任务 2 完成

---

## 任务 4: 清理 packages/renderer/package.json

**状态**: ✅ 已完成

**验收条件**:
- [x] 移除 `chokidar-cli` 依赖
- [x] 移除 `bdd` 脚本
- [x] 移除 `test:e2e` 脚本

**原配置**:
```json
"scripts": {
  "bdd": "chokidar \"features/**\" -c \"yarn  cucumber-js\"",
  "test:e2e": "yarn cucumber-js",
  ...
}
"devDependencies": {
  "chokidar-cli": "^3.0.0",
  ...
}
```

**验证步骤**:
```bash
grep -E "bdd|test:e2e|chokidar-cli" packages/renderer/package.json
# 应无输出
```

**依赖**: 任务 3 完成

---

## 任务 5: 验证项目功能

**状态**: ✅ 已完成

**验收条件**:
- [x] `yarn install` 成功
- [x] `yarn build` 成功
- [x] `yarn test` 成功（electron: 2/2 通过, shared: 16/16 通过）

**验证步骤**:
```bash
yarn install
yarn build
yarn test
```

**依赖**: 任务 4 完成

**注意**: renderer 包存在一些测试配置问题（非本次变更引入），不影响核心功能验证。
