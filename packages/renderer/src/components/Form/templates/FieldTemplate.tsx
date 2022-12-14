import React from 'react';
import type { FieldTemplateProps } from '@rjsf/utils';
import { getTemplate, getUiOptions } from '@rjsf/utils';

const FieldTemplate = (props: FieldTemplateProps) => {
  const {
    id,
    children,
    errors,
    help,
    rawDescription,
    hidden,
    uiSchema,
    registry,
  } = props;
  const uiOptions = getUiOptions(uiSchema);
  const WrapIfAdditionalTemplate = getTemplate<'WrapIfAdditionalTemplate'>(
    'WrapIfAdditionalTemplate',
    registry,
    uiOptions,
  );
  // TODO: do this better by not returning the form-group class from master.
  let { classNames = '' } = props;
  classNames = 'ms-Grid-col ms-sm12 ' + classNames.replace('form-group', '');
  return (
    <WrapIfAdditionalTemplate {...props}>
      <div id={id} className={classNames}>
        {children}
      </div>
    </WrapIfAdditionalTemplate>
  );
};

export default FieldTemplate;
