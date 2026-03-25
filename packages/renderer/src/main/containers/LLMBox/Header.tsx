/**
 * Agent头部区域：
 * 1. 受控组件
 * 2. 包含 className和style属性
 * 3. 显示title及Agent图标(默认)
 * 4. 样式美观、符合项目整体风格
 * 5. Agent工作时，Agent图标有动画效果
 */

import classNames from 'classnames';
import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Header.module.scss';

export type AgentState = 'idle' | 'thinking' | 'executing';

export interface HeaderProps {
  // 标题文本
  title?: string;

  // Agent 状态，用于控制图标动画
  agentState?: AgentState;

  // 自定义容器类名（用于外部样式覆盖）
  className?: string;

  // 自定义容器样式（用于外部样式定义）
  style?: React.CSSProperties;

  // 自定义图标（可选）
  icon?: React.ReactNode;
}

const Header: FC<HeaderProps> = (props) => {
  const {
    title = 'Agent',
    agentState = 'idle',
    className,
    style,
    icon,
  } = props;
  const { t } = useTranslation('common');

  // 判断 Agent 是否在工作状态
  const isWorking = agentState === 'thinking' || agentState === 'executing';

  return (
    <div
      className={classNames(styles.header, className)}
      style={style}
    >
      <div className={styles.titleContainer}>
        {icon || (
          <i
            className={classNames(
              'bi',
              'bi-robot',
              styles.icon,
              isWorking && styles.iconAnimating,
            )}
            aria-label={t('agentIcon')}
          />
        )}
        <span className={styles.title}>{title}</span>
      </div>
    </div>
  );
};

export default Header;
