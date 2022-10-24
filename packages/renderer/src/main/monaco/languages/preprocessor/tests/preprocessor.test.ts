import { parse } from '../parser';

it('定义变量', () => {
  const input = String.raw`@startuml
!$ab = "foo1"
!$cd = "foo2"
!$ef = $ab + $cd
Alice -> Bob : $ab
Alice -> Bob : $cd
Alice -> Bob : $ef
@enduml`;
  const output = {
    type: 'Root',
    children: [
      {
        type: 'UmlText',
        text: '@startuml',
        pos: {
          start: 0,
          end: 9,
        },
      },
      {
        type: 'VariableDeclaration',
        init: {
          type: 'StringLiteral',
          text: 'foo1',
          pos: {
            start: 17,
            end: 23,
          },
        },
        name: {
          type: 'Identifier',
          name: '$ab',
          pos: {
            start: 11,
            end: 14,
          },
        },
        pos: {
          start: 10,
          end: 23,
        },
      },
      {
        type: 'VariableDeclaration',
        init: {
          type: 'StringLiteral',
          text: 'foo2',
          pos: {
            start: 31,
            end: 37,
          },
        },
        name: {
          type: 'Identifier',
          name: '$cd',
          pos: {
            start: 25,
            end: 28,
          },
        },
        pos: {
          start: 24,
          end: 37,
        },
      },
      {
        type: 'VariableDeclaration',
        init: {
          type: 'BinaryExpression',
          left: {
            type: 'Identifier',
            name: '$ab',
            pos: {
              start: 45,
              end: 48,
            },
          },
          operator: '+',
          pos: {
            start: 45,
            end: 54,
          },
          right: {
            type: 'Identifier',
            name: '$cd',
            pos: {
              start: 51,
              end: 54,
            },
          },
        },
        name: {
          type: 'Identifier',
          name: '$ef',
          pos: {
            start: 39,
            end: 42,
          },
        },
        pos: {
          start: 38,
          end: 54,
        },
      },
      {
        type: 'UmlText',
        text: 'Alice -> Bob : $ab',
        pos: {
          start: 55,
          end: 73,
        },
      },
      {
        type: 'UmlText',
        text: 'Alice -> Bob : $cd',
        pos: {
          start: 74,
          end: 92,
        },
      },
      {
        type: 'UmlText',
        text: 'Alice -> Bob : $ef',
        pos: {
          start: 93,
          end: 111,
        },
      },
      {
        type: 'UmlText',
        text: '@enduml',
        pos: {
          start: 112,
          end: 119,
        },
      },
    ],
    sourceString:
      '@startuml\n!$ab = "foo1"\n!$cd = "foo2"\n!$ef = $ab + $cd\nAlice -> Bob : $ab\nAlice -> Bob : $cd\nAlice -> Bob : $ef\n@enduml',
    pos: {
      start: 0,
      end: 119,
    },
  };
  const ast = parse(input);
  expect(ast).toEqual(output);
});

