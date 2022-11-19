import { first, orderBy } from 'lodash';
import { getDataSource } from '../ipc';

interface IFilePanel {
  extensions: string[];
  doGetContent?(uri: string): Promise<string>;
  doSaveContent?(uri: string, content: string): Promise<void>;
  editable: boolean;
  languageId?: string;
  previewer?: string;
}

class FilePanelManager {
  private filePanels: { [ext: string]: IFilePanel[] } = {};
  getPanel(uri: string) {
    const ext = first(
      orderBy(
        Object.keys(this.filePanels).filter((ext) => uri.endsWith(ext)),
        'length',
        'desc',
      ),
    );
    return ext ? first(this.filePanels[ext]) : undefined;
  }
  async registerFilePanel(panel: IFilePanel) {
    panel.extensions.forEach((ext) => {
      const panels = (this.filePanels[ext] = [] as IFilePanel[]);
      panels.unshift(panel);
      this.filePanels[ext] = panels;
    });
  }
}

export default new FilePanelManager();
