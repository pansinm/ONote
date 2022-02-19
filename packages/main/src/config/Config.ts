import * as fs from 'fs/promises';
import * as os from 'os';
import * as YAML from 'yaml';
import * as path from 'path';

class Config {
  configFile: string;
  constructor(configFile: string) {
    this.configFile = configFile;
  }
  private conf: Record<string, string> = {};

  get BACKEND() {
    return this.conf.backend || 'local';
  }

  get PROJECT_ID() {
    return this.conf.projectId || path.resolve(os.homedir(), 'onote');
  }

  async load() {
    try {
      const yaml = await fs.readFile(this.configFile, 'utf-8');
      this.conf = YAML.parse(yaml);
    } catch (err) {
      // ignore
    }
  }
  async save() {
    try {
      const yaml = YAML.stringify(this.conf);
      return fs.writeFile(this.configFile, yaml, 'utf-8');
    } catch (err) {
      console.error('save config failed', err);
    }
  }
}

export default Config;
