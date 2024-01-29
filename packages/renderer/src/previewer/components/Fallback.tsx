import React from 'react';

export default function Fallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div>
      <h1>渲染出错了...</h1>
      <h3>{error.name}</h3>
      <p>{error.message}</p>
      <p>{error.stack}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}
