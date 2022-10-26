export interface Position {
  pos: {
    start: number;
    end: number;
  };
}

export interface Root extends Position {
  type: 'Root';
  children: Statement[];
  file?: string;
  sourceString: string;
}

type Statement =
  | VariableDeclaration
  | WhileStatement
  | IfStatement
  | InlineFunctionDeclaration
  | FunctionDeclaration
  | ProcedureDeclaration
  | IncludeStatement
  | DefineLongStatement
  | DefineLongStatement
  | ReturnStatement
  | UmlText;

export interface VariableDeclaration extends Position {
  type: 'VariableDeclaration';
  name: Identifier;
  init: Expression;
  scope?: 'global' | 'local';
}

export interface ExpressionStatement extends Position {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface InlineFunctionDeclaration extends Position {
  name: Identifier;
  type: 'InlineFunctionDeclaration';
  arguments: Argument[];
  unquoted?: boolean;
  return: Expression;
}

export interface DefineStatement extends Position {
  type: 'DefineStatement';
  arguments?: Argument[];
  name: Identifier;
  content: string;
}

export interface DefineLongStatement extends Position {
  type: 'DefineLongStatement';
  arguments?: Argument[];
  name: Identifier;
  statements: Statement[];
}

export interface UnknownStatement extends Position {
  type: 'UnknownStatement';
  text: string;
}

export interface FunctionDeclaration extends Position {
  name: Identifier;
  unquoted?: boolean;
  type: 'FunctionDeclaration';
  arguments: Argument[];
  statements: Statement[];
}

export interface ProcedureDeclaration extends Position {
  name: Identifier;
  unquoted?: boolean;
  type: 'ProcedureDeclaration';
  arguments: Argument[];
  statements: Statement[];
}

export interface ReturnStatement extends Position {
  type: 'ReturnStatement';
  expression: Expression;
}

export interface IncludeStatement extends Position {
  type: 'IncludeStatement';
  token: 'includeurl' | 'includesub' | 'include';
  path: string;
  std?: boolean;
  subpart?: string;
}

export interface Argument extends Position {
  type: 'Argument';
  name: Identifier;
  init?: Expression;
}

export interface UmlText extends Position {
  type: 'UmlText';
  text: string;
}

export interface IfStatement extends Position {
  type: 'IfStatement';
  expression: Expression;
  then: Statement[];
  else?: IfStatement | Statement[];
}

export interface WhileStatement extends Position {
  type: 'WhileStatement';
  expression: Expression;
  statements: Statement[];
}

export interface NumberLiteral extends Position {
  type: 'NumberLiteral';
  text: string;
}

export interface StringLiteral extends Position {
  type: 'StringLiteral';
  text: string;
}

export interface BinaryExpression extends Position {
  type: 'BinaryExpression';
  left: Expression;
  right: Expression;
  operator: BinaryOperatorToken;
}

export interface BinaryOperatorToken extends Position {
  type: 'BinaryOperatorToken';
  kind: '+' | '-' | '*' | '/' | '&&' | '||' | '!=';
}

export interface ParenthesizedExpression extends Position {
  type: 'ParenthesizedExpression';
  expression: Expression;
}

export interface Identifier extends Position {
  type: 'Identifier';
  name: string;
}

export interface CallExpression extends Position {
  type: 'CallExpression';
  name: Identifier;
  buildIn?: boolean;
  args: Expression[];
}

export type Expression =
  | BinaryExpression
  | ParenthesizedExpression
  | CallExpression
  | StringLiteral
  | NumberLiteral
  | Identifier;
