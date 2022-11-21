import type { WebFrameMain } from 'electron';
import { manager } from '../dataSource';
import setting from '../setting';

const onote = {
  dataSourceManager: manager,
  setting: setting,
};

export default onote;
