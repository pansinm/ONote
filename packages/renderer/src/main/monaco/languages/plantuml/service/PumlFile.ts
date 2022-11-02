import type * as monaco from 'monaco-editor';
import { CompletionItemKind } from 'monaco-editor/esm/vs/editor/common/standalone/standaloneEnums';
import { parse, traverse } from '../preprocessor/parser';
import type {
  DefineLongStatement,
  DefineStatement,
  FunctionDeclaration,
  Identifier,
  IncludeStatement,
  InlineFunctionDeclaration,
  ProcedureDeclaration,
  Root,
  VariableDeclaration,
} from '../preprocessor/PreprocessorAst';
import stdlib from './stdlib';

class PumlFile {
  static cache: Record<string, PumlFile> = {};

  static create(content: string, url?: string) {
    if (!url) {
      return new PumlFile(content);
    }
    if (!this.cache[url]) {
      this.cache[url] = new PumlFile(content, url);
    }
    return this.cache[url];
  }

  static async fetchOrCreate(url: string) {
    if (this.cache[url]) {
      return this.cache[url];
    }
    const content = await fetch(url)
      .then((res) => res.json())
      .then((body) => body.content);
    return PumlFile.create(atob(content), url);
  }

  includes: Record<string, PumlFile> = {};

  identifiers: Identifier[] = [];

  declarations: VariableDeclaration[] = [];
  callableNodes: (
    | FunctionDeclaration
    | InlineFunctionDeclaration
    | ProcedureDeclaration
  )[] = [];

  ast: Root;
  url: string;
  constructor(content: string, url?: string) {
    try {
      this.ast = parse(content);
      this.url = url || '';
    } catch (err) {
      console.error(err, content);
      throw err;
    }
  }

  async replaceContent(content: string) {
    this.ast = parse(content);
  }

  async queryCallable(
    name: string,
  ): Promise<typeof this.callableNodes[0] | undefined> {
    await this.parseVars();
    let node = this.callableNodes.find((n) => n.name.name === name);
    if (node) {
      return node;
    }
    for (const include of Object.values(this.includes)) {
      node = await include.queryCallable(name);
      if (node) {
        return node;
      }
    }
    return node;
  }

  async arguments(
    name: string,
    range: monaco.Range,
  ): Promise<monaco.languages.CompletionItem[]> {
    await this.parseVars();
    const callable = await this.queryCallable(name);
    if (/Define/.test(callable?.type || '')) {
      return [];
    }
    return (
      callable?.arguments.map((arg) => {
        return {
          kind: CompletionItemKind.Field,
          insertText: arg.name.name + '=',
          label: arg.name.name,
          range,
        };
      }) || []
    );
  }

  async suggestions(
    range: monaco.Range,
    filter?: (node: any) => boolean,
  ): Promise<monaco.languages.CompletionItem[]> {
    await this.parseVars();
    const items: monaco.languages.CompletionItem[] = [];
    const nodeFilter = (node: any) => (filter ? filter(node) : true);
    this.declarations.filter(nodeFilter).forEach((dec) => {
      items.push({
        kind: CompletionItemKind.Variable,
        insertText: dec.name.name,
        label: dec.name.name,
        range,
      });
    });
    this.callableNodes.filter(nodeFilter).forEach((callale) => {
      items.push({
        kind: CompletionItemKind.Method,
        insertText: callale.name.name,
        label: callale.name.name,
        range,
      });
    });

    this.identifiers.filter(nodeFilter).forEach((identifier) => {
      if (!items.some((node) => node.insertText === identifier.name)) {
        items.push({
          kind: CompletionItemKind.Variable,
          insertText: identifier.name,
          label: identifier.name,
          range,
        });
      }
    });

    for (const include of Object.values(this.includes)) {
      const parentVar = await include.suggestions(range, (node) => {
        return (
          node.type !== 'Identifier' &&
          (node.type !== 'VariableDeclaration' || node.scope === 'global')
        );
      });
      items.push(...parentVar);
    }
    return items;
  }

  private async parseVars() {
    if (this.callableNodes.length || this.declarations.length) {
      return;
    }
    const includes: IncludeStatement[] = [];
    traverse(this.ast, {
      VariableDeclaration: (node: VariableDeclaration) => {
        this.declarations.push(node);
      },
      FunctionDeclaration: (node: FunctionDeclaration) => {
        this.callableNodes.push(node);
      },
      InlineFunctionDeclaration: (node: InlineFunctionDeclaration) => {
        this.callableNodes.push(node);
      },
      ProcedureDeclaration: (node: ProcedureDeclaration) => {
        this.callableNodes.push(node);
      },
      IncludeStatement: (node: IncludeStatement) => {
        includes.push(node);
      },
      DefineStatement: (node: DefineStatement) => {
        if (node.arguments) {
          this.callableNodes.push(node as any);
        } else {
          this.declarations.push(node as any);
        }
      },
      DefineLongStatement: (node: DefineLongStatement) => {
        if (node.arguments) {
          this.callableNodes.push(node as any);
        } else {
          this.declarations.push(node as any);
        }
      },
      Identifier: (node: Identifier) => {
        this.identifiers.push(node);
      },
    });
    for (const inc of includes) {
      let fullurl = inc.path;
      if (inc.std) {
        fullurl = stdlib.getModule(inc.path)?.url as string;
        if (!fullurl) {
          continue;
        }
      } else if (!/https?:/.test(fullurl)) {
        fullurl = new URL(inc.path, this.url).toString();
      }
      if (!this.includes[fullurl]) {
        this.includes[fullurl] = await PumlFile.fetchOrCreate(fullurl);
      }
    }
  }
}

export default PumlFile;
