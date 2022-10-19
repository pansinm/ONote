import React from 'react';
import useZoom from '../hooks/useZoom';
import Previewer from './Previewer';
export default function App() {
  useZoom();
  return (
    <div className="container">
      <Previewer className="previewer" />
    </div>
  );
}
