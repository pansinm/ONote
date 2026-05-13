import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  container: {
    padding: '20px',
    maxWidth: '460px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--colorNeutralStroke2)',
    fontSize: '13px',
  },
  action: {
    color: 'var(--colorNeutralForeground1)',
  },
  keys: {
    display: 'flex',
    gap: '4px',
  },
  kbd: {
    display: 'inline-block',
    padding: '2px 6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    backgroundColor: 'var(--colorNeutralBackground3)',
    border: '1px solid var(--colorNeutralStroke2)',
    borderRadius: '4px',
    color: 'var(--colorNeutralForeground2)',
  },
  section: {
    marginTop: '20px',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--colorNeutralForeground3)',
  },
});

const modKey = () => {
  if (typeof navigator === 'undefined') return 'Ctrl';
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
    ? '⌘'
    : 'Ctrl';
};

/** 单条快捷键定义：[翻译 key, 显示用按键组合] */
type ShortcutEntry = [actionKey: string, keys: string[]];

const APPLICATION_SHORTCUTS: ShortcutEntry[] = [
  ['newNote', ['N']],
  ['saveFile', ['S']],
  ['toggleSidebar', ['B']],
  ['closeTab', ['W']],
  ['closeAllTabs', ['⇧', 'W']],
  ['focusSearch', ['P']],
  ['switchLayout', ['\\']],
  ['nextTab', ['Tab']],
  ['prevTab', ['⇧', 'Tab']],
];

const EXTRA_SHORTCUTS: ShortcutEntry[] = [
  ['devTools', ['⇧', 'I']],
  ['closeSearch', ['Esc']],
];

const EDITOR_SHORTCUTS: ShortcutEntry[] = [
  ['toggleBold', ['B']],
  ['toggleTaskItem', ['Alt', 'D']],
];

const ShortcutsPanel: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation('setting');
  const mod = modKey();

  const renderEntry = ([actionKey, keys]: ShortcutEntry, prefix?: string) => (
    <div className={styles.row} key={actionKey + keys.join()}>
      <span className={styles.action}>
        {t(actionKey)}
      </span>
      <span className={styles.keys}>
        {prefix && <span className={styles.kbd}>{prefix}</span>}
        {keys.map((k) => (
          <span className={styles.kbd} key={k}>{k}</span>
        ))}
      </span>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t('shortcuts')}</div>

      <div className={styles.section}>{t('shortcutsApp')}</div>
      {APPLICATION_SHORTCUTS.map((entry) => renderEntry(entry, mod))}

      <div className={styles.section}>{t('shortcutsEditor')}</div>
      {EDITOR_SHORTCUTS.map((entry) => renderEntry(entry, mod))}

      <div className={styles.section}>{t('shortcutsOther')}</div>
      {EXTRA_SHORTCUTS.map((entry) => renderEntry(entry, mod))}
    </div>
  );
};

export default ShortcutsPanel;
