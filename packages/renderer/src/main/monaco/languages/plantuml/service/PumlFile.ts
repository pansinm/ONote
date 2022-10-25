import * as monaco from 'monaco-editor';
import { parse, traverse } from '../preprocessor/parser';
import type {
  DefineLongStatement,
  DefineStatement,
  FunctionDeclaration,
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

  declarations: VariableDeclaration[] = [];
  callableNodes: (
    | FunctionDeclaration
    | InlineFunctionDeclaration
    | ProcedureDeclaration
  )[] = [];

  ast: Root;
  url: string;
  constructor(content: string, url?: string) {
    this.ast = parse(content);
    this.url = url || '';
  }

  async replaceContent(content: string) {
    this.ast = parse(content);
  }

  queryCallable(name: string): typeof this.callableNodes[0] | undefined {
    let node = this.callableNodes.find((n) => n.name.name === name);
    if (node) {
      return node;
    }
    for (const include of Object.values(this.includes)) {
      node = include.queryCallable(name);
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
    const callable = this.queryCallable(name);
    return (
      callable?.arguments.map((arg) => {
        return {
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: arg.name.name + '=',
          label: arg.name.name,
          range,
        };
      }) || []
    );
  }

  async suggestions(
    range: monaco.Range,
  ): Promise<monaco.languages.CompletionItem[]> {
    await this.parseVars();
    const items: monaco.languages.CompletionItem[] = [];
    this.declarations.forEach((dec) => {
      items.push({
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: dec.name.name,
        label: dec.name.name,
        range,
      });
    });
    this.callableNodes.forEach((callale) => {
      items.push({
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: callale.name.name,
        label: callale.name.name,
        range,
      });
    });

    for (const include of Object.values(this.includes)) {
      const parentVar = await include.suggestions(range);
      items.push(
        ...parentVar.filter(
          (a) =>
            (a as any).type !== 'VariableDeclaration' ||
            (a as any).scope === 'global',
        ),
      );
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
