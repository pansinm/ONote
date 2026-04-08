import { makeAutoObservable } from 'mobx';

type Layout = 'split' | 'editor-only' | 'previewer-only';

const layouts: Layout[] = ['split', 'editor-only', 'previewer-only'];
class LayoutStore {
  layout: Layout = 'split';
  /** undefined = 从未打开过 LLMBox; true = 可见; false = 已隐藏 */
  llmBoxVisible: undefined | boolean = undefined;

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
