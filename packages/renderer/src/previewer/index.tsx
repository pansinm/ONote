import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './components/App';
import '/@/common/emoji/emoji.scss';
import './integration';
import { getLogger } from 'shared/logger';

const logger = getLogger('Previewer');

// 暴露给插件使用
window.React = React;

const root = createRoot(document.getElementById('app') as HTMLDivElement);
root.render(<App />);

window.addEventListener('message', (e) => logger.debug('Window message', e.data));
