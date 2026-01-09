import React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { Textarea } from '@fluentui/react-components';

const TextareaWidget = (props: WidgetProps) => {
  return <Textarea {...(props as any)} />;
};

export default TextareaWidget;
