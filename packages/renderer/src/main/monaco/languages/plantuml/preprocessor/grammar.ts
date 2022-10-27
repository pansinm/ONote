import ohm from 'ohm-js';

const def = String.raw`
  PlantUMLPreprocessor {
    Root = Statement*

    Statement =
      | variableDeclaration
      | DefineStatement
      | DefineLongStatement
      | IncludeStatement
      | InlineFunctionDeclaration
      | FunctionDeclaration
      | ProcedureDeclaration
      | IfStatement
      | WhileStatement
      | ReturnStatement
      | ExpressionStatement
      | UnknownStatement
      | umlStatement

    variableDeclaration = "!" globalVar? identifier wsAroundOptional<"="> expression &le
    globalVar =
      | "global" ws+ -- global
      | "local" ws+ -- local

    /* ------------- Function & Procedure ------------ */
    InlineFunctionDeclaration = functionStart identifier  Arguments? "return" expression &le
    FunctionDeclaration = functionStart identifier Arguments? Statement* endToken<"function">
    ProcedureDeclaration = procedureStart identifier Arguments? Statement* endToken<"procedure">
    functionStart =
      | "!function" -- normal
      | "!unquoted function" -- unquoted
    procedureStart =
      | "!procedure" -- normal
      | "!unquoted procedure" -- unquoted

    endToken<x> = "!end" ws* x

    Arguments = "(" ListOf<Argument, ","> ")"
    Argument = identifier ("=" expression)?

    IncludeStatement = includeToken includePath #includePart?
    includeToken =
      | "!includeurl"
      | "!includesub"
      | "!include"

    includePath =
      | "<" pathChars ">" -- std
      | pathChars  -- normal
    pathChars = pathChar+
    includePart = "!" identifier
    pathChar = letter | digit | "." | "/" | ":" | "_" | "-"

    DefineStatement = #"!define " identifier Arguments? #defineContent
    defineContent = ws+ notnl+

    DefineLongStatement = "!definelong" identifier Arguments? Statement* "!enddefinelong"

    ReturnStatement = "!return" expression

    IfStatement = "!if" expression Statement*  ElseBlock? endToken<"if">
    ElseBlock =
      | "!elseif" expression Statement* ElseBlock* -- elseif
      | "!else" Statement*  -- else

    WhileStatement = "!while" expression Statement* endToken<"while">

    // TODO
    UnknownStatement = "!" ("log" | "assert" | "themes" | "dump_memory" | "import") #notnl*

    umlStatement = ~("!" any+)  notnl+ &le

    ExpressionStatement =
     | #callExpression

    expression =
      | binaryExpression
      | callExpression
      | parenthesizedExpression
      | numberLiteral
      | stringLiteral
      | identifier

    callExpression = ("%" | "!")? identifier "(" applySyntactic<ListOf<expression,",">> ")"

    binaryExpression =
      | expression wsAroundOptional<binaryOperatorToken> expression

    parenthesizedExpression = "(" wsAroundOptional<expression> ")"

    binaryOperatorToken =
      | "!="
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
      | "$" (letter | digit | "_")* -- dolor
      | letter (letter | digit | "_")*  -- letter

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
