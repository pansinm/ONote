import React from 'react';
import { Tabs } from '@sinm/react-chrome-tabs';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import type { ItemParams } from 'react-contexify';
import { Menu, Item, useContextMenu } from 'react-contexify';
import type { TabProperties } from '@sinm/react-chrome-tabs/dist/chrome-tabs';
import stores from '../../stores';
import { basename, isEquals } from '../../../common/utils/uri';

import '@sinm/react-chrome-tabs/css/chrome-tabs.css';
import 'react-contexify/dist/ReactContexify.css';
import './index.scss';
import { getFileIconClass } from '@sinm/react-file-tree/lib/FileItemWithFileIcon';
import { getFileName } from '@sinm/react-file-tree/lib/utils';

const MENU_ID = 'TABS_MENU';
export default observer(function EditorTabs() {
  const { t } = useTranslation('common');
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

  const remove = (tabId: string) => {
    activationStore.closeFile(tabId);
  };

  const handleContextMenu = (tabId: string, event: MouseEvent) => {
    show(event, { props: { tabId } });
  };

  const handleItemClick = ({ props, data }: ItemParams) => {
    const uri = props.tabId;
    switch (data.action) {
      case 'CLOSE':
        activationStore.closeFile(uri);
        break;
      case 'CLOSE_OTHERS':
        activationStore.closeOtherFiles(uri);
        break;
      case 'CLOSE_RIGHT':
        activationStore.closeRightFiles(uri);
        break;
      case 'CLOSE_LEFT':
        activationStore.closeLeftFiles(uri);
        break;
      case 'CLOSE_SAVED':
        activationStore.closeSavedFiles();
        break;
      case 'CLOSE_ALL':
        activationStore.closeAllFiles();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Tabs
        onTabActive={active}
        onTabReorder={reorder}
        onTabClose={remove}
        onContextMenu={handleContextMenu}
        tabs={tabs}
      ></Tabs>
      <Menu style={{ zIndex: 10001 }} id={MENU_ID}>
        <Item data={{ action: 'CLOSE' }} onClick={handleItemClick}>
          {t('close')}
        </Item>
        <Item data={{ action: 'CLOSE_OTHERS' }} onClick={handleItemClick}>
          {t('closeOther')}
        </Item>
        <Item data={{ action: 'CLOSE_RIGHT' }} onClick={handleItemClick}>
          {t('closeRight')}
        </Item>
        <Item data={{ action: 'CLOSE_LEFT' }} onClick={handleItemClick}>
          {t('closeLeft')}
        </Item>
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
