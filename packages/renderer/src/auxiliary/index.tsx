import React from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('app') as HTMLDivElement);

root.render(
  <FluentProvider theme={webLightTheme}>
    <App></App>
  </FluentProvider>,
);
