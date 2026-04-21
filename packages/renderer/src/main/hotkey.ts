/**
 * 全局快捷键体系
 *
 * 快捷键表：
 *   Ctrl/Cmd+N          新建笔记
 *   Ctrl/Cmd+S          保存当前文件
 *   Ctrl/Cmd+B          切换侧边栏
 *   Ctrl/Cmd+W          关闭当前 tab
 *   Ctrl/Cmd+P          聚焦搜索框
 *   Ctrl/Cmd+Tab        下一个 tab
 *   Ctrl/Cmd+Shift+Tab  上一个 tab
 *   Escape              关闭搜索/对话框
 *
 * Monaco Editor 冲突处理：
 *   使用 capture 阶段的全局 keydown 监听器，当 Monaco 获得焦点时，
 *   对需要拦截的快捷键执行 preventDefault + stopPropagation，
 *   同时保留 Monaco 自身的 Ctrl+F（查找）、Ctrl+H（替换）等功能。
 */
import i18next from 'i18next';
import developToolsService from './services/developToolsService';
import stores from './stores';
import fileService from './services/fileService';
import { resolveUri } from '../common/utils/uri';

// ---------------------------------------------------------------------------
// 平台检测
// ---------------------------------------------------------------------------

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/**
 * 判断平台修饰键（macOS → metaKey，其他 → ctrlKey）是否按下，
 * 同时排除相反修饰键以避免误触。
 */
function modKeyDown(e: KeyboardEvent): boolean {
  return isMac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
}

// ---------------------------------------------------------------------------
// Monaco 焦点检测
// ---------------------------------------------------------------------------

const MONACO_SELECTOR = '.monaco-editor';

/** 当前焦点是否在 Monaco Editor 内部 */
function isMonacoFocused(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  return !!active.closest(MONACO_SELECTOR);
}

/**
 * 当焦点在 Monaco 中时，拦截事件并阻止继续传播。
 * 保护我们的应用级快捷键不被 Monaco 吞掉。
 */
function overrideIfMonaco(e: KeyboardEvent): void {
  if (isMonacoFocused()) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// ---------------------------------------------------------------------------
// 快捷键动作
// ---------------------------------------------------------------------------

/** Ctrl/Cmd+N — 新建笔记 */
function handleNewNote(): void {
  const { activeDirUri } = stores.activationStore;
  if (!activeDirUri) return;

  const name = window.prompt(
    i18next.t('menu:inputNoteName'),
    '',
  );
  if (!name) return;

  const fileName = name.includes('.') ? name : `${name}.md`;
  const fileUri = resolveUri(`${activeDirUri}/`, fileName);

  fileService
    .create(activeDirUri, { type: 'file', uri: fileUri })
    .then((node) => {
      // FILE_CREATED 事件会自动触发 FileListStore 和 Directory 刷新
      stores.activationStore.activeFile(node.uri);
    })
    .catch(() => {
      /* 用户取消或文件已存在 */
    });
}

/** Ctrl/Cmd+S — 保存当前文件 */
function handleSave(): void {
  const { activeFileUri } = stores.activationStore;
  if (activeFileUri) {
    stores.fileStore.save(activeFileUri);
  }
}

/** Ctrl/Cmd+B — 切换侧边栏 */
function handleToggleSidebar(): void {
  stores.activationStore.toggleSidebar();
}

/** Ctrl/Cmd+W — 关闭当前 tab */
function handleCloseTab(): void {
  const { activeFileUri } = stores.activationStore;
  if (activeFileUri) {
    stores.activationStore.closeFile(activeFileUri);
  }
}

/** Ctrl/Cmd+P — 聚焦搜索框 */
function handleFocusSearch(): void {
  const searchInput = document.querySelector<HTMLInputElement>(
    'input[type="text"]',
  );
  if (searchInput) {
    searchInput.focus();
    searchInput.select();
  }
}

/** 切换到下一个 (direction=1) / 上一个 (direction=-1) tab */
function handleSwitchTab(direction: 1 | -1): void {
  const { openedFiles, activeFileUri } = stores.activationStore;
  if (openedFiles.length <= 1) return;

  const currentIdx = openedFiles.findIndex((uri) => uri === activeFileUri);
  if (currentIdx === -1) return;

  const nextIdx =
    (currentIdx + direction + openedFiles.length) % openedFiles.length;
  stores.activationStore.activeFile(openedFiles[nextIdx]);
}

// ---------------------------------------------------------------------------
// 全局 keydown 处理器（capture 阶段，优先于 Monaco 接收事件）
// ---------------------------------------------------------------------------

function globalKeydownHandler(e: KeyboardEvent) {
  // ── 平台修饰键 (Ctrl / Cmd) 组合 ──────────────────────────────────
  if (modKeyDown(e)) {
    const { key } = e;

    // Ctrl/Cmd+Shift+I → 开发者工具
    if (key === 'I' && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      developToolsService.openDevTools();
      return;
    }

    // Ctrl/Cmd+Shift+Tab → 上一个 tab
    if (key === 'Tab' && e.shiftKey) {
      overrideIfMonaco(e);
      handleSwitchTab(-1);
      return;
    }

    // Ctrl/Cmd+Tab → 下一个 tab（必须在 Shift+Tab 之后判断）
    if (key === 'Tab') {
      overrideIfMonaco(e);
      handleSwitchTab(1);
      return;
    }

    // 以下单字母快捷键：仅在无 Shift 时生效
    if (e.shiftKey) return;

    switch (key) {
      case 'n':
        overrideIfMonaco(e);
        handleNewNote();
        return;
      case 's':
        overrideIfMonaco(e);
        handleSave();
        return;
      case 'b':
        handleToggleSidebar();
        return;
      case 'w':
        overrideIfMonaco(e);
        handleCloseTab();
        return;
      case 'p':
        overrideIfMonaco(e);
        handleFocusSearch();
        return;
      case 'r':
        // 保留原有的重载功能，仅在非 Monaco 焦点时生效
        if (!isMonacoFocused()) {
          window.location.reload();
        }
        return;
      default:
        break; // 不匹配的按键不拦截，让 Monaco / 浏览器自行处理
    }
    return;
  }

  // ── 无修饰键 ────────────────────────────────────────────────────────
  if (e.key === 'Escape') {
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[type="text"]',
    );
    if (searchInput && document.activeElement === searchInput) {
      // 通过 React 可识别的方式清空受控输入框
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(searchInput, '');
      }
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.blur();
    }
  }
}

// ---------------------------------------------------------------------------
// 注册监听（capture 阶段优先于 Monaco，i18n 初始化后调用）
// ---------------------------------------------------------------------------

export function registerHotkeys(): void {
  window.document.addEventListener('keydown', globalKeydownHandler, true);
}
