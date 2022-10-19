import React, { useCallback, useEffect, useRef } from 'react';
import type { Table } from 'mdast';
import { unified } from 'unified';
import _ from 'lodash';
import remarkHtml from 'remark-html';
import ETable from '@editorjs/table';
import EditorJS from '@editorjs/editorjs';
import { uniqueId } from 'docx';
import { html2md } from '../../utils/md';
import mainService from '../../services/mainService';

const toHtml = unified().use(remarkHtml);

function parseContent(node: Table) {
  const contents = node.children.map((child) => {
    return child.children
      .map((n) => (toHtml.stringify(n) as unknown as string) || '')
      .map((txt) => txt.replaceAll('<div></div>', ''));
  });
  const maxColumns = contents.reduce((len, item) => {
    return item.length > len ? item.length : len;
  }, 0);
  return contents.map((item) => {
    if (item.length < maxColumns) {
      return item.concat(new Array(maxColumns - item.length).fill(''));
    }
    return item;
  });
}

function useReplaceText() {
  const nextRef = useRef<{
    pos: Table['position'];
    md: string;
    uri: string;
  }>();
  const updatingRef = useRef(false);

  const executeNext = useCallback(() => {
    if (updatingRef.current || !nextRef.current) {
      return;
    }
    updatingRef.current = true;
    const { pos, md = '', uri } = nextRef.current || {};
    nextRef.current = undefined;
    pos &&
      mainService.send('previewer.replaceText', {
        uri,
        range: {
          startLineNumber: pos.start.line,
          startColumn: pos.start.column,
          endLineNumber: pos.end.line,
          endColumn: pos.end.column,
        },
        text: md,
      });
    setTimeout(() => {
      updatingRef.current = false;
      executeNext();
    }, 300);
  }, []);
  return useCallback((uri: string, pos: Table['position'], md: string) => {
    nextRef.current = { pos, md, uri };
    executeNext();
  }, []);
}

function Editable({ node, ctx }: { node: Table; ctx: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS>();
  const preContentRef = useRef(parseContent(node));
  const prevHtml = useRef<string>();
  const replaceText = useReplaceText();
  const idRef = useRef(uniqueId());
  const isReadyRef = useRef(false);

  const timeoutRef = useRef(0);
  const updatingRef = useRef(false);

  const nodeRef = useRef(node);

  useEffect(() => {
    const editor = (editorRef.current = new EditorJS({
      holder: ref.current!,
      // autofocus: true,
      tools: {
        table: {
          class: ETable,
          inlineToolbar: true,
        },
      },
      // tunes: ['table'],
      data: {
        time: Date.now(),
        blocks: [
          {
            id: idRef.current,
            type: 'table',
            data: {
              withHeadings: true,
              content: parseContent(node),
            },
          },
        ],
        version: '2.22.1',
      },
      onChange() {
        if (!document.hasFocus() || !ref.current) {
          return;
        }
        const rows = ref.current?.querySelectorAll('.tc-table .tc-row') || [];
        const content = [...rows].map((row) =>
          [...row.children].map((child) => child.innerHTML),
        );
        const [heading = [], ...body] = content;
        let html = '';
        if (heading.length) {
          html = `<table><thead><tr>${heading
            .map((txt: string) => `<td>${txt}</td>`)
            .join('')}</tr></thead><tbody>${(body || [])
            .map(
              (txt: string[]) =>
                `<tr>${txt.map((item) => `<td>${item}</td>`).join('')}</tr>`,
            )
            .join('')}
            </tbody></table>`;
        }
        if (prevHtml.current !== html) {
          prevHtml.current = html;
          clearTimeout(timeoutRef.current);
          updatingRef.current = true;
          timeoutRef.current = window.setTimeout(() => {
            updatingRef.current = false;
          }, 500);
          const position = nodeRef.current?.position;
          const indent = position!.start.column - 1;
          console.log(indent);
          const md = html2md(html)
            .split('\n')
            .map((row) => ''.padStart(indent) + row)
            .join('\n')
            .trim();
          console.log(md);
          replaceText(ctx.fileUri, position!, md);
        }
      },
      onReady() {
        editorRef.current?.blocks?.update(idRef.current, {
          withHeadings: true,
          content: preContentRef.current,
        });
        isReadyRef.current = true;
      },
    }));
    return () => {
      editor.destroy?.();
    };
  }, []);

  useEffect(() => {
    nodeRef.current = node;
    const content = parseContent(node);
    if (!_.isEqual(preContentRef.current, content)) {
      preContentRef.current = content;
      if (!isReadyRef.current) {
        return;
      }
      if (updatingRef.current && document.hasFocus()) {
        return;
      }
      const count = editorRef.current?.blocks.getBlocksCount();
      if (!count) {
        editorRef.current?.render({
          time: Date.now(),
          blocks: [
            {
              id: idRef.current,
              type: 'table',
              data: {
                withHeadings: true,
                content: parseContent(node),
              },
            },
          ],
          version: '2.22.1',
        });
      } else {
        editorRef.current?.blocks?.update(idRef.current, {
          withHeadings: true,
          content: content,
        });
      }
    }
  }, [node]);

  return <div ref={ref}></div>;
}

/**
 * todo: 完善table
 * @param node
 * @param ctx
 */
export default function table(node: Table, ctx: any) {
  return (
    <div
      className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
    >
      <Editable node={node} ctx={ctx} />{' '}
    </div>
  );
  // const { align = [], children } = node;
  // const [head, ...body] = children;
  // let headEle: ReactNode = null;
  // if (head) {
  //   headEle = (
  //     <tr>
  //       {head.children.map((cell, index) => {
  //         return (
  //           <th key={'h' + index} align={align[index] as any}>
  //             {renderChildren(cell, ctx)}
  //           </th>
  //         );
  //       })}
  //     </tr>
  //   );
  // }

  // const bodyEle = body.map((row, index) => {
  //   return (
  //     <tr key={'tr' + index}>
  //       {row.children.map((cell, i) => {
  //         return (
  //           <td key={'d' + index + '-' + i}>{renderChildren(cell, ctx)}</td>
  //         );
  //       })}
  //     </tr>
  //   );
  // });
  // return (
  //   <table
  //     className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
  //   >
  //     <thead>{headEle}</thead>
  //     <tbody>{bodyEle}</tbody>
  //   </table>
  // );
}
