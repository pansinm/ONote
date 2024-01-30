class DevelopToolsService {
  openDevTools() {
    window.onote.developTools?.invoke('openDevTools');
  }
}

export default new DevelopToolsService();
