import type IPCMethod from './IPCMethod';

export interface IPCMessage {
  method: string;
  payload?: any;
  error?: any;
  type: 'request' | 'response' | 'event';
  id: string;
}

export interface IPCEvent extends IPCMessage {
  type: 'event';
}

export interface IPCRequest extends IPCMessage {
  type: 'request';
}

export interface IPCResponse extends IPCMessage {
  type: 'response';
}

export interface IPCGetEditorModelRequest extends IPCRequest {
  method: IPCMethod.GetEditorModel;
}

export interface IPCGetEditorModelResponse extends IPCResponse {
  method: IPCMethod.GetEditorModel;
  payload: {
    uri: string;
    content: string;
    rootDirUri: string;
  };
}

export interface IPCEditorModelChangedEvent extends IPCEvent {
  method: IPCMethod.EditorModelChanged;
  payload: {
    uri: string;
    content: string;
    rootDirUri: string;
    lineNumber?: number;
  };
}

export interface IPCEditorScrollChangedEvent extends IPCEvent {
  method: IPCMethod.EditorScrollChangedEvent;
  payload: {
    uri: string;
    lineNumber: number;
  };
}

export interface IPCGetEditorScrollPositionRequest extends IPCRequest {
  method: IPCMethod.GetEditorScrollPosition;
}

export interface IPCGetEditorScrollPositionResponse extends IPCResponse {
  method: IPCMethod.GetEditorScrollPosition;
  payload: {
    uri: string;
    lineNumber: number;
  };
}
