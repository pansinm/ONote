import * as worker from 'monaco-editor/esm/vs/editor/editor.worker';

export interface ICreateData {
  languageId: string;
  options: unknown;
}

class PumlWorker {
  _ctx: worker.IWorkerContext;
  _createData: ICreateData;
  constructor(ctx: worker.IWorkerContext, createData: ICreateData) {
    console.log(ctx, createData);
    this._ctx = ctx;
    this._createData = createData;
  }
}

self.onmessage = () => {
  worker.initialize((ctx, createData) => {
    return new PumlWorker(ctx, createData);
  });
};
