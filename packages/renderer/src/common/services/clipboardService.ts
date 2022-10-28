class ClipboardService {
  async readImage() {
    if (window.simmer) {
      return window.simmer.readImageFromClipboard();
    }
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((type) => type.includes('image'));
      if (type) {
        return item.getType(type);
      }
    }
    return false;
  }

  async readText() {
    return navigator.clipboard.readText();
  }

  async writeText(text: string) {
    const type = 'text/plain';
    const blob = new Blob([text], { type });
    return this.write(blob);
  }

  async write(blob: Blob) {
    const data = [new ClipboardItem({ [blob.type]: blob })];
    return navigator.clipboard.write(data);
  }
}

export default new ClipboardService();
