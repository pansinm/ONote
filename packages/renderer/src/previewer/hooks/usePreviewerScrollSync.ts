import type { Root } from 'mdast';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const handleScroll = (e: Event) => {
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

function findAst(asts: Root[], lineNumber: number) {
  const matched = asts.find((ast) => {
    return (
      (ast.position?.start.line as number) <= lineNumber &&
      (ast.position?.end.line as number) >= lineNumber
    );
  });

  const next = asts.find((ast, index) => {
    const prev = asts[index - 1];
    if ((ast.position?.start.line as number) >= lineNumber) {
      return !prev || (prev.position?.end.line as number) <= lineNumber;
    }
    return false;
  });

  return [matched, next];
}

export default function usePreviewerScrollSync(uri: string, ast: Root) {
  const astRef = useRef(ast);
  useEffect(() => {
    astRef.current = ast;
  }, [ast]);

  const scrollTo = useCallback((lineNumber: number) => {
    if (astRef.current) {
      const [found, next] = findAst(
        astRef.current.children as any[],
        lineNumber,
      );
      if (found) {
        const startLine = found.position?.start.line as number;
        const endLine = found.position?.end.line as number;
        const dom = document.querySelector(
          `.markdown-body > .line-start-${startLine}`,
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
      } else if (next) {
        const startLine = next.position?.start.line as number;
        // const endLine = next.position?.end.line as number;
        const dom = document.querySelector(
          `.markdown-body > .line-start-${startLine}`,
        );
        if (dom) {
          const rect = dom.getBoundingClientRect();
          const scrollTop = window.scrollY + rect.y;
          window.scrollTo(window.scrollX, scrollTop);
        }
      }
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
        window.removeEventListener('scroll', handleScroll);
        scrollTo(lineNumber);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          window.removeEventListener('scroll', handleScroll);
          window.addEventListener('scroll', handleScroll);
        }, 200);
      },
    );
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}
