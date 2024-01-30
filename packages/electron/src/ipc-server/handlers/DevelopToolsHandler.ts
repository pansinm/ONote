import IpcHandler from '../IpcHandler';

class DevelopToolsHandler extends IpcHandler {
  openDevTools() {
    this.sender.openDevTools();
  }
}

export default DevelopToolsHandler;
