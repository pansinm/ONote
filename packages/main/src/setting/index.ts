import { app } from 'electron';
import Store from 'electron-store';

export default new Store({
  name: 'onote',
  cwd: app.getPath('userData'),
  clearInvalidConfig: true,
});
