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

type Statement = VariableDeclaration;

export interface VariableDeclaration extends Position {
  type: 'VariableDeclaration';
  name: Identifier;
  init: Expression;
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
  children: Statement[];
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
  type: 'OperatorToken';
  kind: '+' | '-' | '*' | '/' | '&&' | '||';
}

export interface ParenthesizedExpression extends Position {
  type: 'ParenthesizedExpression';
  expression: Expression;
}

export interface Identifier extends Position {
  type: 'Identifier';
  name: string;
}

export type Expression =
  | BinaryExpression
  | ParenthesizedExpression
  | StringLiteral
  | NumberLiteral
  | Identifier;
