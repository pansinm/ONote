// import { setLocaleData } from 'monaco-editor-nls';
// import zh_CN from 'monaco-editor-nls/locale/zh-hans';

// setLocaleData(zh_CN);
import './monaco';
import React from 'react';
import '../styles/utils.scss';
import './index.scss';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

import { render } from 'react-dom';
import App from './App';

render(
  <FluentProvider theme={webLightTheme}>
    <App />
  </FluentProvider>,
  document.getElementById('app'),
);
