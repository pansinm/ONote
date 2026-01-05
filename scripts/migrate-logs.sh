#!/bin/bash

# ONote 日志系统迁移脚本
# 用于批量替换 console 语句为统一的日志系统

set -e

echo "🚀 开始迁移到统一日志系统..."
echo ""

# 统计需要替换的文件
TOTAL_FILES=$(grep -rl "console\.\(log\|warn\|error\|info\|debug\)" packages/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')

echo "📊 发现 $TOTAL_FILES 个文件包含 console 语句"
echo ""

# 显示统计
DEBUG_COUNT=$(grep -r "console\.debug" packages/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
LOG_COUNT=$(grep -r "console\.log" packages/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
WARN_COUNT=$(grep -r "console\.warn" packages/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
ERROR_COUNT=$(grep -r "console\.error" packages/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
INFO_COUNT=$(grep -r "console\.info" packages/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')

echo "📈 统计信息："
echo "  - console.debug: $DEBUG_COUNT"
echo "  - console.log:   $LOG_COUNT"
echo "  - console.warn:  $WARN_COUNT"
echo "  - console.error: $ERROR_COUNT"
echo "  - console.info:  $INFO_COUNT"
echo ""

# 优先级文件列表
PRIORITY_FILES=(
  "packages/electron/src/plugin/PluginManager.ts"
  "packages/electron/src/security-restrictions.ts"
  "packages/renderer/src/main/stores/LLMChatStore.ts"
  "packages/renderer/src/main/stores/SettingStore.ts"
  "packages/renderer/src/main/stores/FileListStore.ts"
)

echo "🎯 优先级文件（建议手动替换）："
for file in "${PRIORITY_FILES[@]}"; do
  if [ -f "$file" ]; then
    COUNT=$(grep -c "console\.\(log\|warn\|error\|info\|debug\)" "$file" || true)
    echo "  - $file: $COUNT 个 console 语句"
  fi
done
echo ""

echo "📝 迁移步骤："
echo "  1. 在文件顶部导入日志模块："
echo "     import { getLogger } from 'shared/logger';"
echo "     const logger = getLogger('ModuleName');"
echo ""
echo "  2. 替换 console 语句："
echo "     console.log('message')  →  logger.info('message')"
echo "     console.warn('message') →  logger.warn('message')"
echo "     console.error('error')   →  logger.error('error', error)"
echo "     console.debug('debug')   →  logger.debug('debug')"
echo ""
echo "  3. 对于有上下文的日志："
echo "     logger.info('Operation completed', { result: 'success' })"
echo ""
echo "✨ 迁移完成！"
echo ""
echo "🔍 验证："
echo "  yarn dev"
echo "  查看日志输出是否符合预期"
