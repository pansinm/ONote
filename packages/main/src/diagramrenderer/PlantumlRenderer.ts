import { encode as encodePlantUML } from 'plantuml-encoder';
import * as https from 'https';
import * as http from 'http';
import type { Diagram, IDiagramRenderer } from './types';

class PlantumlRenderer implements IDiagramRenderer {
  endpoint: string;
  code: string;
  constructor(endpoint: string, code: string) {
    this.endpoint = endpoint;
    this.code = code;
  }
  async render(): Promise<Diagram> {
    const encodedUML = encodePlantUML(this.code);
    const url = this.endpoint + '/svg/' + encodedUML;
    const client = /^https:/.test(this.endpoint) ? http : https;
    const xml = await new Promise<string>((resolve, reject) => {
      client
        .get(url, (res) => {
          let data = '';
          res.on('data', (thunk) => {
            data += thunk;
          });
          res.on('end', () => resolve(data));
          res.on('error', (err) => reject(err));
        })
        .on('error', (err) => {
          reject(err);
        });
    });
    return {
      mime: 'image/svg+xml',
      base64: Buffer.from(xml).toString('base64'),
    };
  }
}

export default PlantumlRenderer;
