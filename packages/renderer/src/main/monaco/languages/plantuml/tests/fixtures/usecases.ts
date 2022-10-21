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
    Bob--> Alice: Authentication Response
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
  {
    desc: 'change the background color of actor or participant.',
    input: String.raw`@startuml
actor Bob #red
' The only difference between actor
'and participant is the drawing
participant Alice
participant "I have a really\nlong name" as L #99FF99
/' You can also declare:
participant L as "I have a really\nlong name" #99FF99
'/
Alice->Bob: Authentication Request
Bob->Alice: Authentication Response
Bob->L: Log transaction
@enduml
`,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'ParticipantDeclaration',
            kind: 'actor',
            name: 'Bob',
            color: '#red',
          },
          {
            type: 'SingleLineComment',
            value: 'The only difference between actor',
          },
          {
            type: 'SingleLineComment',
            value: 'and participant is the drawing',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'participant',
            name: 'Alice',
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'participant',
            name: '"I have a really\\nlong name"',
            color: '#99FF99',
          },
          {
            type: 'MultipleLineComment',
            value:
              'You can also declare:\nparticipant L as "I have a really\\nlong name" #99FF99',
          },
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'Authentication Request',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'Authentication Response',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'L',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'Log transaction',
          },
        ],
      },
    },
  },
];
