import React from 'react';
import type { TitleFieldProps } from '@rjsf/utils';
import { Subtitle1 } from '@fluentui/react-components';

function TitleFieldTemplate({ id, title, uiSchema }: TitleFieldProps) {
  if (!title) {
    return null;
  }
  return (
    <Subtitle1
      id={id}
      as="h6"
      style={{
        color: 'var(--text-heading)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {title}
    </Subtitle1>
  );
}

export default TitleFieldTemplate;
