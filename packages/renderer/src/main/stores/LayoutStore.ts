import { makeAutoObservable } from 'mobx';

type Layout = 'split' | 'editor-only' | 'previewer-only';

const layouts: Layout[] = ['split', 'editor-only', 'previewer-only'];
class LayoutStore {
  layout: Layout = 'split';
  sidebarShown: undefined | boolean = undefined;

  sidebarUrl = '';

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

  showSidebar(url: string) {
    this.sidebarShown = true;
    this.sidebarUrl = url;
  }

  hideSidebar() {
    this.sidebarShown = false;
  }
}

export default LayoutStore;
