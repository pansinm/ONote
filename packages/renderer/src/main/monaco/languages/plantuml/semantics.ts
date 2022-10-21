import grammar from './grammar';
import type {
  ParticipantDeclaration,
  SequenceDiagram,
  SkinparamCommand,
  SkinparamParam,
  UML,
} from './UMLAst';

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
      color: /\[(#[A-Za-z0-9]+?)\]/.exec(this.sourceString)?.[1],
    };
  },

  participantDeclaration(arg): ParticipantDeclaration {
    if (arg.ctorName == 'participantDeclaration_order') {
      const [kind, name, order, orderDigit] = arg.children;
      return {
        type: 'ParticipantDeclaration',
        kind: kind.sourceString.toLocaleLowerCase().trim(),
        name: name.sourceString.trim(),
        order: +orderDigit.sourceString.trim(),
      };
    }
    const [kind, name, as, color] = arg.children;
    return {
      type: 'ParticipantDeclaration',
      kind: kind.sourceString.toLowerCase().trim(),
      name: name.sourceString.trim(),
      as: as.children[2]?.sourceString.trim(),
      color: color.sourceString.trim() || undefined,
    } as ParticipantDeclaration;
  },
  skinparamCommand_normal(_1, pair): SkinparamCommand {
    const [key, value] = pair.children;
    return {
      type: 'SkinparamCommand',
      param: key.toTree(),
      value: value.sourceString.trim(),
    };
  },
  skinparamCommandParam(name, stereotype): SkinparamParam {
    return {
      type: 'SkinparamParam',
      name: name.sourceString.trim(),
      stereotype: stereotype.sourceString ? stereotype.toTree() : undefined,
    };
  },
  stereotype(_1, name, _2) {
    return {
      type: 'Stereotype',
      name: name.sourceString.trim(),
    };
  },
  withRSpace(x, _) {
    return x.toTree();
  },
  whitespaceAroundOrNot(_1, x, _3) {
    return x.toTree();
  },
  _iter(...children) {
    return children.map((c) => {
      return c.toTree();
    });
  },
});

export default semantics;
