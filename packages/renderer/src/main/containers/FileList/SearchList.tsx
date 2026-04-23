import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import type { FC, ReactNode } from 'react';
import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { DocumentRegular } from '@fluentui/react-icons';
import { basename, isEquals, relative } from '/@/common/utils/uri';

interface SearchListProps {
  files: TreeNode[];
  activeUri: string;
  keyword: string;
  rootUri?: string;
  onItemClick(treeNode: TreeNode): void;
}

const useStyles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 8px 8px',
  },
  item: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    width: '100%',
    padding: '9px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    textAlign: 'left',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    ':focus-visible': {
      outline: 'none',
      borderColor: '#a67c38',
      boxShadow: '0 0 0 2px rgba(166, 124, 56, 0.18)',
      backgroundColor: 'rgba(212, 201, 184, 0.36)',
    },
  },
  itemActive: {
    backgroundColor: '#d4c9b8',
  },
  icon: {
    color: '#8a8886',
    marginTop: '2px',
    flexShrink: 0,
  },
  textWrap: {
    minWidth: 0,
    flex: 1,
  },
  fileName: {
    fontSize: '13px',
    lineHeight: 1.45,
    color: '#3b342b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  filePath: {
    marginTop: '2px',
    fontSize: '12px',
    lineHeight: 1.4,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  highlight: {
    backgroundColor: '#f6d98d',
    color: '#2f261d',
    borderRadius: '3px',
    padding: '0 2px',
    fontWeight: 600,
  },
});

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
  const styles = useStyles();

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
