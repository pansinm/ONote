import _ from 'lodash';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import React from 'react';
import Input from '/@/components/Input';
import { Button } from '@fluentui/react-components';

interface GiteeFormData {
  access_token: string;
}
export interface GiteeFormProps {
  onSubmit(formData: GiteeFormData): Promise<void>;
}

const GiteeForm: FC<GiteeFormProps> = (props) => {
  const [disabled, setDisabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = async () => {
    const form = new FormData(formRef.current as HTMLFormElement);
    try {
      setDisabled(true);
      const data = {
        ..._.fromPairs([...form.entries()]),
      } as any;
      await props.onSubmit(data);
      localStorage.setItem('gitee_form', JSON.stringify(data));
    } finally {
      setDisabled(false);
    }
  };
  useEffect(() => {
    const prevForm = localStorage.getItem('gitee_form') || '';
    try {
      const data = JSON.parse(prevForm);
      Object.keys(data).forEach((key) => {
        const input = formRef.current?.[key] as unknown as HTMLInputElement;
        if (input) {
          input.value = data[key];
        }
      });
    } catch (err) {
      // ignore
    }
  }, []);
  return (
    <form ref={formRef}>
      <Input
        type="password"
        disabled={disabled}
        name="access_token"
        placeholder="access_token"
      />
      <Button
        appearance="primary"
        disabled={disabled}
        style={{ float: 'right', height: 30, marginTop: 10 }}
        onClick={handleSubmit}
      >
        {disabled ? '连接中' : '连接'}
      </Button>
    </form>
  );
};

export default GiteeForm;
