import React from 'react';
import type { Root } from 'remark-gfm';

export default React.createContext({
  uri: '',
  root: {} as Root,
});
