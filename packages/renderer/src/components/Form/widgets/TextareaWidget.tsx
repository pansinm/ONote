import React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { TextareaField } from '@fluentui/react-components/unstable';

const TextareaWidget = (props: WidgetProps) => {
  return <TextareaField {...(props as any)} />;
};

export default TextareaWidget;
