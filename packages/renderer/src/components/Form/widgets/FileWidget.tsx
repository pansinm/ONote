import React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { Field } from '@fluentui/react-components';

const FileWidget = (props: WidgetProps) => {
  const { options, registry, ...rest } = props;
  return <Field {...(rest as any)} type={'file' as any} />;
};

export default FileWidget;
