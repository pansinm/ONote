import './monaco/loadMonaco';
import React from 'react';
import '../styles/utils.scss';
import './index.scss';
import '../rpc/mainServer';

import { render } from 'react-dom';
import App from './App';

render(<App />, document.getElementById('app'));
