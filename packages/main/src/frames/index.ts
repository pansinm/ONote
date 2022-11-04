import type { WebFrameMain } from 'electron';

type FrameCallback = (frame: WebFrameMain) => void;
class Frames {
  listeners: FrameCallback[] = [];

  onLoaded(callback: FrameCallback) {
    this.listeners.push(callback);
  }
}

export default new Frames();
