import React from 'react';
import type { IconButtonProps } from '@rjsf/utils';
import { Button } from '@fluentui/react-components';
import { Add28Regular } from '@fluentui/react-icons';

const AddButton = (props: IconButtonProps) => (
  <Button
    icon={<Add28Regular />}
    className={props.className}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    Add Item
  </Button>
);

export default AddButton;
