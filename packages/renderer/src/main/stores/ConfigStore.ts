import { makeAutoObservable, reaction, runInAction } from 'mobx';
import * as YAML from 'yaml';

type ActiveType = 'notepad' | 'tag';

class ConfigStore {
  config: {
    root?: string;
    active?: {
      id: string;
      type: 'notepad' | 'tag';
    };
  } = {};

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.config,
      () => {
        this.saveConfig();
      },
      {
        delay: 1000,
      },
    );
    this.loadConfig();
  }

  get active() {
    return this.config.active;
  }

  /**
   * 设置当前激活的分类
   * @param type
   * @param id
   */
  setActive(type: ActiveType, id: string) {
    this.config = {
      ...this.config,
      active: { type, id },
    };
  }

  isActive(type: ActiveType, id: string) {
    return this.config.active?.type === type && this.config.active.id === id;
  }

  private async loadConfig() {
    const configPath = [window.simmer.homedir(), '.simmer.yaml'].join('/');
    const defaultRoot = [window.simmer.homedir(), 'simmer'].join('/');
    try {
      const content = await window.simmer.readFile(configPath, 'utf8');
      const config = YAML.parse(content);
      this.config = { root: defaultRoot, ...config };
    } catch (err) {
      runInAction(() => {
        this.config = {
          root: defaultRoot,
        };
      });
    }
    await window.simmer.ensureDir(this.config.root!);
  }

  setRoot(path: string) {
    this.config = {
      ...this.config,
      root: path,
    };
  }

  private async saveConfig() {
    const configPath = [window.simmer.homedir(), '.simmer.yaml'].join('/');
    await window.simmer.writeFile(configPath, YAML.stringify(this.config));
  }
}

export default ConfigStore;
