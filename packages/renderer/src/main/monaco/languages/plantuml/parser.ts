import grammar from './grammar';
import semantics from './semantics';
// import * as fs from 'fs';

export function parse(input: string) {
  const t = grammar.trace(input).toString();
  // console.log(t);
  // fs.writeFileSync('a.txt', t);
  const match = grammar.match(input);
  console.log(match.message);
  const ast = semantics(match).toTree();
  console.log(JSON.stringify(ast, null, 2));
  return ast;
}
