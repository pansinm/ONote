type Layout = 'split' | 'editor-only' | 'previewer-only';

class LayoutStore {
  layout: Layout = 'split';

  setLayout(layout: Layout) {
    this.layout = layout;
  }
}

export default LayoutStore;
