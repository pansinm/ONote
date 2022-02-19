import type { IDiagramRenderer, Diagram } from './types';

class Flow implements IDiagramRenderer {
  code: string;
  options: any;
  constructor(code: string, options: any) {
    this.code = code;
    this.options = options;
  }
  render(): Promise<Diagram> {
    throw new Error('Method not implemented.');
  }
}

export default Flow;
