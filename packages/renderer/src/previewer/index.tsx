import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import { install } from './extensions/diagram';
import engine from './diagram/engine';
import './rpc/previewerServer';

install();

// 暴露给插件使用
window.React = React;
window.ReactDOM = ReactDOM;

(window as any).DiagramEngine = engine;

ReactDOM.render(<App />, document.getElementById('app'));
