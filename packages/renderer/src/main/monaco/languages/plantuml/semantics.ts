import grammar from './grammar';
import type { ParticipantDeclaration, SequenceDiagram, UML } from './UMLAst';

const semantics = grammar.createSemantics();
semantics.addOperation('toTree', {
  _terminal() {
    return this.sourceString as any;
  },
  Begin(_1) {
    return _1.toTree();
  },
  StartUML(_1, _2, _3) {
    return _2.toTree();
  },
  UMLBody(_1) {
    return {
      type: 'UML',
      diagram: _1.toTree()[0] || null,
    } as UML;
  },
  SequenceDiagram(_1) {
    return {
      type: 'SequenceDiagram',
      statements: _1.children.map((child) => child.toTree()).flat(1),
    } as SequenceDiagram;
  },

  SequenceStatements(_1) {
    return _1.children.map((child) => child.toTree());
  },
  singleLineComment(_1, _2, _3, _4) {
    return {
      type: 'SingleLineComment',
      value: _3.sourceString.trim(),
    };
  },
  multipleLineComment(_1, comment, _3) {
    return {
      type: 'MultipleLineComment',
      value: comment.sourceString.trim(),
    };
  },
  sequenceMessage(left, _2, arrow, _4, right, _6, message) {
    return {
      type: 'SequenceMessage',
      left: left.sourceString,
      right: right.sourceString,
      arrow: arrow.toTree(),
      message: message.sourceString.slice(1).trim(),
    };
  },
  participantName(_1) {
    return {
      type: 'ParticipantName',
      name: _1.sourceString,
    };
  },
  sequenceArrow(_1) {
    return {
      type: 'Arrow',
      value: this.sourceString,
    };
  },

  participantDeclaration(kind, _2, name, as, color, _6) {
    return {
      type: 'ParticipantDeclaration',
      kind: kind.sourceString.toLowerCase(),
      name: name.sourceString,
      as: as.children[2]?.sourceString,
      color: color.sourceString.trim() || undefined,
    } as ParticipantDeclaration;
  },
  _iter(...children) {
    return children.map((c) => {
      return c.toTree();
    });
  },
});

export default semantics;
