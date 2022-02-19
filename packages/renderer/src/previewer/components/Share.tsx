import React, { useRef, useState } from 'react';
import Icon from '/@/components/Icon';
// import confluence from '../../../assets/confluence.ico';
import './Share.scss';
import classNames from 'classnames';
import { useClickAway } from 'react-use';
import { ipcRenderer } from 'electron';

export default function Share() {
  const [opened, setOpened] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => setOpened(false));
  return (
    <div
      className="share"
      ref={ref}
      onClick={() => setOpened((opened) => !opened)}
    >
      <Icon type="share" />
      <ul className={classNames('share-menu', { open: opened })}>
        <li onClick={() => ipcRenderer.invoke('open-confluence')}>
          <a>
            {/* <img src={confluence}></img>分享到Confluence */}
          </a>
        </li>
      </ul>
    </div>
  );
}
