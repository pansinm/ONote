import _ from 'lodash';
import type { Root } from 'mdast';
import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from 'react-use';
import editor from '../ipc/editor';
import mainService from '../services/mainService';

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

function findAst(root: Root, asts: Root[], lineNumber: number): Root[] {
  if (lineNumber > (root.position?.end.line as number)) {
    return [];
  }
  const paths: Root[] = [];
  const matched = asts.find((ast) => {
    return (
      (ast.position?.start.line as number) <= lineNumber &&
      (ast.position?.end.line as number) >= lineNumber
    );
  });
  if (!matched) {
    return findAst(root, asts, lineNumber + 1);
  }

  if (matched) {
    paths.push(matched);
  }
  if (matched?.children?.length) {
    paths.push(...findAst(root, matched.children as any[], lineNumber));
  }
  return paths;
}

const scrollToLine = (ast: Root, lineNumber: number) => {
  if (lineNumber <= 1) {
    window.scrollTo(window.scrollX, 0);
    return;
  }
  const paths = findAst(ast, ast.children as any[], lineNumber).reverse();
  console.log('lineNumber', ast, paths, lineNumber);
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

// scrollTop对应的lineNumber
function getTopLineNumber() {
  const list = document.querySelectorAll('.markdown-body > *');
  const listArr: HTMLElement[] = [].slice.apply(list);
  for (const item of listArr) {
    const rect = item.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom >= 0) {
      const itemPosition = getLineNum(item);
      if (itemPosition) {
        const pos = -rect.top / rect.height;
        const lineNumber =
          itemPosition.startLine +
          (itemPosition.endLine - itemPosition.startLine) * pos;
        return +lineNumber.toFixed(0);
      }
    }
  }
  return false;
}

export default function usePreviewerScrollSync(
  uri: string,
  ast: Root,
  lineNumber: number | undefined,
) {
  const params = useLatest({ uri, ast, lineNumber });

  const scrollTo = useCallback((lineNumber: number) => {
    if (params.current.ast) {
      scrollToLine(params.current.ast, lineNumber);
    }
  }, []);

  useEffect(() => {
    const currentUri = uri;
    if (lineNumber) {
      scrollTo(lineNumber);
    } else {
      editor
        .getScrollPosition(currentUri)
        .then(({ lineNumber }) => {
          currentUri === params.current.uri && scrollTo(lineNumber || 0);
        })
        .catch((err) => {
          // ignore
        });
    }
  }, [uri]);

  const latestUri = useLatest(uri);

  useEffect(() => {
    let timeout: any;

    const handleScroll = (e: Event) => {
      if (editorScrolling) {
        return;
      }
      const line = getTopLineNumber();
      if (line !== false) {
        mainService.send('previewer.scroll.changed', {
          uri: latestUri.current,
          lineNumber: line,
        });
      }
    };

    const handleEditorScroll = ({
      uri,
      lineNumber,
    }: {
      uri: string;
      lineNumber: number;
    }) => {
      scrollTo(lineNumber);
      clearTimeout(timeout);
      editorScrolling = true;
      timeout = setTimeout(() => {
        editorScrolling = false;
      }, 500);
    };
    mainService.on('main.scroll.changed', handleEditorScroll);

    window.addEventListener('scroll', handleScroll);
    return () => {
      mainService.off('main.scroll.changed', handleEditorScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}
