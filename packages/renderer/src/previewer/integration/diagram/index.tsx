import React from 'react';
import { createLineClass } from '../../markdown/handlers/util/position';
import frame from '../../frame';
import diagramEngine from './engine';
import { Diagram } from './diagram';

export function parseMeta(meta = '') {
  return meta
    .split(',')
    .map((item) => item.split('='))
    .reduce((options, [key, val]) => {
      if (!key) return options;
      return { ...options, [key]: val };
    }, {});
}

frame.registerMarkdownRenderer({
  code: (node, ctx) => {
    if (node.lang && diagramEngine.isDiagram(node.lang)) {
      return (
        <Diagram
          lang={node.lang}
          className={createLineClass(node.position)}
          meta={parseMeta(node.meta || '')}
          value={node.value}
        />
      );
    }
    return ctx.continue();
  },
});
