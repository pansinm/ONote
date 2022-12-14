import React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { InputField } from '@fluentui/react-components/unstable';

const FileWidget = (props: WidgetProps) => {
  const { options, registry, ...rest } = props;
  return <InputField {...(rest as any)} type={'file' as any} />;
};

export default FileWidget;
