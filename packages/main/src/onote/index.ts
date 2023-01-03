import { manager } from '../dataSource';
import setting from '../setting';
import { sendToMain } from '../window/ipc';

manager.on('file.content.changed', (payload) => {
  sendToMain('message', {
    channel: 'file.content.changed',
    payload,
    meta: {},
  });
});

const onote = {
  dataSourceManager: manager,
  setting: setting,
};

export default onote;
