import type { WebFrameMain } from 'electron';
import setting from '../setting';

export function isChatBox(frame: WebFrameMain) {
  const url = setting.get('chatgpt.url');
  return frame.url.startsWith(url);
}

function injectJs(cls: string) {
  const messages = document.body;
  const findContentElement = (target: HTMLElement): HTMLElement | null => {
    if (target.className.startsWith(cls)) {
      return target;
    }
    if (!target.parentElement) {
      return null;
    }
    return findContentElement(target.parentElement);
  };

  messages?.addEventListener('mouseover', (e) => {
    const src = findContentElement(e.target as HTMLDivElement);
    if (!src) {
      return;
    }
    const html = src.innerHTML;
    let button = src.querySelector('button');
    if (!button) {
      button = document.createElement('button');
      button.innerText = '插入编辑器';
      button.addEventListener('click', (e) => {
        window.parent.postMessage(
          {
            type: 'ChatMessage',
            content: html,
          },
          '*',
        );
      });
      src.appendChild(button);
      button.addEventListener('mouseleave', () => button?.remove());
    }
  });
}

export function injectScript(frame: WebFrameMain) {
  const cls = setting.get('chatgpt.class');
  const script = `(${injectJs.toString()})("${cls}")`;
  frame.executeJavaScript(script);
}
