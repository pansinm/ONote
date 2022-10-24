class Stdlib {
  modules: { path: string }[] = [];
  loading = false;
  async resolve(): Promise<typeof this.modules> {
    if (this.modules.length || this.loading) {
      return this.modules;
    }
    this.loading = true;
    return fetch(
      'https://api.github.com/repos/plantuml/plantuml-stdlib/git/trees/master?recursive=10',
    )
      .then((res) => res.json())
      .then((body) => {
        this.modules = (body as any).tree;
        return this.modules;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

export default new Stdlib();
