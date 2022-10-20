import type { Arrow, SequenceDiagram, Statement } from '../../UMLAst';
import { SequenceMessage } from '../../UMLAst';

export default [
  {
    desc: 'empty',
    input: '\n\r\n',
    expect: {
      type: 'UML',
      diagram: null,
    },
  },
  {
    desc: 'empty with @startuml',
    input: `@startuml
    @enduml`,
    expect: {
      type: 'UML',
      diagram: null,
    },
  },
  {
    desc: 'Basic examples',
    input: `
    @startuml
    Alice -> Bob: Authentication Request
    Bob --> Alice: Authentication Response
    @enduml
    `,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'SequenceMessage',
            arrow: {
              type: 'Arrow',
              value: '->',
            } as Arrow,
            left: 'Alice',
            right: 'Bob',
            message: 'Authentication Request',
          },
          {
            type: 'SequenceMessage',
            arrow: {
              type: 'Arrow',
              value: '-->',
            } as Arrow,
            left: 'Bob',
            right: 'Alice',
            message: 'Authentication Response',
          },
        ] as Statement[],
      } as SequenceDiagram,
    },
  },
];
