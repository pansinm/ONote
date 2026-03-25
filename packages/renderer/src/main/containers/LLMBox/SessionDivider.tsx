import React, { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SessionDivider.module.scss';

const SessionDivider: FC = () => {
  const { t } = useTranslation('llmbox');
  return (
    <div className={styles.sessionDivider}>
      <span className={styles.label}>{t('newConversation')}</span>
    </div>
  );
};

export default SessionDivider;
