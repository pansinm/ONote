class Stdlib {
  modules: { path: string; type: string; url: string }[] = [];
  loading = false;

  getModule(name: string) {
    return this.modules.find(
      (module) => module.path === name || module.path === name + '.puml',
    );
  }

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
