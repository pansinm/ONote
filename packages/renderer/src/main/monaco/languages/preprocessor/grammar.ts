import * as ohm from 'ohm-js';

const def = String.raw`
  PlantUMLPreprocessor {
    Root = Statement*

    Statement =
      | variableDeclaration
      | IfStatement
      | umlStatement

    variableDeclaration = "!" identifier wsAroundOptional<"="> expression &le

    IfStatement = "!if" expression Statement*  ElseBlock? "!endif"
    ElseBlock =
      | "!elseif" expression Statement* ElseBlock* -- elseif
      | "!else" Statement+  -- else

    umlStatement = ~("!" any+)  notnl+ &le

    expression =
      | binaryExpression
      | parenthesizedExpression
      | numberLiteral
      | stringLiteral
      | identifier

    binaryExpression =
      | expression wsAroundOptional<binaryOperatorToken> expression

    parenthesizedExpression = "(" wsAroundOptional<expression> ")"

    binaryOperatorToken =
      | ">="
      | ">"
      | "<="
      | "<"
      | "&&"
      | "||"
      | "=="
      | "+"
      | "-"
      | "*"
      | "/"

    numberLiteral = digit+

    stringLiteral =
      | "\"" stringLiteralDbChar* "\""
      | "'"  stringLiteralSgChar* "'"
    stringLiteralDbChar = ~(nl | "\"") any
    stringLiteralSgChar = ~(nl | "\'") any

    identifier =
      | "$" letter  (letter | digit)* -- dolor
      | letter (letter | digit)*  -- letter

    wsAroundOptional<x> = ws* x ws*

    // line end
    le =
      | ws* end
      | ws* nl

    // whitespace
    ws =
      | " "
      | "\t"

    notnl = ~nl any

    // new line
    nl =
      | "\n"
      | "\r"
      | "\u2028"
      | "\u2029"
  }
`;

export default ohm.grammar(def);
