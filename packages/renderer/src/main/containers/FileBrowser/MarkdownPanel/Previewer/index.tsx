import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import Client from '/@/rpc/Client';

export type PreviewerRef = {
  getRPCClient: () => Client;
  getWindow: () => Window;
};

const Previewer = forwardRef<PreviewerRef>((props, ref) => {
  const previewerRef = useRef<HTMLIFrameElement>(null);
  const previewerRPCClientRef = useRef<Client>();

  useEffect(() => {
    let previewerRPCClient: Client;
    if (previewerRef.current?.contentWindow) {
      previewerRPCClient = new Client(previewerRef.current.contentWindow);
      previewerRPCClientRef.current = previewerRPCClient;
    }
    return () => {
      previewerRPCClient && previewerRPCClient.dispose();
    };
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        getWindow() {
          return previewerRef.current!.contentWindow!;
        },
        getRPCClient() {
          return previewerRPCClientRef.current!;
        },
      };
    },
    [],
  );

  return (
    <iframe
      ref={previewerRef}
      className="fullfill"
      src="./previewer.html"
      //   sandbox="true"
      allow={'*'}
    ></iframe>
  );
});

Previewer.displayName = 'Previewer';

export default Previewer;
