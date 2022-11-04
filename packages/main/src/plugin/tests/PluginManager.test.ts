import PluginManager, { PLUGIN_ROOT } from '../PluginManager';
import fs from 'fs/promises';
import path from 'path';

it('install plugin by url', async () => {
  const pluginDir = path.join(PLUGIN_ROOT, '@types/co');
  fs.rmdir(pluginDir).catch(() => {
    // ignore
  });
  await new PluginManager().install(
    'https://registry.npmmirror.com/@types/co/-/co-4.6.3.tgz',
  );
  await fs.access(pluginDir);
});
