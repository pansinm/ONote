import { makeAutoObservable, reaction, runInAction } from 'mobx';
import YAML from 'yaml';
import type ConfigStore from './ConfigStore';
import { v4 as uuid } from 'uuid';

interface Tag {
  id: string;
  name: string;
  color: string;
  icon: string;
  /** 标签数量 */
  count: number;
}

class TagStore {
  configStore: ConfigStore;

  tags: Tag[] = [];

  constructor(projectStore: ConfigStore) {
    this.configStore = projectStore;
    makeAutoObservable(this);

    // 切换目录后，重新加载笔记本配置
    reaction(
      () => this.configStore.config.root,
      () => {
        this.loadTags();
      },
      {
        fireImmediately: true,
      },
    );

    // 笔记本数据变化后，持久化
    reaction(
      () => this.tags,
      () => {
        this.saveTags();
      },
      {
        delay: 1000,
      },
    );
  }

  async loadTags() {
    if (!this.configStore.config.root) {
      return;
    }
    let tags: Tag[] = [];
    try {
      const tagConfig = [this.configStore.config.root, 'tags.yml'].join('/');
      const content = await window.simmer.readFile(tagConfig, 'utf8');
      tags = YAML.parse(content);
    } catch (err) {
      console.error(err);
    }

    runInAction(() => {
      this.tags = tags;
    });
  }

  async createTags(tag: Omit<Tag, 'id'>) {
    this.tags = [
      {
        ...tag,
        id: uuid(),
      },
      ...this.tags,
    ];
  }

  async deleteTag(tagId: string) {
    this.tags = this.tags.filter((tag) => tag.id !== tagId);
  }

  private async saveTags() {
    if (!this.configStore.config.root) {
      return;
    }
    const notepadsFile = [this.configStore.config.root, 'tags.yml'].join('/');
    await window.simmer.writeFile(notepadsFile, YAML.stringify(this.tags));
  }
}

export default TagStore;
