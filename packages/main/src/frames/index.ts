import type { WebFrameMain } from 'electron';
import type { ONote } from '@sinm/onote-plugin';
import fs from 'fs/promises';

type FrameCallback = (frame: WebFrameMain) => void;

type IFrames = ONote['frames'];
class Frames implements IFrames {
  injectJs(frame: WebFrameMain, jsPath: string): void {
    fs.readFile(jsPath, 'utf-8').then((js) => {
      return frame.executeJavaScript(js);
    });
  }

  listeners: FrameCallback[] = [];

  onLoaded(callback: FrameCallback) {
    this.listeners.push(callback);
  }
}

export default new Frames();
