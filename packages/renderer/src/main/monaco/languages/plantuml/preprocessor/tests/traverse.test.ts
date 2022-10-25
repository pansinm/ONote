import { traverse } from '../parser';
import type { Root } from '../PreprocessorAst';

const ast: Root = {
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
        operator: {
          kind: '!=',
          pos: {
            end: 15,
            start: 13,
          },
          type: 'BinaryOperatorToken',
        },
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
            operator: {
              kind: '-',
              pos: {
                end: 64,
                start: 63,
              },
              type: 'BinaryOperatorToken',
            },
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

it('traverse root', () => {
  const fn = jest.fn();
  traverse(ast, {
    WhileStatement: (node) => {
      fn(node);
    },
  });
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'WhileStatement' }),
  );
});
