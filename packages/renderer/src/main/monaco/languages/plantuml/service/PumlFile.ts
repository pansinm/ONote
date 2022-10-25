import * as monaco from 'monaco-editor';
import { parse, traverse } from '../preprocessor/parser';
import type {
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

  includes: PumlFile[] = [];

  declarations: VariableDeclaration[] = [];
  callableNodes: (
    | FunctionDeclaration
    | InlineFunctionDeclaration
    | ProcedureDeclaration
  )[] = [];

  ast: Root;
  url: string;
  constructor(content: string, url?: string) {
    console.log('----content\n', content);
    this.ast = parse(content);
    this.url = url || '';
    this.parseVars();
  }

  suggestions(range: monaco.Range): monaco.languages.CompletionItem[] {
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
    this.includes.forEach((include) => {
      items.push(...include.suggestions(range));
    });
    return items;
  }

  private async parseVars() {
    const includes: IncludeStatement[] = [];
    traverse(this.ast, {
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
      const include = await PumlFile.fetchOrCreate(fullurl);
      this.includes.push(include);
    }
  }
}

export default PumlFile;
