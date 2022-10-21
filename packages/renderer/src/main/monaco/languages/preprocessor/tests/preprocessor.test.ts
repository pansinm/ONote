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
        init: ['1', '0'],
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
                left: ['1', '0'],
                operator: '>=',
                pos: {
                  start: 77,
                  end: 82,
                },
                right: ['4'],
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
