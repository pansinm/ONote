import React from 'react';
import styles from './AgentPanel.module.scss';
import Icon from '/@/components/Icon';

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
        <Icon type="list-check" size={16} />
        <span>Execution Log</span>
      </button>
      <button
        className={`${styles.BottomTabItem} ${
          activeTab === 'tools' ? styles.active : ''
        }`}
        onClick={() => onTabChange('tools')}
      >
        <Icon type="tools" size={16} />
        <span>Tools ({toolCount})</span>
      </button>
    </div>
  );
};

export default BottomTabs;
