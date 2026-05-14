import React, { forwardRef, useImperativeHandle, useRef, useEffect, useCallback } from 'react';

export type PreviewerRef = {
  getWindow: () => Window;
};

const Previewer = forwardRef<PreviewerRef>((props, ref) => {
  const previewerRef = useRef<HTMLIFrameElement>(null);

  // ── 同步主题到 iframe ──
  const syncTheme = useCallback(() => {
    const win = previewerRef.current?.contentWindow;
    if (!win) return;
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    win.postMessage({ type: 'theme-change', theme }, '*');
  }, []);

  // iframe 加载完成后同步
  useEffect(() => {
    const iframe = previewerRef.current;
    if (!iframe) return;
    const onLoad = () => syncTheme();
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [syncTheme]);

  // 监听 data-theme 属性变化
  useEffect(() => {
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [syncTheme]);

  // 响应 iframe 的主题请求
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'theme-request') {
        syncTheme();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [syncTheme]);

  useImperativeHandle(
    ref,
    () => ({
      getWindow() {
        return previewerRef.current!.contentWindow!;
      },
    }),
    [],
  );

  return (
    <iframe
      ref={previewerRef}
      name="markdownPreviewer"
      className="fullfill preview-iframe"
      src="./previewer.html"
      allow={'*'}
    ></iframe>
  );
});

Previewer.displayName = 'Previewer';

export default Previewer;
