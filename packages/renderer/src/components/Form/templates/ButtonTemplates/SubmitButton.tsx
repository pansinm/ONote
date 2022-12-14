import React from 'react';
import type { SubmitButtonProps } from '@rjsf/utils';
import { getSubmitButtonOptions } from '@rjsf/utils';
import { Button } from '@fluentui/react-components';

export default function SubmitButton({ uiSchema }: SubmitButtonProps) {
  const {
    submitText,
    norender,
    props: submitButtonProps,
  } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return (
    <div>
      <br />
      <div className="ms-Grid-col ms-sm12">
        <Button appearance="primary" type="submit" {...submitButtonProps}>
          {submitText}
        </Button>
      </div>
    </div>
  );
}
