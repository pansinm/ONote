import _ from 'lodash';
import type { Root } from 'mdast';
import { useCallback, useEffect, useRef } from 'react';
import editorClient from '../rpc/editorClient';
import previewerServer from '../rpc/previewerServer';
import PreviewerRPC from '/@/rpc/PreviewerRPC';

function getLineNum(dom: HTMLElement) {
  const className = dom.className;
  const start = /line-start-(\d+)/.exec(className);
  const end = /line-end-(\d+)/.exec(className);
  if (start && end) {
    return {
      startLine: parseInt(start[1], 10),
      endLine: parseInt(end[1], 10),
    };
  }
  return null;
}

let editorScrolling = false;
const handleScroll = (e: Event) => {
  if (editorScrolling) {
    return;
  }
  const list = document.querySelectorAll('.markdown-body > *');
  const listArr: HTMLElement[] = [].slice.apply(list);
  listArr.some((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom >= 0) {
      const lines = getLineNum(item);
      if (lines) {
        const pos = -rect.top / rect.height;
        const line = lines.startLine + (lines.endLine - lines.startLine) * pos;
        editorClient.scrollToLine(line);
      }
      return true;
    }
    return false;
  });
};

function findAst(asts: Root[], lineNumber: number): Root[] {
  const paths: Root[] = [];
  const matched = asts.find((ast) => {
    return (
      (ast.position?.start.line as number) <= lineNumber &&
      (ast.position?.end.line as number) >= lineNumber
    );
  });
  if (matched) {
    paths.push(matched);
  }
  if (matched?.children) {
    paths.push(...findAst(matched.children as any[], lineNumber));
  }
  return paths;
}

const scrollToLine = (ast: Root, lineNumber: number) => {
  const paths = findAst(ast.children as any[], lineNumber).reverse();
  for (const node of paths) {
    const startLine = node.position?.start.line as number;
    const endLine = node.position?.end.line as number;
    const dom = document.querySelector(
      `.line-start-${startLine}.line-end-${endLine}`,
    );
    if (dom) {
      const rect = dom.getBoundingClientRect();
      let rate = 0;
      if (endLine > startLine) {
        rate = (lineNumber - startLine) / (endLine - startLine);
      }
      const scrollTop = window.scrollY + rect.y + rect.height * rate;
      window.scrollTo(window.scrollX, scrollTop);
      return;
    }
  }
};

export default function usePreviewerScrollSync(uri: string, ast: Root) {
  const astRef = useRef(ast);
  useEffect(() => {
    astRef.current = ast;
  }, [ast]);

  const scrollTo = useCallback((lineNumber: number) => {
    if (astRef.current) {
      scrollToLine(astRef.current, lineNumber);
    }
  }, []);

  useEffect(() => {
    editorClient.getScrollLine(uri).then((number) => {
      scrollTo(number || 0);
    });
  }, [uri]);

  useEffect(() => {
    let timeout: any;
    previewerServer.handle(
      PreviewerRPC.ScrollToLine,
      async (uri: string, lineNumber: number) => {
        scrollTo(lineNumber);
        clearTimeout(timeout);
        editorScrolling = true;
        timeout = setTimeout(() => {
          editorScrolling = false;
        }, 500);
      },
    );
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}
