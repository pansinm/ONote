import type { Text } from 'mdast';

export default function paragraph(node: Text, ctx: any) {
  return String(node.value).replace(/[ \t]*(\r?\n|\r)[ \t]*/g, '$1');
}
