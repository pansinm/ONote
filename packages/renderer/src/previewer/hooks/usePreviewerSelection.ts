import { useEffect } from 'react';
import tunnel from '../ipc/tunnel';
import IPCMethod from '/@/common/ipc/IPCMethod';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('PreviewerSelection');

/**
 * 监听 previewer 中的文本选择，并通过 tunnel 发送选择内容
 */
export function usePreviewerSelection() {
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        return;
      }

      logger.info('Text selected in previewer', { selectedText, length: selectedText.length });

      // 通过 tunnel 发送选择内容到主应用
      tunnel.send(IPCMethod.PreviewerSelectionChangedEvent, {
        content: selectedText,
      });
    };

    // 监听鼠标抬起事件（选择文本时触发）
    document.addEventListener('mouseup', handleSelection);

    // 清理函数
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);
}
