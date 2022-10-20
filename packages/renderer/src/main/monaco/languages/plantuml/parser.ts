import grammar from './grammar';
import semantics from './semantics';

export function parse(input: string) {
  // console.log(grammar.trace(input));
  const match = grammar.match(input);
  return semantics(match).toTree();
}
