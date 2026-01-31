// MessageChannel polyfill for jsdom environment
// jsdom 环境 MessageChannel 不可用，需要手动实现

interface MessageEventListener {
  (event: MessageEvent): void;
}

interface CloseEventListener {
  (): void;
}

class MessagePortImpl {
  onmessage: MessageEventListener | null = null;
  onmessageerror: MessageEventListener | null = null;
  private messageListeners: MessageEventListener[] = [];
  private closeListeners: CloseEventListener[] = [];
  private _started = false;
  private _closed = false;

  addEventListener(type: string, listener: any) {
    if (type === 'message') {
      this.messageListeners.push(listener);
    } else if (type === 'close') {
      this.closeListeners.push(listener);
    }
  }

  removeEventListener(type: string, listener: any) {
    if (type === 'message') {
      const index = this.messageListeners.indexOf(listener);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    } else if (type === 'close') {
      const index = this.closeListeners.indexOf(listener);
      if (index > -1) {
        this.closeListeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    // 简化实现，不需要实际分发事件
    return true;
  }

  postMessage(message: any) {
    if (this._closed) {
      return;
    }

    // 模拟异步消息传递
    setTimeout(() => {
      if (this._closed) {
        return;
      }

      const event = new MessageEvent('message', { data: message });

      // 触发 onmessage 回调
      if (this.onmessage) {
        this.onmessage(event);
      }

      // 触发所有消息监听器
      this.messageListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          // 忽略错误
        }
      });
    }, 0);
  }

  start() {
    this._started = true;
  }

  close() {
    if (this._closed) {
      return;
    }

    this._closed = true;
    this.messageListeners = [];
    this.onmessage = null;
    this.onmessageerror = null;

    // 触发 close 事件
    setTimeout(() => {
      this.closeListeners.forEach((listener) => {
        try {
          listener();
        } catch (e) {
          // 忽略错误
        }
      });
      this.closeListeners = [];
    }, 0);
  }
}

class MessageChannelImpl {
  readonly port1: MessagePortImpl;
  readonly port2: MessagePortImpl;

  constructor() {
    this.port1 = new MessagePortImpl();
    this.port2 = new MessagePortImpl();

    // 连接两个端口，让它们可以互相通信
    const port1 = this.port1;
    const port2 = this.port2;

    // 覆盖 port1 的 postMessage，让它向 port2 发送消息
    port1.postMessage = function (message: any) {
      if ((this as any)._closed) {
        return;
      }
      setTimeout(() => {
        if ((this as any)._closed) {
          return;
        }
        const event = new MessageEvent('message', { data: message });

        // 触发 port2 的消息监听器
        if (port2.onmessage) {
          port2.onmessage(event);
        }
        (port2 as any).messageListeners.forEach((listener: any) => {
          try {
            listener(event);
          } catch (e) {
            // 忽略错误
          }
        });
      }, 0);
    };

    // 覆盖 port2 的 postMessage，让它向 port1 发送消息
    port2.postMessage = function (message: any) {
      if ((this as any)._closed) {
        return;
      }
      setTimeout(() => {
        if ((this as any)._closed) {
          return;
        }
        const event = new MessageEvent('message', { data: message });

        // 触发 port1 的消息监听器
        if (port1.onmessage) {
          port1.onmessage(event);
        }
        (port1 as any).messageListeners.forEach((listener: any) => {
          try {
            listener(event);
          } catch (e) {
            // 忽略错误
          }
        });
      }, 0);
    };

    // 覆盖 close 方法，当一个端口关闭时，通知另一个端口
    const originalPort1Close = port1.close.bind(port1);
    port1.close = function () {
      if (!(this as any)._closed) {
        originalPort1Close();
        // 触发 port2 的 close 事件
        setTimeout(() => {
          (port2 as any).closeListeners.forEach((listener: any) => {
            try {
              listener();
            } catch (e) {
              // 忽略错误
            }
          });
        }, 0);
      }
    };

    const originalPort2Close = port2.close.bind(port2);
    port2.close = function () {
      if (!(this as any)._closed) {
        originalPort2Close();
        // 触发 port1 的 close 事件
        setTimeout(() => {
          (port1 as any).closeListeners.forEach((listener: any) => {
            try {
              listener();
            } catch (e) {
              // 忽略错误
            }
          });
        }, 0);
      }
    };
  }
}

// 将实现挂载到全局对象
if (typeof (global as any).MessageChannel === 'undefined') {
  (global as any).MessageChannel = MessageChannelImpl as any;
}

// 在 jsdom 环境中，window 可能没有 MessageChannel
if (typeof (window as any).MessageChannel === 'undefined') {
  (window as any).MessageChannel = MessageChannelImpl as any;
}

// 模拟 window.postMessage 来正确传递 port
// jsdom 的 postMessage 不会正确转移我们的 polyfill port 对象
const originalPostMessage = window.postMessage;
(window as any).originalPostMessage = originalPostMessage;

(window as any).postMessage = function (message: any, targetOriginOrOptions: any, transfer?: any[]) {
  // 如果有 transfer 参数且包含我们的 MessagePort
  if (transfer && transfer.length > 0) {
    const port = transfer[0] as any;
    if (port instanceof MessagePortImpl) {
      // 触发 message 事件，并将 port 放在 event.ports 中
      setTimeout(() => {
        const event = new MessageEvent('message', {
          data: message,
          ports: [port],
          origin: typeof targetOriginOrOptions === 'string' ? targetOriginOrOptions : '*',
          source: window,
        }) as any;
        // 手动调用所有 message 事件监听器
        const listeners = (window as any)._messageEventListeners || [];
        listeners.forEach((listener: any) => {
          try {
            if (typeof listener === 'function') {
              listener(event);
            } else {
              listener.handleEvent(event);
            }
          } catch (e) {
            // 忽略错误
          }
        });
      }, 0);
      return;
    }
  }
  // 否则使用原始实现
  return (originalPostMessage as any).call(this, message, targetOriginOrOptions, transfer);
};

// 保存 message 事件监听器
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

(window as any)._messageEventListeners = [];

window.addEventListener = function (type: any, listener: any, options?: any) {
  if (type === 'message') {
    (window as any)._messageEventListeners.push(listener);
  }
  return originalAddEventListener.call(this, type, listener, options);
};

window.removeEventListener = function (type: any, listener: any, options?: any) {
  if (type === 'message') {
    const index = (window as any)._messageEventListeners.indexOf(listener);
    if (index > -1) {
      (window as any)._messageEventListeners.splice(index, 1);
    }
  }
  return originalRemoveEventListener.call(this, type, listener, options);
};
