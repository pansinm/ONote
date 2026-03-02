import IpcHandler from '../IpcHandler';
import { app } from 'electron';

class AppHandler extends IpcHandler {
  async quit(): Promise<void> {
    app.exit(0);
  }
}

export default AppHandler;
