import React, { useRef } from 'react';
import { InputField } from '@fluentui/react-components/unstable';

function App() {
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
        <InputField
          onChange={handleChange}
          name="file"
          label="插入文件"
          type={'file' as any}
        />
      </form>
    </div>
  );
}

export default App;
