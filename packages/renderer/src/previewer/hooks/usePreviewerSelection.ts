import { useEffect, useRef } from 'react';
import tunnel from '../ipc/tunnel';
import IPCMethod from '/@/common/ipc/IPCMethod';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('PreviewerSelection');

export function usePreviewerSelection() {
  const hadSelectionRef = useRef(false);

  useEffect(() => {
    const handleMouseDown = () => {
      const selection = window.getSelection();
      hadSelectionRef.current = !!selection && !selection.isCollapsed;
    };

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection) {
        if (hadSelectionRef.current) {
          logger.info('Selection cleared (no selection object)');
          tunnel.send(IPCMethod.PreviewerSelectionChangedEvent, {
            content: '',
          });
          hadSelectionRef.current = false;
        }
        return;
      }

      if (selection.isCollapsed) {
        if (hadSelectionRef.current) {
          logger.info('Selection cleared');
          tunnel.send(IPCMethod.PreviewerSelectionChangedEvent, {
            content: '',
          });
        }
        hadSelectionRef.current = false;
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        return;
      }

      logger.info('Text selected in previewer', { selectedText, length: selectedText.length });

      tunnel.send(IPCMethod.PreviewerSelectionChangedEvent, {
        content: selectedText,
      });
      hadSelectionRef.current = true;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleSelection);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);
}
