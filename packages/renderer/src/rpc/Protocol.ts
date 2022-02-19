interface Data {
  rpc: 'request' | 'response';
  method: string;
  reqId: string;
}

export interface RPCRequestData extends Data {
  rpc: 'request';
  args: any[];
}

export interface RPCResponseData extends Data {
  rpc: 'response';
  error?: any;
  res: any;
}

export type RPCData = RPCRequestData | RPCResponseData;
