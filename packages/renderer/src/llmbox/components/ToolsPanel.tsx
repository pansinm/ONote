import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../store';
import styles from './AgentPanel.module.scss';
import Icon, { type IconType } from '/@/components/Icon';

interface ToolsPanelProps {
  store: AgentStore;
  onToolSelect: (toolName: string) => void;
  selectedTool: string | null;
}

const TOOL_ICONS: Record<string, IconType> = {
  readFile: 'file-earmark-text',
  writeFile: 'pencil',
  createFile: 'file-earmark-plus',
  deleteFile: 'trash',
  listFiles: 'folder2-open',
  searchFiles: 'search',
  searchInFile: 'file-text',
  createTodo: 'list-check',
  updateTodo: 'pencil-square',
  listTodos: 'list-check',
  markTodoCompleted: 'check-circle',
  deleteTodo: 'trash2',
};

export const ToolsPanel = observer(
  ({ store, onToolSelect, selectedTool }: ToolsPanelProps) => {
    return (
      <div className={styles.ToolsContent}>
        <div className={styles.ToolsGrid}>
          {store.tools.map((tool) => (
            <div
              key={tool.name}
              className={`${styles.ToolCard} ${selectedTool === tool.name ? styles.selected : ''}`}
              onClick={() => onToolSelect(tool.name)}
              title={tool.description}
            >
              <div className={styles.ToolIcon}>
                <Icon type={TOOL_ICONS[tool.name] || 'gear'} size={28} />
              </div>
              <div className={styles.ToolInfo}>
                <div className={styles.ToolHeaderInfo}>
                  <span className={styles.ToolName}>{tool.name}</span>
                  {tool.metadata?.dangerous && (
                    <span className={`${styles.ToolBadge} ${styles.dangerous}`}>
                      <Icon type="exclamation-triangle" size={12} />
                    </span>
                  )}
                  <span className={`${styles.ToolBadge} ${styles.permission} ${styles[tool.metadata?.permission || 'read']}`}>
                    {tool.metadata?.permission}
                  </span>
                </div>
                <p className={styles.ToolDesc}>{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default ToolsPanel;
