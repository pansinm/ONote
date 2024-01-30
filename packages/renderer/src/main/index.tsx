// import { setLocaleData } from 'monaco-editor-nls';
// import zh_CN from 'monaco-editor-nls/locale/zh-hans';
// setLocaleData(zh_CN);
import './monaco';
import React from 'react';
import '../styles/utils.scss';
import './index.scss';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

import { createRoot } from 'react-dom/client';
import App from './App';
import './hotkey';
import './integration';

const root = createRoot(document.getElementById('app') as HTMLDivElement);

root.render(
  <FluentProvider theme={webLightTheme}>
    <App />
  </FluentProvider>,
);
