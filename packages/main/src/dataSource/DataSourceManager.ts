import EventEmitter from 'events';
import DataSource from './DataSource';

class DataSourceManager extends EventEmitter {
  private dataSources: Record<string, DataSource> = {};

  private currentDataSource?: string;

  getDataSource(id: string) {
    if (id === 'current') {
      return this.dataSources[this.currentDataSource || ''];
    }
    return this.dataSources[id];
  }

  setCurrentDataSource(id: string) {
    this.currentDataSource = id;
  }

  register(id: string, cfg: Record<string, any> = {}) {
    if (id === 'current') {
      throw new Error('current 保留字，不能作为数据源ID');
    }
    if (!this.dataSources[id]) {
      const datasource = new DataSource(id, cfg, this);
      datasource.on('file.content.changed', (uri) => {
        this.emit('file.content.changed', { uri });
      });
      this.dataSources[id] = datasource;
    }
    return this.dataSources[id];
  }
}

export default DataSourceManager;
