# 发布流程

## 版本号规则

遵循 [Semantic Versioning](https://semver.org/)：`MAJOR.MINOR.PATCH`

- **PATCH**（0.14.0 → 0.14.1）：bug 修复、小改进，无新功能、无破坏性变更
- **MINOR**（0.14.0 → 0.15.0）：新功能，向后兼容
- **MAJOR**（0.14.0 → 1.0.0）：破坏性变更

当前阶段（0.x），所有变更视作 MINOR，API 随时可能变动。

## 发布步骤

```
1. 确认所有改动已合并到 main

2. 更新版本号
   手动修改根目录 package.json 的 version 字段

3. 写 CHANGELOG
   在项目根目录 CHANGELOG.md 追加本次变更摘要（日期 + 版本号 + 改动列表）

4. 提交并打 tag
   git add -A
   git commit -m "release: v0.x.x"
   git tag v0.x.x
   git push origin main --tags

5. CI 构建
   GitHub Actions 自动构建三平台安装包（macOS .dmg / Windows .exe / Linux .AppImage）

6. 发布
   在 GitHub Releases 页面创建新 Release，选择 tag，粘贴 CHANGELOG 内容，上传构建产物
```

## 注意事项

- 发布前本地跑一次 `yarn build`，确认构建无报错
- `yarn compile` 产出安装包，CI 里执行，本地一般不需要
- 如果涉及数据库 schema 变更，CHANGELOG 里必须单独标注迁移说明
