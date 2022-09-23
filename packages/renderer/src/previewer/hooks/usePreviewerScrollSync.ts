import _ from 'lodash';
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

function findAst(asts: Root[], lineNumber: number): Root | undefined {
  const matched = asts.find((ast) => {
    return (
      (ast.position?.start.line as number) <= lineNumber &&
      (ast.position?.end.line as number) >= lineNumber
    );
  });
  if (matched?.children) {
    return findAst(matched.children as any[], lineNumber) || matched;
  }
  return matched;
}

const scrollToLine = (ast: Root, lineNumber: number) => {
  let found;
  let line = lineNumber;
  while (!found && line <= (ast.position?.end.line || lineNumber)) {
    found = findAst(ast.children as any[], line);
    line++;
  }
  if (found) {
    const startLine = found.position?.start.line as number;
    const endLine = found.position?.end.line as number;
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
      console.log(lineNumber);
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
