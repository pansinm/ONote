import React, { useRef } from 'react';
import { Field, Input } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation('common');
  const formRef = useRef<HTMLFormElement>(null);
  const handleChange: React.ChangeEventHandler = (e) => {
    const formData = new FormData(formRef.current!);
    const url = new URL(location.href);
    formData.append('toFile', url.searchParams.get('file')!);
    fetch('/upload', { body: formData, method: 'POST' });
  };
  return (
    <div>
      <form ref={formRef} action="/upload">
        <Field label={t('insertFile')}>
          <Input onChange={handleChange} name="file" type={'file' as any} />
        </Field>
      </form>
    </div>
  );
}

export default App;
