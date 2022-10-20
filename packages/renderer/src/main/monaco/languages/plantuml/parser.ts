import grammar from './grammar';
import semantics from './semantics';

export function parse(input: string) {
  // console.log(grammar.trace(input));
  const match = grammar.match(input);
  const ast = semantics(match).toTree();
  console.log(JSON.stringify(ast, null, 2));
  return ast;
}
