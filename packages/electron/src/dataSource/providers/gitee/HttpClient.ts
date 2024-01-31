import { net } from 'electron';
import fs from 'fs';
import { assert } from '/@/utils/assert';

const fetch = net.fetch;

class HttpClient {
  constructor(private options: RequestInit = {}) {}
  async get(uri: string) {
    const response = await fetch(uri, this.options);
    return response.json();
  }

  async put(uri: string, body: FormData) {
    const response = await fetch(uri, {
      method: 'PUT',
      body,
      ...this.options,
    });
    return response.json();
  }

  async post(uri: string, body: FormData) {
    const response = await fetch(uri, {
      method: 'POST',
      body,
      ...this.options,
    });
    return response.json();
  }

  async delete(uri: string) {
    const response = await fetch(uri, {
      method: 'DELETE',
      ...this.options,
    });
    return response.json();
  }

  async getRaw(uri: string) {
    const response = await fetch(uri, {
      method: 'GET',
      ...this.options,
    });
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async download(uri: string, path: string) {
    await fs.promises.writeFile(path, await this.getRaw(uri));
  }
}

export default HttpClient;
