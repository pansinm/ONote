import React from 'react';
import { Tabs } from '@sinm/react-chrome-tabs';
import { observer } from 'mobx-react-lite';
import type { ItemParams } from 'react-contexify';
import { Menu, Item, useContextMenu } from 'react-contexify';
import type { TabProperties } from '@sinm/react-chrome-tabs/dist/chrome-tabs';
import stores from '../../stores';
import { basename } from '/@/utils/uri';

import '@sinm/react-chrome-tabs/css/chrome-tabs.css';
import 'react-contexify/dist/ReactContexify.css';
import markdownIcon from 'bootstrap-icons/icons/markdown.svg';
import './index.scss';
// import diagramIcon from 'bootstrap-icons/icons/diagram-2.svg';

const MENU_ID = 'TABS_MENU';
export default observer(function EditorTabs() {
  // const [menuVisible, setMenuVisible] = useState(false);
  const { fileStore, activationStore } = stores;
  const openedFiles = activationStore.openedFiles;
  const tabs: TabProperties[] = openedFiles.map((fileUri) => {
    return {
      title:
        (fileStore.states[fileUri] === 'changed' ? '*' : '') +
        basename(fileUri),
      active: fileUri === activationStore.activeFileUri,
      id: fileUri,
      favicon: markdownIcon as any,
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
        onTabActivated={active}
        onTabReorder={reorder}
        onTabClosed={remove}
        onContextMenu={handleContextMenu}
        tabs={tabs}
      ></Tabs>
      <Menu id={MENU_ID}>
        <Item data={{ action: 'CLOSE' }} onClick={handleItemClick}>
          关闭
        </Item>
        <Item data={{ action: 'CLOSE_OTHERS' }} onClick={handleItemClick}>
          关闭其他
        </Item>
        <Item data={{ action: 'CLOSE_RIGHT' }} onClick={handleItemClick}>
          关闭右侧
        </Item>
        <Item data={{ action: 'CLOSE_LEFT' }} onClick={handleItemClick}>
          关闭左侧
        </Item>
        <Item data={{ action: 'CLOSE_SAVED' }} onClick={handleItemClick}>
          关闭已保存
        </Item>
        <Item data={{ action: 'CLOSE_ALL' }} onClick={handleItemClick}>
          全部关闭
        </Item>
      </Menu>
    </>
  );
});
