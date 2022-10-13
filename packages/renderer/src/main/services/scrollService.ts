class ScrollService {
  private scrollTops: { [uri: string]: number } = {};
  setScrollTop(uri: string, scrollTop: number) {
    this.scrollTops[uri] = scrollTop;
  }
  getScrollTop(uri: string) {
    return this.scrollTops[uri] || 0;
  }
}

export default new ScrollService();
