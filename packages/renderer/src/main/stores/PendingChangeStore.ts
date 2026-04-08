import { makeAutoObservable, runInAction } from 'mobx';
import * as monaco from 'monaco-editor';
import { v4 as uuidv4 } from 'uuid';

import stores from './index';
import { applyModelEdits } from '../monaco/utils';
import type { PendingChange, PendingChangesGroup } from '../types/PendingChange';

function getModel(uri: string) {
  return monaco.editor.getModel(monaco.Uri.parse(uri));
}

export class PendingChangeStore {
  groups: PendingChangesGroup[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get hasPending(): boolean {
    return this.groups.some((g) =>
      g.changes.some((c) => c.status === 'pending'),
    );
  }

  hasPendingForUri(uri: string): boolean {
    return this.groups.some(
      (g) => g.uri === uri && g.changes.some((c) => c.status === 'pending'),
    );
  }

  addGroup(uri: string, changes: PendingChange[]) {
    runInAction(() => {
      this.groups.push({
        id: uuidv4(),
        changes,
        uri,
      });
    });
  }

  acceptChange(groupId: string, changeId: string) {
    const group = this.groups.find((g) => g.id === groupId);
    const change = group?.changes.find((c) => c.id === changeId);
    if (!change || change.status !== 'pending') return;

    const model = getModel(change.uri);
    if (!model) return;

    // Monaco 操作：移除 decoration
    model.deltaDecorations([change.decorationId], []);

    // MobX 状态更新
    runInAction(() => {
      change.status = 'accepted';
      this.checkGroupComplete(group!);
    });
  }

  rejectChange(groupId: string, changeId: string) {
    const group = this.groups.find((g) => g.id === groupId);
    const change = group?.changes.find((c) => c.id === changeId);
    if (!change || change.status !== 'pending') return;

    const model = getModel(change.uri);

    // model 已 disposed，无法 revert，标记为 rejected 并清理
    if (!model) {
      runInAction(() => {
        change.status = 'rejected';
        this.checkGroupComplete(group!);
      });
      return;
    }

    // 从 decoration 获取实时 range；decoration 已丢失则标记为 rejected 清理
    const currentRange = model.getDecorationRange(change.decorationId);
    if (!currentRange) {
      runInAction(() => {
        change.status = 'rejected';
        this.checkGroupComplete(group!);
      });
      return;
    }

    // 冲突检测：检查 decoration 范围内的文本是否仍是 Agent 写入的内容
    const currentTextInRange = model.getValueInRange(currentRange);
    if (currentTextInRange !== change.newText) {
      // 用户已手动修改了该区域，标记为 conflicted 交由用户决定
      model.deltaDecorations([change.decorationId], []);
      runInAction(() => {
        change.status = 'conflicted';
        change.conflictReason = 'Content was modified manually after Agent edit';
        this.checkGroupComplete(group!);
      });
      return;
    }

    // Monaco 操作（在 runInAction 之前）
    applyModelEdits(model, [
      {
        range: currentRange,
        text: change.originalText,
        forceMoveMarkers: true,
      },
    ]);
    model.deltaDecorations([change.decorationId], []);

    // MobX 状态更新
    runInAction(() => {
      change.status = 'rejected';
      this.checkGroupComplete(group!);
    });
  }

  acceptAll(groupId: string) {
    const group = this.groups.find((g) => g.id === groupId);
    if (!group) return;

    const model = getModel(group.uri);

    // Monaco 操作：移除所有 pending decoration
    const decorationIds = group.changes
      .filter((c) => c.status === 'pending')
      .map((c) => c.decorationId);
    if (model && decorationIds.length) {
      model.deltaDecorations(decorationIds, []);
    }

    runInAction(() => {
      group.changes.forEach((c) => {
        if (c.status === 'pending') c.status = 'accepted';
      });
      this.checkGroupComplete(group);
    });
  }

  rejectAll(groupId: string) {
    const group = this.groups.find((g) => g.id === groupId);
    if (!group) return;

    const model = getModel(group.uri);
    if (!model) {
      // model 已 disposed，无法 revert，直接标记为 rejected 清理掉
      runInAction(() => {
        group.changes.forEach((c) => {
          if (c.status === 'pending') c.status = 'rejected';
        });
        this.checkGroupComplete(group);
      });
      return;
    }

    // 显式按行号降序排列（从文件底部往顶部 revert）
    // 确保 decoration 位置在之前的 revert 不会被后续操作偏移
    const pendingChanges = group.changes
      .filter((c) => c.status === 'pending')
      .sort((a, b) => {
        const rangeA = model.getDecorationRange(a.decorationId);
        const rangeB = model.getDecorationRange(b.decorationId);
        return (rangeB?.startLineNumber ?? 0) - (rangeA?.startLineNumber ?? 0);
      });

    for (const change of pendingChanges) {
      const range = model.getDecorationRange(change.decorationId);
      if (range) {
        applyModelEdits(model, [
          {
            range,
            text: change.originalText,
            forceMoveMarkers: true,
          },
        ]);
      }
      model.deltaDecorations([change.decorationId], []);
    }

    runInAction(() => {
      group.changes.forEach((c) => {
        if (c.status === 'pending') c.status = 'rejected';
      });
      this.checkGroupComplete(group);
    });
  }

  /** 关闭文件时调用：revert 该 URI 所有 pending changes */
  revertAllForUri(uri: string) {
    const uriGroups = this.groups.filter((g) => g.uri === uri);
    for (const group of uriGroups) {
      this.rejectAll(group.id);
    }
  }

  private checkGroupComplete(group: PendingChangesGroup) {
    const allDone = group.changes.every((c) => c.status !== 'pending');
    if (allDone) {
      const hasAccepted = group.changes.some((c) => c.status === 'accepted');
      if (hasAccepted) {
        stores.fileStore.save(group.uri);
      }
      const idx = this.groups.indexOf(group);
      if (idx !== -1) this.groups.splice(idx, 1);
    }
  }
}
