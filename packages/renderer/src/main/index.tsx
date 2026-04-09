// import { setLocaleData } from 'monaco-editor-nls';
// import zh_CN from 'monaco-editor-nls/locale/zh-hans';
// setLocaleData(zh_CN);
import './monaco';
import React from 'react';
import '../styles/utils.scss';
import '../styles/index.scss';
import '../styles/agent-diff.scss';
import { FluentProvider } from '@fluentui/react-components';
import { warmLightTheme } from './theme/warmLightTheme';

import { createRoot } from 'react-dom/client';
import { initI18n } from './i18n';
import App from './App';
import './integration';
import { registerHotkeys } from './hotkey';

initI18n().then(() => {
  registerHotkeys();
  const root = createRoot(document.getElementById('app') as HTMLDivElement);

  root.render(
    <FluentProvider theme={warmLightTheme}>
      <App />
    </FluentProvider>,
  );
});
