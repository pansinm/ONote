import { getCurrentRange, selectionToRange } from '../monaco/utils';
import stores from '../stores';
import * as monaco from 'monaco-editor';

export const SYSTEM_INSTRUCTIONS = `
你是ONote笔记助手，非常擅长帮助用户编写、整理笔记。
- 用户需要绘制图形时，请使用\`mermaid\`代码块绘制。
- 一次仅调用一个工具

在用户消息后面，会附加xml标签标识当前状态。

<opened_notes>
[已打开的笔记列表]
file://...a.md
file://...b.md
...
</opened_notes>

<current_note>
[当前笔记]
file://...c.md
</current_note>

<note_selection>
[选中文本状态]
<selected_text>
选中的文本
</selected_text>
<start_row>1</start_row>
<start_col>1</start_col>
<end_row>3</end_row>
<end_col>100</end_col>
</note_selection>
`.trim();

export function buildMessageState() {
  const editor = monaco.editor.getEditors()[0];
  const selection = editor.getSelection();
  const selectionXml = selection
    ? `<note_selection>
[选中文本状态]
<selected_text>
${editor.getModel()?.getValueInRange(selectionToRange(selection!))}
</selected_text>
<start_row>${selection?.startLineNumber}</start_row>
<start_col>${selection?.startColumn}</start_col>
<end_row>${selection?.endLineNumber}</end_row>
<end_col>${selection?.endColumn}</end_col>
</note_selection>`
    : '<note_selection>\n无\n</note_selection>';
  return `<opened_notes>
${stores.fileListStore.files.map((file) => file.uri).join('\n')}
</opened_notes>

<current_note>
[当前笔记]
${stores.activationStore.activeFileUri}
</current_note>

${selectionXml}`;
}
