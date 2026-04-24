import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import type { FC, ReactNode } from 'react';
import React from 'react';
import { DocumentRegular } from '@fluentui/react-icons';
import { basename, isEquals, relative } from '/@/common/utils/uri';
import styles from './SearchList.module.scss';

interface SearchListProps {
  files: TreeNode[];
  activeUri: string;
  keyword: string;
  rootUri?: string;
  onItemClick(treeNode: TreeNode): void;
}

function highlightText(text: string, keyword: string, highlightClassName: string): ReactNode {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return text;
  }

  const normalizedText = text.toLowerCase();
  const segments: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = normalizedText.indexOf(normalizedKeyword, cursor);

  if (matchIndex === -1) {
    return text;
  }

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      segments.push(text.slice(cursor, matchIndex));
    }

    const matchEnd = matchIndex + normalizedKeyword.length;
    segments.push(
      <mark key={`${matchIndex}-${matchEnd}`} className={highlightClassName}>
        {text.slice(matchIndex, matchEnd)}
      </mark>,
    );

    cursor = matchEnd;
    matchIndex = normalizedText.indexOf(normalizedKeyword, cursor);
  }

  if (cursor < text.length) {
    segments.push(text.slice(cursor));
  }

  return <>{segments}</>;
}

const SearchList: FC<SearchListProps> = ({
  files,
  activeUri,
  keyword,
  rootUri,
  onItemClick,
}) => {
  return (
    <div className={styles.list}>
      {files.map((node, index) => {
        const fileName = basename(node.uri);
        const relativePath = rootUri ? relative(rootUri, node.uri) : decodeURIComponent(node.uri);
        const filePath = relativePath || fileName;
        const active = isEquals(activeUri, node.uri);

        return (
          <button
            key={node.uri}
            type="button"
            data-search-result-item={index === 0 ? 'first' : 'item'}
            className={`${styles.item} ${active ? styles.itemActive : ''}`.trim()}
            onClick={() => onItemClick(node)}
            title={decodeURIComponent(node.uri)}
            aria-current={active ? 'true' : undefined}
            aria-label={`${fileName} · ${filePath}`}
          >
            <DocumentRegular className={styles.icon} fontSize={16} />
            <div className={styles.textWrap}>
              <div className={styles.fileName}>
                {highlightText(fileName, keyword, styles.highlight)}
              </div>
              <div className={styles.filePath}>
                {highlightText(filePath, keyword, styles.highlight)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SearchList;
