import React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { onoteLightTheme } from '../main/theme/onoteLightTheme';

import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('app') as HTMLDivElement);

root.render(
  <FluentProvider theme={onoteLightTheme}>
    <App></App>
  </FluentProvider>,
);
