import type { WebFrameMain } from 'electron';
import { BrowserWindow } from 'electron';
import { getPageUrl } from './utils';
import fs from 'fs/promises';

const getAllChildrenFrame = (frame: WebFrameMain) => {
  const children = [...frame.frames];
  frame.frames.forEach((f) => {
    children.push(...getAllChildrenFrame(f));
  });
  return children;
};

export function getAllFrames(win?: BrowserWindow): WebFrameMain[] {
  if (win) {
    const mainFrame = win.webContents.mainFrame;
    return [mainFrame, ...getAllChildrenFrame(mainFrame)];
  } else {
    return BrowserWindow.getAllWindows()
      .map((w) => getAllFrames(w))
      .flat(1);
  }
}

export function getMainFrame() {
  return getAllFrames().find((frame) => frame.url === getPageUrl('main'));
}

export function getPreviewerFrames() {
  return getAllFrames().filter(
    (frame) => frame.url === getPageUrl('previewer'),
  );
}

export async function injectJs(frame?: WebFrameMain, jsPath?: string) {
  if (!jsPath || !frame) {
    return;
  }
  const script = await fs.readFile(jsPath, 'utf-8');
  return frame.executeJavaScript(script);
}
