import React from 'react';
import styles from '../AgentPanel.module.scss';

interface BottomTabsProps {
  activeTab: 'execution' | 'tools';
  onTabChange: (tab: 'execution' | 'tools') => void;
  toolCount: number;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({
  activeTab,
  onTabChange,
  toolCount,
}) => {
  return (
    <div className={styles.BottomTabs}>
      <button
        className={`${styles.BottomTabItem} ${
          activeTab === 'execution' ? styles.active : ''
        }`}
        onClick={() => onTabChange('execution')}
      >
        📋 Execution Log
      </button>
      <button
        className={`${styles.BottomTabItem} ${
          activeTab === 'tools' ? styles.active : ''
        }`}
        onClick={() => onTabChange('tools')}
      >
        🔧 Tools ({toolCount})
      </button>
    </div>
  );
};

export default BottomTabs;
