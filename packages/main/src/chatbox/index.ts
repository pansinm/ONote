import type { WebFrameMain } from 'electron';

export function isChatBox(frame: WebFrameMain) {
  return frame.url.startsWith('https://chat.chatbot.sex/chat/');
}

function injectJs() {
  const messages = document.querySelector('#messages');
  console.log('.....', messages);

  const findContentElement = (target: HTMLElement): HTMLElement | null => {
    if (target.classList.contains('content')) {
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
    }
  });

  messages?.addEventListener('mouseout', (e) => {
    const src = findContentElement(e.target as HTMLDivElement);
    if (!src) {
      return;
    }
    const button = src.querySelector('button');
    if (button) {
      button.remove();
    }
  });
}

export function injectScript(frame: WebFrameMain) {
  const script = `(${injectJs.toString()})()`;
  frame.executeJavaScript(script);
}
