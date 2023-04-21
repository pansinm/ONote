import { makeAutoObservable } from 'mobx';

type Layout = 'split' | 'editor-only' | 'previewer-only';

class LayoutStore {
  layout: Layout = 'split';
  sidebarShown: undefined | boolean = undefined;

  sidebarUrl = '';

  constructor() {
    makeAutoObservable(this);
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
