# 任务列表：移除 turbo，使用 yarn workspaces

## 任务 1: 删除 turbo.json

**状态**: ✅ 已完成

**验收条件**:
- [x] 删除 `turbo.json` 文件

**验证步骤**:
```bash
ls turbo.json  # 应提示文件不存在
```

**依赖**: 无

---

## 任务 2: 修改 package.json build 脚本

**状态**: ✅ 已完成

**验收条件**:
- [x] `package.json` 中 `build` 脚本从 `turbo build` 改为 `yarn workspaces run build`

**验证步骤**:
```bash
grep '"build"' package.json
# 应输出: "build": "rm -rf packages/*/dist && yarn workspaces run build"
```

**依赖**: 任务 1 完成

---

## 任务 3: 验证构建命令

**状态**: ✅ 已完成

**验收条件**:
- [x] `yarn build` 成功执行
- [x] 所有子包正确构建

**验证步骤**:
```bash
yarn build
# 应输出各子包构建日志，无报错
```

**依赖**: 任务 2 完成
