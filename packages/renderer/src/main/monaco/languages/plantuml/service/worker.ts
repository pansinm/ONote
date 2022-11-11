import PumlFile from './PumlFile';
import stdlib from './stdlib';

stdlib.resolve();
class PumlWorker {
  includes(prefix: string) {
    return stdlib.resolve().then((items) => {
      return items.filter((item) => {
        return item.path.includes(prefix);
      });
    });
  }

  arg(content: string, name: string, range: any) {
    return new PumlFile(content).arguments(name, range);
  }

  suggest(content: string, range: any) {
    return new PumlFile(content).suggestions(range);
  }

  callable(content: string, name: string) {
    return new PumlFile(content).queryCallable(name);
  }
}

const pumlWorker = new PumlWorker();
async function rpc(data: { id: string; type: string; params: any[] }) {
  try {
    const res = await (pumlWorker as any)[data.type](...data.params);
    self.postMessage({
      id: data.id,
      res,
    });
  } catch (err) {
    self.postMessage({
      id: data.id,
      error: JSON.stringify(err),
    });
  }
}

let init = false;

const initialize = () => {
  if (init) {
    return;
  }
  self.onmessage = function (event) {
    rpc(event.data);
  };
  init = true;
};

self.onmessage = function (event) {
  initialize();
};
