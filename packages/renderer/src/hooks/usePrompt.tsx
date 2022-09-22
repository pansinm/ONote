import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useState } from 'react';
import Flex from '../components/Flex';
import Input from '../components/Input';
import useConfirm from './useConfirm';

type ShowPrompt = {
  title?: string;
  description?: string;
  defaultValue?: string;
};

const PromptContent: FC<{
  description?: string;
  defaultValue: string;
  onChange(text: string): void;
}> = ({ description, defaultValue, onChange }) => {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    setValue(value);
  }, [defaultValue]);
  return (
    <Flex
      justifyContent={'space-between'}
      flexDirection="column"
      paddingTop={10}
    >
      {description ? <p>{description}</p> : null}
      <Input
        autoFocus
        value={value}
        onChange={(str) => {
          setValue(str);
          onChange(str);
        }}
      ></Input>
    </Flex>
  );
};

function usePrompt() {
  const { Confirm, open } = useConfirm();

  const openPrompt = useCallback(
    async ({ title, defaultValue, description }: ShowPrompt) => {
      let value = defaultValue || '';
      const isConfirm = await open({
        title: title,
        shouldCloseOnEsc: true,
        content: (
          <PromptContent
            defaultValue={value}
            description={description}
            onChange={(text) => {
              value = text;
            }}
          />
        ),
      });
      if (isConfirm) {
        return value;
      }
      return null;
    },
    [open],
  );
  return useMemo(
    () => ({
      open: openPrompt,
      Prompt: Confirm,
    }),
    [openPrompt, Confirm],
  );
}

export default usePrompt;
