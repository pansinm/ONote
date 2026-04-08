import { Tooltip } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _QRCode from 'react-qr-code';
import stores from '/@/main/stores';
import { observer } from 'mobx-react-lite';
import Icon from '/@/components/Icon';

function QRCodeContent() {
  const { t } = useTranslation('common');
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
      <p>{t('insertFileFromPhone')}</p>
      {url ? <_QRCode style={{ width: '100%' }} value={url} /> : <p>...</p>}
      <p>{url}</p>
    </div>
  );
}

const ObserverQRCode = observer(QRCodeContent);

function QRCode() {
  const { t } = useTranslation('common');
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
        <Icon title={t('insertFile')} type="qr-code" size={18} />
      </span>
    </Tooltip>
  );
}

export default QRCode;
