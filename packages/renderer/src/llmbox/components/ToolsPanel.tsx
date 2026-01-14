import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../AgentStore';

interface ToolsPanelProps {
  store: AgentStore;
  onToolSelect: (toolName: string) => void;
  selectedTool: string | null;
}

export const ToolsPanel = observer(
  ({ store, onToolSelect, selectedTool }: ToolsPanelProps) => {
    return (
      <div className="tools-content">
        <div className="tools-grid">
          {store.tools.map((tool) => (
            <div
              key={tool.name}
              className={`tool-card ${selectedTool === tool.name ? 'selected' : ''}`}
              onClick={() => onToolSelect(tool.name)}
              title={tool.description}
            >
              <div className="tool-icon">{getToolIcon(tool.name)}</div>
              <div className="tool-info">
                <div className="tool-header-info">
                  <span className="tool-name">{tool.name}</span>
                  {tool.metadata?.dangerous && (
                    <span className="tool-badge">⚠️</span>
                  )}
                  <span className="tool-badge permission">
                    {tool.metadata?.permission}
                  </span>
                </div>
                <p className="tool-desc">{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

function getToolIcon(toolName: string): string {
  const iconMap: Record<string, string> = {
    readFile: '📄',
    writeFile: '✏️',
    createFile: '📝',
    deleteFile: '🗑️',
    listFiles: '📂',
    searchFiles: '🔍',
    searchInFile: '🔎',
    createTodo: '📋',
    updateTodo: '✏️',
    listTodos: '📋',
    markTodoCompleted: '✅',
    deleteTodo: '🗑️',
  };
  return iconMap[toolName] || '🔧';
}

export default ToolsPanel;
