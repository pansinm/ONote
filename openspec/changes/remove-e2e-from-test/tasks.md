# 任务列表：移除 e2e 测试

## 任务 1: 修改 package.json test 脚本

**状态**: 待执行

**验收条件**:
- [ ] `yarn test` 命令从 `jest --coverage=false && yarn build && yarn test:e2e` 改为 `jest --coverage=false`
- [ ] 移除 `test:e2e` 脚本

**验证步骤**:
```bash
# 执行 yarn test，确认仅运行单元测试
yarn test
```

**依赖**: 无

---

## 任务 2: 运行测试验证

**状态**: 待执行

**验收条件**:
- [ ] `yarn test` 成功执行所有单元测试
- [ ] 测试输出不包含 E2E 测试相关内容

**验证步骤**:
```bash
# 运行测试
yarn test

# 预期输出: 仅显示 Jest 测试结果，不包含 Cucumber/E2E 相关输出
```

**依赖**: 任务 1 完成
