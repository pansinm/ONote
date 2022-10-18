import React, { useEffect, useState } from 'react';
import 'github-markdown-css/github-markdown-light.css';
import Render from '../markdown/Render';
import useModel from '../hooks/useModel';

export default function Previewer({ className }: { className: string }) {
  const resource = useModel();
  if (!resource.uri) {
    return null;
  }

  return (
    <>
      {/* <button onClick={() => exportDocx()}>导出docx</button> */}
      <div className={className}>
        <Render {...resource}></Render>
      </div>
    </>
  );
}
