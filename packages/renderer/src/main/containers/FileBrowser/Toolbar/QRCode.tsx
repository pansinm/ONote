import { Tooltip } from '@fluentui/react-components';
import { QrCode20Regular } from '@fluentui/react-icons';
import React, { useEffect, useState } from 'react';
import _QRCode from 'react-qr-code';
import stores from '/@/main/stores';
import { observer } from 'mobx-react-lite';

function QRCodeContent() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    window.simmer.localIpV4().then((ip: string) => {
      setUrl(
        `http://${ip}:${stores.settingStore.settings['server.port']}/mobile?file=${stores.activationStore.activeFileUri}`,
      );
    });
  }, [stores.activationStore.activeFileUri]);

  return (
    <div>
      <p>从手机插入文件</p>
      {url ? <_QRCode style={{ width: '100%' }} value={url} /> : <p>...</p>}
      <p>{url}</p>
    </div>
  );
}

const ObserverQRCode = observer(QRCodeContent);

function QRCode() {
  const [visible, setVisible] = useState(false);
  return (
    <Tooltip
      withArrow
      onVisibleChange={(e, data) => setVisible(data.visible)}
      positioning={'below-start'}
      content={visible ? <ObserverQRCode /> : ''}
      relationship={'description'}
    >
      <span>
        <QrCode20Regular title="insert" />
      </span>
    </Tooltip>
  );
}

export default QRCode;
