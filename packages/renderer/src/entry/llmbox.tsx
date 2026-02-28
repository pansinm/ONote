import React, { useEffect, useMemo, useRef } from 'react';
import { createChannel } from 'bidc';
import { createRoot } from 'react-dom/client';
import '../styles/index.scss';
import('github-markdown-css/github-markdown.css');
import LLMBox from '../llmbox/components/LLMBox';
import { LLMBOX_CHANNEL_ID as LLMBOX_CHANNEL_ID } from '../llmbox/ipc/constants';

/**
 * LLMBoxApp组件 - 主应用组件，使用observer进行响应式包装
 * 该组件负责处理消息通信、管理代理状态和渲染UI界面
 */
const LLMBoxApp = () => {
  const channel = useMemo(() => {
    return createChannel(LLMBOX_CHANNEL_ID);
  }, []);
  return <LLMBox channel={channel} />;
};

const root = createRoot(document.getElementById('app') as HTMLDivElement);

window.addEventListener('onote:ready', () => {
  root.render(<LLMBoxApp />);
});
