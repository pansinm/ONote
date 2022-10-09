import blockquote from './blockquote';
import Break from './break';
import code from './code';
import Delete from './delete';
import emphasis from './emphasis';
import footnoteReference from './footnote-reference';
import footnoteDefinition from './footnote-definition';
import emoji from './emoji';
import footnote from './footnote';
import heading from './heading';
import html from './html';
import imageReference from './image-reference';
import image from './image';
import unknown from './unknown';
import inlineCode from './inline-code';
import linkReference from './link-reference';
import link from './link';
import listItem from './list-item';
import list from './list';
import paragraph from './paragraph';
import root from './root';
import strong from './strong';
import table from './table';
import text from './text';
import thematicBreak from './thematic-break';
import toml from './toml';
import yaml from './yaml';

const handlers = {
  toml,
  yaml,
  blockquote,
  break: Break,
  code,
  delete: Delete,
  emphasis,
  emoji,
  footnoteReference,
  footnote,
  heading,
  html,
  imageReference,
  image,
  inlineCode,
  linkReference,
  link,
  listItem,
  list,
  unknown,
  paragraph,
  root,
  strong,
  table,
  text,
  thematicBreak,
  /** 单独在root中渲染 */
  footnoteDefinition: () => null,
};

export default handlers;
