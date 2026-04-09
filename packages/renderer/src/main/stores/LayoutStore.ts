import { makeAutoObservable } from 'mobx';

type Layout = 'split' | 'editor-only' | 'previewer-only';

const layouts: Layout[] = ['split', 'editor-only', 'previewer-only'];
class LayoutStore {
  layout: Layout = 'split';
  /** AI 助手默认可见 — 新用户第一眼就看到 AI 伙伴 */
  llmBoxVisible: undefined | boolean = true;

  llmBoxUrl = '';

  constructor() {
    makeAutoObservable(this);
  }

  switchLayout() {
    const index = layouts.indexOf(this.layout);
    const next = (index + 1) % layouts.length;
    this.setLayout(layouts[next]);
  }

  setLayout(layout: Layout) {
    this.layout = layout;
  }

  showLLMBox(url: string) {
    this.llmBoxVisible = true;
    this.llmBoxUrl = url;
  }

  hideLLMBox() {
    this.llmBoxVisible = false;
  }
}

export default LayoutStore;
