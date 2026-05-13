#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error('❌ 缺少 commit message 文件路径');
  process.exit(1);
}

const message = fs.readFileSync(path.resolve(commitMsgFile), 'utf8').trim();
const subject = message.split(/\r?\n/)[0].trim();

if (!subject) {
  console.error('❌ 提交消息不能为空');
  process.exit(1);
}

const bypassPrefixes = ['Merge ', 'Revert ', 'fixup!', 'squash!'];
if (bypassPrefixes.some((prefix) => subject.startsWith(prefix))) {
  process.exit(0);
}

const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|revert)(\([^)]+\))?(!)?:\s.+$/;
const hasChinese = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;

if (!conventionalCommitPattern.test(subject)) {
  console.error('❌ 提交标题必须符合 Conventional Commits 格式');
  console.error('   例如：feat(editor): 添加大纲面板');
  process.exit(1);
}

const subjectText = subject.replace(/^(feat|fix|docs|style|refactor|perf|test|chore|ci|revert)(\([^)]+\))?(!)?:\s/, '');
if (!hasChinese.test(subjectText)) {
  console.error('❌ 提交标题必须使用中文描述变更内容');
  console.error('   例如：fix(previewer): 修复滚动同步问题');
  process.exit(1);
}

process.exit(0);
