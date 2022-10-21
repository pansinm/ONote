// 根节点
export interface UML {
  type: 'UML';
  diagram: SequenceDiagram;
}

export interface SequenceDiagram {
  type: 'SequenceDiagram';
  statements: Statement[];
}

export type Statement =
  | SequenceMessage
  | SingleLineComment
  | ParticipantDeclaration;

// 单行注释
export interface SingleLineComment {
  type: 'SingleLineComment';
  value: string;
}

// 声明 participant
export interface ParticipantDeclaration {
  type: 'ParticipantDeclaration';
  kind: string;
  name: string;
  as?: string;
  order?: number;
  color?: string;
}

export interface Arrow {
  type: 'Arrow';
  value: string;
  color?: string;
}

export interface SequenceMessage {
  type: 'SequenceMessage';
  left?: string;
  right?: string;
  message?: string;
  arrow: Arrow;
}

export interface SkinparamCommand {
  type: 'SkinparamCommand';
  param: SkinparamParam;
  value: string | [{ param: SkinparamParam; value: string }];
}

export interface SkinparamParam {
  type: 'SkinparamParam';
  name: string;
  stereotype?: Stereotype;
}

export interface Stereotype {
  type: 'Stereotype';
  name: string;
}
