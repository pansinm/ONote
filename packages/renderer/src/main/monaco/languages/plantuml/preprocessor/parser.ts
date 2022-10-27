import grammar from './grammar';
import type { Root } from './PreprocessorAst';
import semantics from './semantics';
// import * as fs from 'fs';

export function parse(input: string) {
  // const t = grammar.trace(input).toString();
  // console.log(t);
  // fs.writeFileSync('a.txt', t);
  const match = grammar.match(input);
  // console.log(match.message);
  const ast = semantics(match).toTree();
  // console.log(JSON.stringify(ast, null, 2));
  return ast;
}

export function traverse(ast: Root, iter: Record<string, (node: any) => void>) {
  Object.entries(ast).forEach(([key, value]) => {
    if (key === 'type' && iter[value]) {
      iter[value](ast);
    }
    if (Array.isArray(value)) {
      value.forEach((child) => traverse(child, iter));
    } else if (typeof value === 'object') {
      traverse(value, iter);
    }
  });
}
