import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/index.scss';
import('github-markdown-css/github-markdown.css');
import LLMBox from '../llmbox/components/LLMBox';

/**
 * LLMBoxApp组件 - 主应用组件，使用observer进行响应式包装
 * 该组件负责处理消息通信、管理代理状态和渲染UI界面
 */
const LLMBoxApp = () => {
  return <LLMBox />;
};

const root = createRoot(document.getElementById('app') as HTMLDivElement);

window.addEventListener('onote:ready', () => {
  root.render(<LLMBoxApp />);
});
