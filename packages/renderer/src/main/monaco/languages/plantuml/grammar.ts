import * as ohm from 'ohm-js';

const def = String.raw`
  PlantUML {
    Begin =
      | StartUML
      | ~"@" UMLBody
    StartUML = "@startuml" UMLBody "@enduml"

    UMLBody = Diagram?

    Diagram = SequenceDiagram

    SequenceDiagram = SequenceStatements

    SequenceStatements = SequenceStatement+

    SequenceStatement =
      | singleLineComment
      | multipleLineComment
      | skinparamCommand
      | autonumberCommand
      | newpageCommand
      | participantDeclaration
      | sequenceMessage


    sequenceMessage =
      | participantName whitespace* sequenceArrow whitespace* participantName? whitespace* sequenceMessageTail
      | participantName? whitespace* sequenceArrow whitespace* participantName whitespace* sequenceMessageTail
    sequenceMessageTail =
      | whitespace* whitespace* &lineEnd
      | ":" noneNewLineChar* &lineEnd

    // 声明参与者
    participantDeclaration =
      | withRSpace<participantKind> participantName participantDeclarationAsCourse? participantDeclarationColorCourse? &lineEnd -- normal
      | withRSpace<"participant"> withRSpace<participantName> withRSpace<"order"> digit+ &lineEnd -- order

    participantDeclarationAsCourse = whitespace+ "as" whitespace+ participantName
    participantDeclarationColorCourse = whitespace+ colorChars



    participantName = stringLiteral | identifier


    participantKind = ("actor" | "boundary" | "control" | "entity" | "database" | "collections" | "queue" | "participant")

    sequenceArrow =
      | sequenceLeftArrow
      | sequenceRightArrow
      | sequenceRightShortArrow
      | sequenceLeftShortArrow

    // sequence 箭头
    sequenceLeftArrow = sequenceArrowShaft rightArrowHead
    sequenceRightArrow = leftArrowHead sequenceArrowShaft
    sequenceRightShortArrow =
      | sequenceRightArrow ("?" | "]")
      | ("?" | "]") sequenceRightArrow
    sequenceLeftShortArrow =
      | sequenceLeftArrow ("?" | "]")
      | ("?" | "]") sequenceLeftArrow
    rightArrowHead = (">>" | ">" | "\\\\" | "\\" | "//" | "/") arrowPoint?
    leftArrowHead = ("<<" | "<" | "\\\\" | "\\" | "//" | "/") arrowPoint?
    arrowPoint = ("o" | "x")
    sequenceArrowShaft =
      | "-"+ arrowColor "-"+ --alt0
      | arrowColor "-"+ --alt1
      |  "-"+ arrowColor --alt2
      | "-"+  --alt3

    arrowColor = "[" colorChars "]"

    /* ------------- autonumber --------------*/
    autonumberCommand =
      | "autonumber" withLSpace<"stop"> lineEnd -- stop
      | "autonumber" withLSpace<"resume"> (withLSpace<digit+>)? (withLSpace<stringLiteral>)? lineEnd -- resume
      | "autonumber" (withLSpace<digit+>)? (withLSpace<digit+>)? (withLSpace<stringLiteral>)? lineEnd -- normal

    /* -------------- newline ----------------*/
    newpageCommand = "newpage" (withLSpace<noneNewLineChar+>)? lineEnd


    /* -------------- common commands ------------- */
    skinparamCommand =
      | withRSpace<"skinparam"> skinparamCommandPair -- normal
      | withRSpace<"skinparam"> skinparamCommandParam skinparamCommandBlock -- block
    skinparamCommandParam = identifier stereotype?
    skinparamCommandValue = skinparamCommandValueChar*
    skinparamCommandValueChar = ~"}" (letter | whitespace)
    skinparamCommandBlock = "{" lineEnd skinparamCommandPair* "}"
    skinparamCommandPair =  withRSpace<skinparamCommandParam> skinparamCommandValue lineEnd

    stereotype = "<<" whitespaceAroundOrNot<identifier> ">>"
    // 空格环绕
    whitespaceAroundOrNot<x> = whitespace* x whitespace*
    withRSpace<x> = x whitespace+
    withLSpace<x> = whitespace+ x

    // 命名标记
    identifier = ~("\"" | ":") normalChar+
    normalChar = letter | digit

    // 颜色
    colorChars= "#" alnum+

    // 字符串常量
    stringLiteral = "\"" doubleQuoteChars? "\""
    // 双引号字符串
    doubleQuoteChars = doubleQuoteChar+
    doubleQuoteChar = ~("\"" | nl)  any

    // 多行注释
    multipleLineComment = "/'" multipleLineCommentChar* "'/"
    multipleLineCommentChar = ~"'/" any

    // 单行注释
    singleLineComment = space* "'" singleLineCommentChars? &lineEnd
    singleLineCommentChars = singleLineCommentChar+
    singleLineCommentChar = noneNewLineChar

    // 非空白符号
    noneSpaceChars = noneSpaceChar+
    noneSpaceChar = ~space any

    noneNewLineChar = ~nl any

    lineEnd =
      | whitespace* end
      | whitespace* nl

    whitespace =
      | " "
      | "\t"

    // 换行符
    nl =
      | "\n"
      | "\r"
      | "\u2028"
      | "\u2029"
  }
`;

export default ohm.grammar(def);
