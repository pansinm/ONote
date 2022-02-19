import mermaid from 'mermaid';
import Flowchart from 'flowchart.js';
import mainClient from '../rpc/mainRpcClient';
import _ from 'lodash';
// import _ from 'lodash';

// 使用graphviz的webassembly版本渲染，用node环境执行
// https://www.npmjs.com/package/@hpcc-js/wasm
// const { graphviz } = remote.require('@hpcc-js/wasm');
// import { geturl } from 'plantuml-api';

// const WebFont = window.require('webfontloader');
// const Snap = window.require('snapsvg-cjs');

// const __static =
//   process.env.NODE_ENV === 'development'
//     ? process.cwd() + '/static'
//     : process.resourcesPath + '/app.asar/static';

// /**
//  * js-sequence-diagram依赖，需要注入到全局变量中
//  */
// (global as any).WebFont = WebFont;
// (global as any).Snap = Snap;
// (global as any)._ = _;

// /**
//  * 在运行时加载sequence-diagram，
//  * 因为js-sequence-diagrams没有npm包
//  */
// const Diagram = window.require(
//   __static + '/js-sequence-diagrams/sequence-diagram'
// );

// const link = document.createElement('link');
// link.rel = 'stylesheet';
// link.type = 'text/css';
// link.href = __static + '/js-sequence-diagrams/sequence-diagram.css';
// document.head.appendChild(link);

export type SupportType =
  | 'graphviz'
  | 'mermaid'
  | 'plantuml'
  | 'sequence'
  | 'flow';

export type RenderResult = {
  type: 'svg' | 'url';
  content: string;
};

/**
 * 优化plantuml样式
 * https://github.com/xuanye/plantuml-style-c4
 */
// function styleUML(plantumlCode: string) {
//   const existsStartUML = plantumlCode.includes('@startuml');
//   const styleStatements =
//     '!includeurl https://raw.githubusercontent.com/xuanye/plantuml-style-c4/master/core.puml';
//   if (existsStartUML)
//     return plantumlCode.replace(
//       /(@startuml.*?)\n/g,
//       `$1\n${styleStatements}\n`
//     );
//   return styleStatements + '\n' + plantumlCode;
// }

class DiagramEngine {
  constructor() {
    // 初始化主题，否则第一次渲染是异步的
    this.renderSequence('', 'hand');
    this.renderSequence('', 'simple');
  }

  isDiagram(type: string) {
    return ['graphviz', 'mermaid', 'plantuml', 'sequence', 'flow'].includes(
      type,
    );
  }

  async renderGraphviz(code: string, engine: string): Promise<RenderResult> {
    const graph = await mainClient.renderGraphviz(code, engine as any);
    return {
      type: 'svg',
      content: graph,
    };
  }

  async renderMermaid(code: string): Promise<RenderResult> {
    const container = document.createElement('div');
    const root = document.querySelector('.markdown-body') as HTMLDivElement;
    root.appendChild(container);
    try {
      const graph = mermaid.render(
        _.uniqueId('mermaid-'),
        code,
        undefined as any,
        container as any,
      );
      return {
        type: 'svg',
        content: graph,
      };
    } finally {
      container.remove();
    }
  }

  async renderFlow(code: string): Promise<RenderResult> {
    const container = document.createElement('div');
    const root = document.querySelector('.markdown-body') as HTMLDivElement;
    root.appendChild(container);
    try {
      const Diagram = Flowchart.parse(code);
      Diagram.drawSVG(container);
      return {
        type: 'svg',
        content: container.innerHTML,
      };
    } finally {
      container.remove();
    }
  }

  async renderPlantuml(code: string): Promise<RenderResult> {
    const graph = await mainClient.renderPlantUML(code);
    return {
      type: 'svg',
      content: graph,
    };
  }

  async renderSequence(
    code: string,
    theme: 'hand' | 'simple' = 'simple',
  ): Promise<RenderResult> {
    const container = document.createElement('div');
    const root = document.querySelector('.container') as HTMLDivElement;
    root && root.appendChild(container);
    // const d = Diagram.parse(code);
    // d.drawSVG(container, { theme });
    // const graph = container.innerHTML;
    // container.remove();
    return {
      type: 'svg',
      content: '', // graph,
    };
  }

  render(
    type: 'graphviz',
    code: string,
    options: { engine: string },
  ): Promise<RenderResult>;
  render(
    type: 'sequence',
    code: string,
    options: { theme: 'hand' | 'simple' },
  ): Promise<RenderResult>;
  render(
    type: SupportType,
    code: string,
    options: any = {},
  ): Promise<RenderResult> {
    switch (type) {
      case 'graphviz':
        return this.renderGraphviz(code, options.engine);
      case 'mermaid':
        return this.renderMermaid(code);
      case 'plantuml':
        return this.renderPlantuml(code);
      case 'sequence':
        return this.renderSequence(code, options.theme);
      case 'flow':
        return this.renderFlow(code);
      default:
        throw new Error('不支持的图表类型');
    }
  }
}

export default new DiagramEngine();
