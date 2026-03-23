import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Fallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  const { t } = useTranslation('common');
  return (
    <div>
      <h1>{t('renderError')}</h1>
      <h3>{error.name}</h3>
      <p>{error.message}</p>
      <p>{error.stack}</p>
      <button onClick={resetErrorBoundary}>{t('retry')}</button>
    </div>
  );
}
