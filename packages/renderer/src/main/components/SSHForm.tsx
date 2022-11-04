import _ from 'lodash';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import React from 'react';
import Input from '../../components/Input';
import styles from './SSHForm.module.scss';
import { Button } from '@fluentui/react-components';

interface SSHFormData {
  host: string;
  port: string;
  username: string;
  password: string;
}
export interface SSHFormProps {
  onSubmit(formData: SSHFormData): Promise<void>;
}

const SSHForm: FC<SSHFormProps> = (props) => {
  const [disabled, setDisabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = async () => {
    const form = new FormData(formRef.current as HTMLFormElement);
    try {
      setDisabled(true);
      const data = {
        port: '22',
        ..._.fromPairs([...form.entries()]),
      } as any;
      await props.onSubmit(data);
      localStorage.setItem('ssh_form', JSON.stringify(data));
    } finally {
      setDisabled(false);
    }
  };
  useEffect(() => {
    const prevForm = localStorage.getItem('ssh_form') || '';
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
    <form ref={formRef} className={styles.SSHForm}>
      <Input disabled={disabled} name="host" placeholder="Host" />
      <Input disabled={disabled} name="port" placeholder="Port" />
      <Input disabled={disabled} name="username" placeholder="Username" />
      <Input
        disabled={disabled}
        name="password"
        placeholder="Password"
        type={'password'}
      />
      <Button
        appearance="primary"
        disabled={disabled}
        style={{ float: 'right', height: 30 }}
        onClick={handleSubmit}
      >
        {disabled ? '连接中' : '连接'}
      </Button>
    </form>
  );
};

export default SSHForm;
