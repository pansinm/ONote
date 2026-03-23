import * as monaco from 'monaco-editor';
import i18next from '../../i18n';
import fileService from '/@/main/services/fileService';
import type { TreeNode } from '@sinm/react-file-tree';

interface FileNode extends TreeNode {
  name: string;
}

function joinPath(...paths: string[]): string {
  const result = paths
    .join('/')
    .split('/')
    .filter((part) => part !== '' && part !== '.')
    .reduce((acc, part) => {
      if (part === '..') {
        acc.pop();
      } else {
        acc.push(part);
      }
      return acc;
    }, [] as string[])
    .join('/');
  return result || '.';
}

interface LinkContext {
  isInBrackets: boolean;
  isLinkOrImage: boolean;
  pathStart: number;
  basePath: string;
}

function parseLinkContext(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
): LinkContext | null {
  const beforePosition = new monaco.Range(
    1,
    1,
    position.lineNumber,
    position.column,
  );
  const fullTextBefore = model.getValueInRange(beforePosition);

  let openParenIndex = -1;
  let parenCount = 0;

  for (let i = fullTextBefore.length - 1; i >= 0; i--) {
    const char = fullTextBefore[i];
    if (char === ')') {
      parenCount++;
    } else if (char === '(' && parenCount === 0) {
      openParenIndex = i;
      break;
    } else if (char === '(') {
      parenCount--;
    }
  }

  if (openParenIndex === -1) {
    return null;
  }

  const textBetweenParen = fullTextBefore.substring(openParenIndex + 1);
  if (textBetweenParen.includes('\n')) {
    return null;
  }

  let closeBracketIndex = -1;
  for (let i = openParenIndex - 1; i >= 0; i--) {
    if (fullTextBefore[i] === ']') {
      closeBracketIndex = i;
      break;
    }
  }

  if (closeBracketIndex === -1) {
    return null;
  }

  let openBracketIndex = -1;
  for (let i = closeBracketIndex - 1; i >= 0; i--) {
    if (fullTextBefore[i] === '[') {
      openBracketIndex = i;
      break;
    }
  }

  if (openBracketIndex === -1) {
    return null;
  }

  return {
    isInBrackets: true,
    isLinkOrImage: true,
    pathStart: openParenIndex + 1,
    basePath: textBetweenParen,
  };
}

function resolvePath(baseFileUri: string, inputPath: string): string | null {
  try {
    const url = new URL(baseFileUri);

    if (inputPath.startsWith('/')) {
      return inputPath;
    }

    const dirPath = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    const resolved = joinPath(dirPath, inputPath);

    if (resolved === '.' || resolved === '..' || resolved.includes('/../')) {
      return null;
    }

    return resolved.startsWith('/') ? resolved : '/' + resolved;
  } catch {
    return null;
  }
}

async function getCompletionFiles(
  baseFileUri: string,
  inputPath: string,
): Promise<
  Array<{ name: string; uri: string; type: 'file' | 'directory' }>
> {
  try {
    const resolvedPath = resolvePath(baseFileUri, inputPath);
    if (!resolvedPath) {
      return [];
    }

    const url = new URL(baseFileUri);
    const origin = url.origin;

    let targetUri: string;
    let filter = '';

    if (inputPath.endsWith('/') || inputPath === '') {
      targetUri = origin + resolvedPath;
      filter = '';
    } else {
      const lastSlashIndex = resolvedPath.lastIndexOf('/');
      if (lastSlashIndex === -1) {
        targetUri = origin + '/';
        filter = inputPath;
      } else {
        targetUri = origin + resolvedPath.substring(0, lastSlashIndex + 1);
        filter = resolvedPath.substring(lastSlashIndex + 1);
      }
    }

    const nodes = await fileService.listDir(targetUri);

    return nodes
      .filter(
        (node) =>
          !(node as FileNode).name?.startsWith('.') &&
          (filter === '' ||
            (node as FileNode).name?.toLowerCase()?.startsWith(filter.toLowerCase())),
      )
      .map((node) => ({
        name: (node as FileNode).name,
        uri: node.uri,
        type: node.type,
      }));
  } catch {
    return [];
  }
}

class PathCompletionProvider implements monaco.languages.CompletionItemProvider {
  triggerCharacters = ['/'];

  async provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.CompletionContext,
    _token: monaco.CancellationToken,
  ) {
    const linkContext = parseLinkContext(model, position);
    if (!linkContext || !linkContext.isLinkOrImage) {
      return { suggestions: [] };
    }

    const currentFileUri = model.uri.toString();
    const files = await getCompletionFiles(currentFileUri, linkContext.basePath);

    if (files.length === 0) {
      return { suggestions: [] };
    }

    const line = model.getLineContent(position.lineNumber);
    const beforeLineText = line.substring(0, position.column - 1);

    let replaceStartIndex = -1;
    for (let i = beforeLineText.length - 1; i >= 0; i--) {
      if (beforeLineText[i] === '/' || beforeLineText[i] === '(') {
        replaceStartIndex = i;
        break;
      }
    }

    const replaceStartColumn =
      replaceStartIndex >= 0 ? replaceStartIndex + 2 : position.column;
    const range = new monaco.Range(
      position.lineNumber,
      replaceStartColumn,
      position.lineNumber,
      position.column,
    );

    const sortedFiles = [...files].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

    const suggestions: monaco.languages.CompletionItem[] = sortedFiles.map(
      (file) => {
        const insertText =
          file.type === 'directory' ? `${file.name}/` : file.name;
        const sortText =
          file.type === 'directory'
            ? `0${file.name.toLowerCase()}`
            : `1${file.name.toLowerCase()}`;

        return {
          label: file.name,
          kind:
            file.type === 'directory'
              ? monaco.languages.CompletionItemKind.Folder
              : monaco.languages.CompletionItemKind.File,
          insertText,
          range,
          sortText,
          detail: file.type === 'directory' ? i18next.t('common:folder') : i18next.t('common:file'),
          command: file.type === 'directory'
            ? {
                id: 'editor.action.triggerSuggest',
                title: i18next.t('common:triggerCompletion'),
              }
            : undefined,
        };
      },
    );

    return { suggestions };
  }
}

export default PathCompletionProvider;
