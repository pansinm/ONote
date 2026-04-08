/**
 * PendingChangesBar 组件
 * 显示 Agent 对当前文件的待审阅修改列表，支持逐条或全部接受/拒绝。
 * 通过 MobX observer 观察 pendingChangeStore.groups。
 */

import classNames from 'classnames';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Button } from '@fluentui/react-components';
import {
  CheckmarkRegular,
  DismissRegular,
  ErrorCircleRegular,
} from '@fluentui/react-icons';
import stores from '/@/main/stores';
import type { PendingChange, PendingChangesGroup } from '/@/main/types/PendingChange';
import styles from './PendingChangesBar.module.scss';

// ========== 变更类型推断 ==========

type ChangeKind = 'insert' | 'delete' | 'change';

function inferChangeKind(change: PendingChange): ChangeKind {
  if (change.originalText === '') return 'insert';
  if (change.newText === '') return 'delete';
  return 'change';
}

function changeKindSymbol(kind: ChangeKind): string {
  switch (kind) {
    case 'insert': return '+';
    case 'delete': return '−';
    case 'change': return '~';
  }
}

// ========== 单条变更行 ==========

interface ChangeRowProps {
  change: PendingChange;
  groupId: string;
  onAccept: (groupId: string, changeId: string) => void;
  onReject: (groupId: string, changeId: string) => void;
}

const ChangeRow: FC<ChangeRowProps> = React.memo(({ change, groupId, onAccept, onReject }) => {
  const { t } = useTranslation('llmbox');
  const kind = inferChangeKind(change);
  const lineCount = change.newText ? change.newText.split('\n').length : change.originalText.split('\n').length;

  if (change.status === 'conflicted') {
    return (
      <div className={classNames(styles.row, styles['row--conflicted'])}>
        <ErrorCircleRegular className={styles.row__icon} />
        <span className={styles.row__label}>{change.label || '—'}</span>
        <span className={styles.row__desc}>{change.conflictReason || t('conflicted')}</span>
      </div>
    );
  }

  return (
    <div className={classNames(styles.row, styles[`row--${kind}`])}>
      <span className={styles.row__symbol}>{changeKindSymbol(kind)}</span>
      <span className={styles.row__label}>{change.label || '—'}</span>
      <span className={styles.row__desc}>{t(kind, { count: lineCount })}</span>
      <div className={styles.row__actions}>
        <button
          className={styles.miniBtn}
          onClick={() => onAccept(groupId, change.id)}
          aria-label={t('accept')}
          type="button"
        >
          <CheckmarkRegular />
        </button>
        <button
          className={styles.miniBtn}
          onClick={() => onReject(groupId, change.id)}
          aria-label={t('reject')}
          type="button"
        >
          <DismissRegular />
        </button>
      </div>
    </div>
  );
});

ChangeRow.displayName = 'ChangeRow';

// ========== PendingChangesBar 主组件 ==========

const PendingChangesBar: FC = observer(() => {
  const { pendingChangeStore, activationStore } = stores;
  const activeUri = activationStore.activeFileUri;

  // 只显示当前活动文件相关的 groups（含 pending 和 conflicted）
  const activeGroups = pendingChangeStore.groups.filter(
    (g) => g.uri === activeUri && g.changes.some((c) => c.status === 'pending' || c.status === 'conflicted'),
  );

  if (activeGroups.length === 0) return null;

  return (
    <div className={styles.container}>
      {activeGroups.map((group) => (
        <GroupBlock key={group.id} group={group} />
      ))}
    </div>
  );
});

// ========== Group 区块 ==========

interface GroupBlockProps {
  group: PendingChangesGroup;
}

const GroupBlock: FC<GroupBlockProps> = observer(({ group }) => {
  const { t } = useTranslation('llmbox');
  const visibleChanges = group.changes.filter(
    (c) => c.status === 'pending' || c.status === 'conflicted',
  );
  if (visibleChanges.length === 0) return null;

  const { pendingChangeStore } = stores;

  // 稳定回调，避免每 render 创建新函数引用
  const handleAccept = useCallback(
    (groupId: string, changeId: string) => pendingChangeStore.acceptChange(groupId, changeId),
    [pendingChangeStore],
  );
  const handleReject = useCallback(
    (groupId: string, changeId: string) => pendingChangeStore.rejectChange(groupId, changeId),
    [pendingChangeStore],
  );

  const pendingCount = group.changes.filter((c) => c.status === 'pending').length;

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <span className={styles.header__text}>
          ⚠ {t('pendingChangesTitle', { count: pendingCount })}
        </span>
        <div className={styles.header__actions}>
          <Button
            size="small"
            appearance="subtle"
            icon={<CheckmarkRegular />}
            onClick={() => pendingChangeStore.acceptAll(group.id)}
          >
            {t('acceptAll')}
          </Button>
          <Button
            size="small"
            appearance="subtle"
            icon={<DismissRegular />}
            onClick={() => pendingChangeStore.rejectAll(group.id)}
          >
            {t('rejectAll')}
          </Button>
        </div>
      </div>
      <div className={styles.body}>
        {visibleChanges.map((change) => (
          <ChangeRow
            key={change.id}
            change={change}
            groupId={group.id}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
});

PendingChangesBar.displayName = 'PendingChangesBar';

export default PendingChangesBar;
