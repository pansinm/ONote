import { manager } from '../dataSource';
import frames from '../frames';

const onote = {
  dataSource: manager,
  frames: frames as Pick<typeof frames, 'onLoaded'>,
};

export default onote;
