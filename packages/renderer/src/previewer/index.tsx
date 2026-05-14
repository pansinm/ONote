import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import '/@/common/emoji/emoji.scss';
import './integration';
import { getLogger } from '/@/shared/logger';
import './index.scss';

const logger = getLogger('Previewer');

// 暴露给插件使用
window.React = React;

const root = createRoot(document.getElementById('app') as HTMLDivElement);
root.render(<App />);

// ── 接收主窗口主题同步 ──
window.addEventListener('message', (e) => {
  if (e.data?.type === 'theme-change') {
    document.documentElement.setAttribute('data-theme', e.data.theme);
    logger.debug('Theme synced', e.data.theme);
  }
});

// 请求初始主题
window.addEventListener('load', () => {
  window.parent.postMessage({ type: 'theme-request' }, '*');
});
