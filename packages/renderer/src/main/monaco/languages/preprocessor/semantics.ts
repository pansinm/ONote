import type { Node } from 'ohm-js';
import grammar from './grammar';
import type {
  BinaryExpression,
  Identifier,
  IfStatement,
  ParenthesizedExpression,
  Root,
  StringLiteral,
  UmlText,
  VariableDeclaration,
} from './PreprocessorAst';

const semantics = grammar.createSemantics();

function getPos(node: Node) {
  return {
    start: node.source.startIdx,
    end: node.source.endIdx,
  };
}

semantics.addOperation('toTree', {
  _terminal() {
    return this.sourceString as any;
  },
  Root(root): Root {
    return {
      type: 'Root',
      children: root.children.map((child) => child.toTree()),
      sourceString: this.sourceString,
      pos: getPos(this),
    };
  },
  expression(expression) {
    return expression.toTree();
  },
  variableDeclaration(_1, identifier, _3, expression, _5): VariableDeclaration {
    return {
      type: 'VariableDeclaration',
      init: expression.toTree(),
      name: identifier.toTree(),
      pos: getPos(this),
    };
  },
  IfStatement(_1, expression, then, elseif, _): IfStatement {
    return {
      type: 'IfStatement',
      expression: expression.toTree(),
      then: then.toTree(),
      else: elseif.toTree(),
      pos: getPos(this),
    };
  },
  ElseBlock_elseif(_1, expression, then, elseif): IfStatement {
    return {
      type: 'IfStatement',
      expression: expression.toTree(),
      then: then.toTree(),
      else: elseif.toTree(),
      pos: getPos(this),
    };
  },
  ElseBlock_else(_, statements) {
    return statements.children.map((child) => child.toTree());
  },
  umlStatement(uml, _): UmlText {
    return {
      type: 'UmlText',
      text: uml.sourceString,
      pos: getPos(uml),
    };
  },
  binaryExpression(left, token, right): BinaryExpression {
    return {
      type: 'BinaryExpression',
      left: left.toTree(),
      operator: token.toTree(),
      pos: getPos(this),
      right: right.toTree(),
    };
  },
  parenthesizedExpression(_1, expression, _3): ParenthesizedExpression {
    return {
      type: 'ParenthesizedExpression',
      expression: expression.toTree(),
      pos: getPos(this),
    };
  },
  stringLiteral(_1, chars, _2): StringLiteral {
    return {
      type: 'StringLiteral',
      text: chars.sourceString,
      pos: getPos(this),
    };
  },
  identifier(id): Identifier {
    return {
      type: 'Identifier',
      name: id.sourceString,
      pos: getPos(this),
    };
  },
  wsAroundOptional(_1, x, _2) {
    return x.toTree();
  },
  _iter(...children) {
    return children.map((c) => {
      return c.toTree();
    });
  },
});

export default semantics;