it('If', () => {
  const input = String.raw`@startuml
!$a = 10
!$ijk = "foo"
Alice -> Bob : A
!if ($ijk == "foo") && ($a+10>=4)
Alice -> Bob : yes
!else
Alice -> Bob : This should not appear
!endif
Alice -> Bob : B
@enduml`;
  const output = {
    type: 'Root',
    children: [
      {
        type: 'UmlText',
        text: '@startuml',
        pos: {
          start: 0,
          end: 9,
        },
      },
      {
        type: 'VariableDeclaration',
        init: {
          pos: {
            end: 18,
            start: 16,
          },
          text: '10',
          type: 'NumberLiteral',
        },
        name: {
          type: 'Identifier',
          name: '$a',
          pos: {
            start: 11,
            end: 13,
          },
        },
        pos: {
          start: 10,
          end: 18,
        },
      },
      {
        type: 'VariableDeclaration',
        init: {
          type: 'StringLiteral',
          text: 'foo',
          pos: {
            start: 27,
            end: 32,
          },
        },
        name: {
          type: 'Identifier',
          name: '$ijk',
          pos: {
            start: 20,
            end: 24,
          },
        },
        pos: {
          start: 19,
          end: 32,
        },
      },
      {
        type: 'UmlText',
        text: 'Alice -> Bob : A',
        pos: {
          start: 33,
          end: 49,
        },
      },
      {
        type: 'IfStatement',
        expression: {
          type: 'BinaryExpression',
          left: {
            type: 'ParenthesizedExpression',
            expression: {
              type: 'BinaryExpression',
              left: {
                type: 'Identifier',
                name: '$ijk',
                pos: {
                  start: 55,
                  end: 59,
                },
              },
              operator: '==',
              pos: {
                start: 55,
                end: 68,
              },
              right: {
                type: 'StringLiteral',
                text: 'foo',
                pos: {
                  start: 63,
                  end: 68,
                },
              },
            },
            pos: {
              start: 54,
              end: 69,
            },
          },
          operator: '&&',
          pos: {
            start: 54,
            end: 83,
          },
          right: {
            type: 'ParenthesizedExpression',
            expression: {
              type: 'BinaryExpression',
              left: {
                type: 'Identifier',
                name: '$a',
                pos: {
                  start: 74,
                  end: 76,
                },
              },
              operator: '+',
              pos: {
                start: 74,
                end: 82,
              },
              right: {
                type: 'BinaryExpression',
                left: {
                  pos: {
                    end: 79,
                    start: 77,
                  },
                  text: '10',
                  type: 'NumberLiteral',
                },
                operator: '>=',
                pos: {
                  start: 77,
                  end: 82,
                },
                right: {
                  pos: {
                    end: 82,
                    start: 81,
                  },
                  text: '4',
                  type: 'NumberLiteral',
                },
              },
            },
            pos: {
              start: 73,
              end: 83,
            },
          },
        },
        then: [
          {
            type: 'UmlText',
            text: 'Alice -> Bob : yes',
            pos: {
              start: 84,
              end: 102,
            },
          },
        ],
        else: [
          [
            {
              type: 'UmlText',
              text: 'Alice -> Bob : This should not appear',
              pos: {
                start: 109,
                end: 146,
              },
            },
          ],
        ],
        pos: {
          start: 50,
          end: 153,
        },
      },
      {
        type: 'UmlText',
        text: 'Alice -> Bob : B',
        pos: {
          start: 154,
          end: 170,
        },
      },
      {
        type: 'UmlText',
        text: '@enduml',
        pos: {
          start: 171,
          end: 178,
        },
      },
    ],
    sourceString:
      '@startuml\n!$a = 10\n!$ijk = "foo"\nAlice -> Bob : A\n!if ($ijk == "foo") && ($a+10>=4)\nAlice -> Bob : yes\n!else\nAlice -> Bob : This should not appear\n!endif\nAlice -> Bob : B\n@enduml',
    pos: {
      start: 0,
      end: 178,
    },
  };
  const ast = parse(input);
  expect(ast).toEqual(output);
});

