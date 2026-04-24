import type { FC } from 'react';
import { useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FileIcon from '/@/components/FileIcon';
import { basename } from '../../../../common/utils/uri';
import styles from './index.module.scss';

interface UnSupportProps {
  uri: string;
}

const UnSupport: FC<UnSupportProps> = (props) => {
  const { t } = useTranslation('common');
  const [opening, setOpening] = useState(false);
  const handleClick = async () => {
    try {
      setOpening(true);
      await window.simmer.openExternal(props.uri);
    } finally {
      setOpening(false);
    }
  };
  return (
    <div className={styles.root}>
      <FileIcon size={40} uri={props.uri} className={styles.icon} />
      <p className={styles.fileName}>{basename(props.uri)}</p>
      <p className={styles.hint}>{t('unsupportedFileFormat')}</p>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={opening}
        onClick={handleClick}
      >
        {t('openWithSystemApp')}
      </button>
    </div>
  );
};

export default UnSupport;
