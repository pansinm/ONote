# 任务列表：移除 e2e 测试

## 任务 1: 修改 package.json test 脚本

**状态**: ✅ 已完成

**验收条件**:
- [x] `yarn test` 命令从原始配置改为当前配置
- [x] 移除 `test:e2e` 脚本

**说明**: 此变更已被后续的 `replace-turbo-with-workspaces` 和 `remove-unused-dependencies` 变更实现。

**当前配置**:
```json
{
  "scripts": {
    "test": "yarn workspaces run test"
  }
}
```

---

## 任务 2: 运行测试验证

**状态**: ✅ 已完成

**验收条件**:
- [x] `yarn test` 成功执行所有单元测试
- [x] 测试输出不包含 E2E 测试相关内容

**验证步骤**:
```bash
yarn test
```

**结果**:
- electron: 2/2 测试通过
- shared: 16/16 测试通过
- 无 E2E/Cucumber 相关输出