it('!function', () => {
  const input = String.raw`!function $double($a=1,$b="3", $c=4)
!return $a + $a
!endfunction`;
  const output = {
    type: 'Root',
    children: [
      {
        name: {
          type: 'Identifier',
          name: '$double',
          pos: {
            start: 10,
            end: 17,
          },
        },
        type: 'FunctionDeclaration',
        pos: {
          start: 0,
          end: 65,
        },
        statements: [
          {
            type: 'ReturnStatement',
            expression: {
              type: 'BinaryExpression',
              left: {
                type: 'Identifier',
                name: '$a',
                pos: {
                  start: 45,
                  end: 47,
                },
              },
              operator: '+',
              pos: {
                start: 45,
                end: 52,
              },
              right: {
                type: 'Identifier',
                name: '$a',
                pos: {
                  start: 50,
                  end: 52,
                },
              },
            },
            pos: {
              start: 37,
              end: 52,
            },
          },
        ],
        arguments: [
          {
            type: 'Argument',
            name: {
              type: 'Identifier',
              name: '$a',
              pos: {
                start: 18,
                end: 20,
              },
            },
            pos: {
              start: 18,
              end: 22,
            },
            init: {
              type: 'NumberLiteral',
              text: '1',
              pos: {
                start: 21,
                end: 22,
              },
            },
          },
          {
            type: 'Argument',
            name: {
              type: 'Identifier',
              name: '$b',
              pos: {
                start: 23,
                end: 25,
              },
            },
            pos: {
              start: 23,
              end: 29,
            },
            init: {
              type: 'StringLiteral',
              text: '3',
              pos: {
                start: 26,
                end: 29,
              },
            },
          },
          {
            type: 'Argument',
            name: {
              type: 'Identifier',
              name: '$c',
              pos: {
                start: 31,
                end: 33,
              },
            },
            pos: {
              start: 31,
              end: 35,
            },
            init: {
              type: 'NumberLiteral',
              text: '4',
              pos: {
                start: 34,
                end: 35,
              },
            },
          },
        ],
      },
    ],
    sourceString:
      '!function $double($a=1,$b="3", $c=4)\n!return $a + $a\n!endfunction',
    pos: {
      start: 0,
      end: 65,
    },
  };
  expect(parse(input)).toEqual(output);
});

it('!procedure', () => {
  const input = String.raw`!procedure msg($source, $destination)
$source --> $destination
!endprocedure`;
  const output = {
    type: 'Root',
    children: [
      {
        name: {
          type: 'Identifier',
          name: 'msg',
          pos: {
            start: 11,
            end: 14,
          },
        },
        type: 'ProcedureDeclaration',
        pos: {
          start: 0,
          end: 76,
        },
        statements: [
          {
            type: 'UmlText',
            text: '$source --> $destination',
            pos: {
              start: 38,
              end: 62,
            },
          },
        ],
        arguments: [
          [
            {
              type: 'Argument',
              name: {
                type: 'Identifier',
                name: '$source',
                pos: {
                  start: 15,
                  end: 22,
                },
              },
              pos: {
                start: 15,
                end: 22,
              },
            },
            {
              type: 'Argument',
              name: {
                type: 'Identifier',
                name: '$destination',
                pos: {
                  start: 24,
                  end: 36,
                },
              },
              pos: {
                start: 24,
                end: 36,
              },
            },
          ],
        ],
      },
    ],
    sourceString:
      '!procedure msg($source, $destination)\n$source --> $destination\n!endprocedure',
    pos: {
      start: 0,
      end: 76,
    },
  };
  expect(parse(input)).toEqual(output);
});

it('inline function', () => {
  const input = String.raw`!function $double($a) return $a + $a`;
  const output = {
    type: 'Root',
    children: [
      {
        name: {
          type: 'Identifier',
          name: '$double',
          pos: {
            start: 10,
            end: 17,
          },
        },
        type: 'InlineFunctionDeclaration',
        pos: {
          start: 0,
          end: 36,
        },
        return: {
          type: 'BinaryExpression',
          left: {
            type: 'Identifier',
            name: '$a',
            pos: {
              start: 29,
              end: 31,
            },
          },
          operator: '+',
          pos: {
            start: 29,
            end: 36,
          },
          right: {
            type: 'Identifier',
            name: '$a',
            pos: {
              start: 34,
              end: 36,
            },
          },
        },
        arguments: [
          {
            type: 'Argument',
            name: {
              type: 'Identifier',
              name: '$a',
              pos: {
                start: 18,
                end: 20,
              },
            },
            pos: {
              start: 18,
              end: 20,
            },
          },
        ],
      },
    ],
    sourceString: '!function $double($a) return $a + $a',
    pos: {
      start: 0,
      end: 36,
    },
  };
  expect(parse(input)).toEqual(output);
});

