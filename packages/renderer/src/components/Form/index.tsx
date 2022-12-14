import type { ComponentType } from 'react';
import type { FormProps } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import widgets from './widgets';
import templates from './templates';

const Form: ComponentType<FormProps> = withTheme({ widgets, templates });

export default Form;
