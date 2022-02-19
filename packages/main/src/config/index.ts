import Config from './Config';
import * as os from 'os';
import * as path from 'path';

export default new Config(path.resolve(os.homedir(), '.simmer.yaml'));