it('unquoted function', () => {
  const input = String.raw`!unquoted function id($text1, $text2="FOO") return $text1 + $text2`;
  const output = {
    type: 'Root',
    children: [
      {
        name: {
          type: 'Identifier',
          name: 'id',
          pos: {
            start: 19,
            end: 21,
          },
        },
        unquoted: true,
        type: 'InlineFunctionDeclaration',
        pos: {
          start: 0,
          end: 66,
        },
        return: {
          type: 'BinaryExpression',
          left: {
            type: 'Identifier',
            name: '$text1',
            pos: {
              start: 51,
              end: 57,
            },
          },
          operator: '+',
          pos: {
            start: 51,
            end: 66,
          },
          right: {
            type: 'Identifier',
            name: '$text2',
            pos: {
              start: 60,
              end: 66,
            },
          },
        },
        arguments: [
          {
            type: 'Argument',
            name: {
              type: 'Identifier',
              name: '$text1',
              pos: {
                start: 22,
                end: 28,
              },
            },
            pos: {
              start: 22,
              end: 28,
            },
          },
          {
            type: 'Argument',
            name: {
              type: 'Identifier',
              name: '$text2',
              pos: {
                start: 30,
                end: 36,
              },
            },
            pos: {
              start: 30,
              end: 42,
            },
            init: {
              type: 'StringLiteral',
              text: 'FOO',
              pos: {
                start: 37,
                end: 42,
              },
            },
          },
        ],
      },
    ],
    sourceString:
      '!unquoted function id($text1, $text2="FOO") return $text1 + $text2',
    pos: {
      start: 0,
      end: 66,
    },
  };
  expect(parse(input)).toEqual(output);
});

it('While loop', () => {
  const input = String.raw`  !while $arg!=0
    [Component $arg] as $arg
    !$arg = $arg - 1
  !endwhile`;
  const output = {
    type: 'Root',
    children: [
      {
        type: 'WhileStatement',
        expression: {
          type: 'BinaryExpression',
          left: {
            type: 'Identifier',
            name: '$arg',
            pos: {
              start: 9,
              end: 13,
            },
          },
          operator: '!=',
          pos: {
            start: 9,
            end: 16,
          },
          right: {
            type: 'NumberLiteral',
            text: '0',
            pos: {
              start: 15,
              end: 16,
            },
          },
        },
        statements: [
          {
            type: 'UmlText',
            text: '[Component $arg] as $arg',
            pos: {
              start: 21,
              end: 45,
            },
          },
          {
            type: 'VariableDeclaration',
            init: {
              type: 'BinaryExpression',
              left: {
                type: 'Identifier',
                name: '$arg',
                pos: {
                  start: 58,
                  end: 62,
                },
              },
              operator: '-',
              pos: {
                start: 58,
                end: 66,
              },
              right: {
                type: 'NumberLiteral',
                text: '1',
                pos: {
                  start: 65,
                  end: 66,
                },
              },
            },
            name: {
              type: 'Identifier',
              name: '$arg',
              pos: {
                start: 51,
                end: 55,
              },
            },
            pos: {
              start: 50,
              end: 66,
            },
          },
        ],
        pos: {
          start: 2,
          end: 78,
        },
      },
    ],
    sourceString:
      '!while $arg!=0\n    [Component $arg] as $arg\n    !$arg = $arg - 1\n  !endwhile',
    pos: {
      start: 2,
      end: 78,
    },
  };
  expect(parse(input)).toEqual(output);
});

it('include', () => {
  const input = String.raw`!include <aws/common>
!include https://a.b.com/a.puml
!include ../a.puml!part1`;
  const output = {
    type: 'Root',
    children: [
      {
        type: 'IncludeStatement',
        path: 'aws/common',
        pos: {
          start: 0,
          end: 21,
        },
        std: true,
      },
      {
        type: 'IncludeStatement',
        path: 'https://a.b.com/a.puml',
        pos: {
          start: 22,
          end: 53,
        },
        std: false,
      },
      {
        type: 'IncludeStatement',
        path: '../a.puml',
        pos: {
          start: 54,
          end: 78,
        },
        std: false,
        subpart: 'part1',
      },
    ],
    sourceString:
      '!include <aws/common>\n!include https://a.b.com/a.puml\n!include ../a.puml!part1',
    pos: {
      start: 0,
      end: 78,
    },
  };
  expect(parse(input)).toEqual(output);
});
