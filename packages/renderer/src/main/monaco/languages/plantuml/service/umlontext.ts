import { parse } from '../../preprocessor/parser';
import type { Root } from '../../preprocessor/PreprocessorAst';

class UMLContext {
  resolve(puml: string) {
    const ast: Root = parse(puml);
  }

  async resolveRemote(url: string) {
    const puml = await fetch(url).then((res) => res.text());
    return this.resolve(puml);
  }
}
