import React from 'react';
import { Tabs } from '@sinm/react-chrome-tabs';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import type { ItemParams } from 'react-contexify';
import { Menu, Item, useContextMenu, Separator } from 'react-contexify';
import type { TabProperties } from '@sinm/react-chrome-tabs/dist/chrome-tabs';
import useConfirm from '../../../hooks/useConfirm';
import stores from '../../stores';
import { basename, isEquals } from '../../../common/utils/uri';

import '@sinm/react-chrome-tabs/css/chrome-tabs.css';
import 'react-contexify/dist/ReactContexify.css';
import './index.scss';
import { getFileIconClass } from '@sinm/react-file-tree/lib/FileItemWithFileIcon';
import { getFileName } from '@sinm/react-file-tree/lib/utils';

const MENU_ID = 'TABS_MENU';
export default observer(function EditorTabs({ pinnedRight }: { pinnedRight?: React.ReactNode }) {
  const { t } = useTranslation('common');
  const { open: openConfirm, Confirm } = useConfirm();
  const { fileStore, activationStore } = stores;
  const openedFiles = activationStore.openedFiles;
  const tabs: TabProperties[] = openedFiles.map((fileUri) => {
    return {
      title:
        (fileStore.states[fileUri] === 'changed' ? '*' : '') +
        basename(fileUri),
      active: isEquals(fileUri, activationStore.activeFileUri),
      id: fileUri,
      faviconClass: ` ${getFileIconClass(getFileName(fileUri), false)}`,
    };
  });

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const active = (tabId: string) => {
    activationStore.activeFile(tabId);
  };

  const reorder = (tabId: string, from: number, to: number) => {
    activationStore.reorderOpenedFiles(from, to);
  };

  const handleCloseFile = async (uri: string) => {
    const isUnsaved = fileStore.states[uri] === 'changed';
    if (isUnsaved) {
      const confirmed = await openConfirm({
        title: t('unsavedChanges'),
        content: t('unsavedCloseConfirm', { name: basename(uri) }),
      });
      if (!confirmed) return;
      await fileStore.save(uri);
    }
    activationStore.closeFile(uri);
  };

  const remove = (tabId: string) => {
    void handleCloseFile(tabId);
  };

  const handleContextMenu = (tabId: string, event: MouseEvent) => {
    show(event, { props: { tabId } });
  };

  const saveAllUnsaved = async (uris: string[]) => {
    const unsaved = uris.filter((u) => fileStore.states[u] === 'changed');
    if (unsaved.length === 0) return;
    const confirmed = await openConfirm({
      title: t('unsavedChanges'),
      content: t('unsavedBatchCloseConfirm', { count: unsaved.length }),
    });
    if (!confirmed) return false;
    await Promise.all(unsaved.map((u) => fileStore.save(u)));
    return true;
  };

  const handleItemClick = ({ props, data }: ItemParams) => {
    const uri = props.tabId;
    switch (data.action) {
      case 'CLOSE':
        void handleCloseFile(uri);
        break;
      case 'CLOSE_OTHERS': {
        const others = openedFiles.filter((f) => !isEquals(f, uri));
        void saveAllUnsaved(others).then((ok) => {
          if (ok !== false) activationStore.closeOtherFiles(uri);
        });
        break;
      }
      case 'CLOSE_RIGHT': {
        const idx = openedFiles.findIndex((f) => isEquals(f, uri));
        const rightFiles = idx >= 0 ? openedFiles.slice(idx + 1) : [];
        void saveAllUnsaved(rightFiles).then((ok) => {
          if (ok !== false) activationStore.closeRightFiles(uri);
        });
        break;
      }
      case 'CLOSE_LEFT': {
        const idx = openedFiles.findIndex((f) => isEquals(f, uri));
        const leftFiles = idx > 0 ? openedFiles.slice(0, idx) : [];
        void saveAllUnsaved(leftFiles).then((ok) => {
          if (ok !== false) activationStore.closeLeftFiles(uri);
        });
        break;
      }
      case 'CLOSE_SAVED': {
        const saved = openedFiles.filter(
          (f) => fileStore.states[f] !== 'changed',
        );
        void Promise.resolve().then(() => activationStore.closeSavedFiles());
        break;
      }
      case 'CLOSE_ALL': {
        void saveAllUnsaved([...openedFiles]).then((ok) => {
          if (ok !== false) activationStore.closeAllFiles();
        });
        break;
      }
      default:
        break;
    }
  };

  const isCloseRightDisabled = ({ props }: { props?: { tabId?: string } }) => {
    const tabIndex = props?.tabId ? openedFiles.indexOf(props.tabId) : -1;
    return tabIndex < 0 || tabIndex >= openedFiles.length - 1;
  };

  const isCloseLeftDisabled = ({ props }: { props?: { tabId?: string } }) => {
    const tabIndex = props?.tabId ? openedFiles.indexOf(props.tabId) : -1;
    return tabIndex <= 0;
  };

  return (
    <>
      <Confirm />
      <Tabs
        onTabActive={active}
        onTabReorder={reorder}
        onTabClose={remove}
        onContextMenu={handleContextMenu}
        tabs={tabs}
        pinnedRight={pinnedRight}
      ></Tabs>
      <Menu style={{ zIndex: 10001 }} id={MENU_ID}>
        <Item data={{ action: 'CLOSE' }} onClick={handleItemClick}>
          {t('close')}
        </Item>
        <Separator />
        <Item data={{ action: 'CLOSE_OTHERS' }} onClick={handleItemClick}>
          {t('closeOther')}
        </Item>
        <Item data={{ action: 'CLOSE_RIGHT' }} onClick={handleItemClick} disabled={isCloseRightDisabled}>
          {t('closeRight')}
        </Item>
        <Item data={{ action: 'CLOSE_LEFT' }} onClick={handleItemClick} disabled={isCloseLeftDisabled}>
          {t('closeLeft')}
        </Item>
        <Separator />
        <Item data={{ action: 'CLOSE_SAVED' }} onClick={handleItemClick}>
          {t('closeSaved')}
        </Item>
        <Item data={{ action: 'CLOSE_ALL' }} onClick={handleItemClick}>
          {t('closeAll')}
        </Item>
      </Menu>
    </>
  );
});
