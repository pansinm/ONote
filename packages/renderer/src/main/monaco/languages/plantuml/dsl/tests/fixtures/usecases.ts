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
  {
    desc: 'You can use the order keyword to customize the display order of participants.',
    input: String.raw`@startuml
participant Last order 30
participant Middle order 20
participant First order 10
@enduml`,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'ParticipantDeclaration',
            kind: 'participant',
            name: 'Last',
            order: 30,
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'participant',
            name: 'Middle',
            order: 20,
          },
          {
            type: 'ParticipantDeclaration',
            kind: 'participant',
            name: 'First',
            order: 10,
          },
        ],
      },
    },
  },
  {
    desc: '',
    input: String.raw`@startuml
skinparam responseMessageBelowArrow true
Bob -> Alice : hello
Alice -> Bob : ok
@enduml`,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'SkinparamCommand',
            param: {
              type: 'SkinparamParam',
              name: 'responseMessageBelowArrow',
            },
            value: 'true',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'hello',
          },
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'ok',
          },
        ],
      },
    },
  },
  {
    desc: 'Change arrow color',
    input: String.raw`@startuml
Bob -[#red]> Alice : hello
Alice -[#0000FF]->Bob : ok
@enduml`,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '-[#red]>',
              color: '#red',
            },
            message: 'hello',
          },
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '-[#0000FF]->',
              color: '#0000FF',
            },
            message: 'ok',
          },
        ],
      },
    },
  },
  {
    desc: 'Message sequence numbering',
    input: String.raw`@startuml
autonumber
Bob -> Alice : Authentication Request
Bob <- Alice : Authentication Response
autonumber 15
Bob -> Alice : Another authentication Request
Bob <- Alice : Another authentication Response
autonumber 40 10
Bob -> Alice : Yet another authentication Request
Bob <- Alice : Yet another authentication Response
@enduml`,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'AutoNumberCommand',
            value: 0,
            step: 0,
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
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
              value: '<-',
            },
            message: 'Authentication Response',
          },
          {
            type: 'AutoNumberCommand',
            value: 15,
            step: 0,
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'Another authentication Request',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '<-',
            },
            message: 'Another authentication Response',
          },
          {
            type: 'AutoNumberCommand',
            value: 40,
            step: 10,
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'Yet another authentication Request',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '<-',
            },
            message: 'Yet another authentication Response',
          },
        ],
      },
    },
  },
  {
    desc: '',
    input: String.raw`@startuml
autonumber 10 10 "<b>[000]"
Bob -> Alice : Authentication Request
Bob <- Alice : Authentication Response
autonumber stop
Bob -> Alice : dummy
autonumber resume "<font color=red><b>Message 0 "
Bob -> Alice : Yet another authentication Request
Bob <- Alice : Yet another authentication Response
autonumber stop
Bob -> Alice : dummy
autonumber resume 1 "<font color=blue><b>Message 0 "
Bob -> Alice : Yet another authentication Request
Bob <- Alice : Yet another authentication Response
@enduml`,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'AutoNumberCommand',
            value: 10,
            step: 10,
            format: '<b>[000]',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
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
              value: '<-',
            },
            message: 'Authentication Response',
          },
          {
            type: 'AutoNumberCommand',
            action: 'stop',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'dummy',
          },
          {
            type: 'AutoNumberCommand',
            action: 'resume',
            format: '<font color=red><b>Message 0 ',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'Yet another authentication Request',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '<-',
            },
            message: 'Yet another authentication Response',
          },
          {
            type: 'AutoNumberCommand',
            action: 'stop',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'dummy',
          },
          {
            type: 'AutoNumberCommand',
            action: 'resume',
            skip: 1,
            format: '<font color=blue><b>Message 0 ',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'Yet another authentication Request',
          },
          {
            type: 'SequenceMessage',
            left: 'Bob',
            right: 'Alice',
            arrow: {
              type: 'Arrow',
              value: '<-',
            },
            message: 'Yet another authentication Response',
          },
        ],
      },
    },
  },
  {
    desc: '1.10 Splitting diagrams',
    input: String.raw`@startuml
Alice -> Bob : message 1
Alice -> Bob : message 2
newpage
Alice -> Bob : message 3
Alice -> Bob : message 4
newpage A title for the\nlast page
Alice -> Bob : message 5
Alice -> Bob : message 6
@enduml`,
    expect: {
      type: 'UML',
      diagram: {
        type: 'SequenceDiagram',
        statements: [
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'message 1',
          },
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'message 2',
          },
          {
            type: 'NewPageCommand',
          },
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'message 3',
          },
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'message 4',
          },
          {
            type: 'NewPageCommand',
            title: 'A title for the\\nlast page',
          },
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'message 5',
          },
          {
            type: 'SequenceMessage',
            left: 'Alice',
            right: 'Bob',
            arrow: {
              type: 'Arrow',
              value: '->',
            },
            message: 'message 6',
          },
        ],
      },
    },
  },
];
