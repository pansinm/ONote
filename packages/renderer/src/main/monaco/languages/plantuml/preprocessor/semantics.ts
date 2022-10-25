import _ from 'lodash';
import type { Node } from 'ohm-js';
import grammar from './grammar';
import type {
  Argument,
  BinaryExpression,
  BinaryOperatorToken,
  CallExpression,
  DefineLongStatement,
  DefineStatement,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  IncludeStatement,
  InlineFunctionDeclaration,
  NumberLiteral,
  ParenthesizedExpression,
  ProcedureDeclaration,
  ReturnStatement,
  Root,
  StringLiteral,
  UmlText,
  UnknownStatement,
  VariableDeclaration,
  WhileStatement,
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
  variableDeclaration(
    _1,
    _g,
    identifier,
    _3,
    expression,
    _5,
  ): VariableDeclaration {
    const ctorName = _g.child(0)?.ctorName;
    const scope =
      ctorName === 'globalVar'
        ? 'global'
        : ctorName === 'localVar'
        ? 'local'
        : undefined;
    return {
      type: 'VariableDeclaration',
      init: expression.toTree(),
      name: identifier.toTree(),
      pos: getPos(this),
      scope: scope,
    };
  },
  IncludeStatement(_i, path, subpart): IncludeStatement {
    const isStd = path.child(0).ctorName === 'includePath_std';
    const [_1, _2] = path.child(0).children;
    return {
      type: 'IncludeStatement',
      token: _i.sourceString.slice(1) as IncludeStatement['token'],
      path: isStd ? _2.sourceString : _1.sourceString,
      pos: getPos(this),
      std: isStd,
      subpart: subpart.child(0)?.child(1)?.sourceString,
    };
  },
  InlineFunctionDeclaration(
    _,
    name,
    args,
    _return,
    expression,
    _le,
  ): InlineFunctionDeclaration {
    return {
      name: name.toTree(),
      unquoted: _.child(0)?.ctorName === 'functionStart_unquoted' || undefined,
      type: 'InlineFunctionDeclaration',
      pos: getPos(this),
      return: expression.toTree(),
      arguments: args.child(0)?.toTree() || [],
    };
  },
  FunctionDeclaration(_, name, args, statements, _7): FunctionDeclaration {
    return {
      name: name.toTree(),
      unquoted: _.child(0)?.ctorName === 'functionStart_unquoted' || undefined,
      type: 'FunctionDeclaration',
      pos: getPos(this),
      statements: statements.children.map((child) => child.toTree()),
      arguments: args.child(0)?.toTree() || [],
    };
  },
  ProcedureDeclaration(_, name, args, statements, _7): ProcedureDeclaration {
    return {
      name: name.toTree(),
      unquoted: _.child(0)?.ctorName === 'functionStart_unquoted' || undefined,
      type: 'ProcedureDeclaration',
      pos: getPos(this),
      statements: statements.children.map((child) => child.toTree()),
      arguments: args.child(0)?.toTree() || [],
    };
  },
  DefineStatement(_1, name, args, content): DefineStatement {
    return {
      type: 'DefineStatement',
      name: name.toTree(),
      arguments: args.child(0)?.toTree(),
      content: content.child(1).sourceString,
      pos: getPos(this),
    };
  },
  DefineLongStatement(_1, name, args, statements, _3): DefineLongStatement {
    return {
      type: 'DefineLongStatement',
      name: name.toTree(),
      arguments: args.child(0)?.toTree(),
      statements: statements.children.map((child) => child.toTree()),
      pos: getPos(this),
    };
  },
  Arguments(_, args, _3) {
    return args.child(0)?.asIteration().toTree() || [];
  },
  Argument(id, _, init): Argument {
    return {
      type: 'Argument',
      name: id.toTree(),
      pos: getPos(this),
      init: init.child(0)?.toTree(),
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
  WhileStatement(_start, expression, statements, _end): WhileStatement {
    return {
      type: 'WhileStatement',
      expression: expression.toTree(),
      statements: statements.children.map((child) => child.toTree()),
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
  ReturnStatement(_, expression): ReturnStatement {
    return {
      type: 'ReturnStatement',
      expression: expression.toTree(),
      pos: getPos(this),
    };
  },
  ExpressionStatement(expression): ExpressionStatement {
    return {
      type: 'ExpressionStatement',
      expression: expression.toTree(),
      pos: getPos(expression),
    };
  },
  UnknownStatement(_1, _2, _3): UnknownStatement {
    return {
      type: 'UnknownStatement',
      text: this.sourceString,
      pos: getPos(this),
    };
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
  binaryOperatorToken(token): BinaryOperatorToken {
    return {
      type: 'BinaryOperatorToken',
      kind: token.sourceString.trim() as BinaryOperatorToken['kind'],
      pos: getPos(token),
    };
  },
  callExpression(lead, name, _open, args, _close): CallExpression {
    return {
      type: 'CallExpression',
      name: name.toTree(),
      buildIn: lead.sourceString === '%' || undefined,
      args: args.asIteration().toTree(),
      pos: getPos(this),
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
  numberLiteral(chars): NumberLiteral {
    return {
      type: 'NumberLiteral',
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
