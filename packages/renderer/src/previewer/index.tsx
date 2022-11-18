import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/App';
import '/@/common/emoji/emoji.scss';
import './ipc/port';
import './integration';

// 暴露给插件使用
window.React = React;
window.ReactDOM = ReactDOM;

ReactDOM.render(<App />, document.getElementById('app'));

window.addEventListener('message', (e) => console.log(e.data));
