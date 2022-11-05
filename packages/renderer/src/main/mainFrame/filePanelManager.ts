interface IFilePanel {
  extensions: string[];
  doGetContent?(uri: string): Promise<string>;
  doSaveContent?(uri: string, content: string): Promise<void>;
  editable?: boolean;
  languageId?: string;
  previewer?: string;
}

class FilePanelManager {
  filePanels: IFilePanel[] = [];
  getPanel(uri: string) {
    return this.filePanels.find((panel) =>
      panel.extensions.find((extension) => uri.endsWith(extension)),
    );
  }
  registerFilePanel(panel: IFilePanel) {
    this.filePanels.unshift(panel);
  }
}

export default new FilePanelManager();
