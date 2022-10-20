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
  {
    desc: 'Declaring participant',
    input: `
    @startuml
    participant participant as Foo
    actor actor as Foo1
    boundary boundary as Foo2
    control control as Foo3
    entity entity as Foo4
    database database as Foo5
    collections collections as Foo6
    queue queue as Foo7
    Foo -> Foo1 : To actor
    Foo -> Foo2 : To boundary
    Foo -> Foo3 : To control
    Foo -> Foo4 : To entity
    Foo -> Foo5 : To database
    Foo -> Foo6 : To collections
    Foo -> Foo7: To queue
    @enduml
    `,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'ParticipantDeclaration',

            kind: 'participant',
            name: 'participant',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'actor',
            name: 'actor',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'boundary',
            name: 'boundary',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'control',
            name: 'control',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'entity',
            name: 'entity',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'database',
            name: 'database',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'collections',
            name: 'collections',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'queue',
            name: 'queue',
          },
          {
            type: 'SequenceMessage',
            left: 'Foo',
            right: 'Foo1',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'To actor',
          },
          {
            type: 'SequenceMessage',
            left: 'Foo',
            right: 'Foo2',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'To boundary',
          },
          {
            type: 'SequenceMessage',
            left: 'Foo',
            right: 'Foo3',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'To control',
          },
          {
            type: 'SequenceMessage',
            left: 'Foo',
            right: 'Foo4',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'To entity',
          },
          {
            type: 'SequenceMessage',
            left: 'Foo',
            right: 'Foo5',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'To database',
          },
          {
            type: 'SequenceMessage',
            left: 'Foo',
            right: 'Foo6',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'To collections',
          },
          {
            type: 'SequenceMessage',
            left: 'Foo',
            right: 'Foo7',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'To queue',
          },
        ],
      },
    },
  },
];
