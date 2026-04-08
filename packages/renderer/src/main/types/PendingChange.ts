export interface PendingChange {
  id: string;
  uri: string;
  /** 修改前的原始文本 */
  originalText: string;
  /** 修改后的新文本 */
  newText: string;
  /** Monaco decoration ID（用于获取实时 range） */
  decorationId: string;
  /** Apply 时的 model versionId，用于冲突检测 */
  versionId: number;
  /** 状态 */
  status: 'pending' | 'accepted' | 'rejected' | 'conflicted';
  /** 冲突描述（status 为 conflicted 时设置） */
  conflictReason?: string;
  /** 变更位置标签，如 "L5-8" */
  label?: string;
}

export interface PendingChangesGroup {
  id: string;
  changes: PendingChange[];
  uri: string;
}
