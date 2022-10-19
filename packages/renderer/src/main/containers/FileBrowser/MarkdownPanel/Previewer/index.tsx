import React, { forwardRef, useImperativeHandle, useRef } from 'react';

export type PreviewerRef = {
  getWindow: () => Window;
};

const Previewer = forwardRef<PreviewerRef>((props, ref) => {
  const previewerRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        getWindow() {
          return previewerRef.current!.contentWindow!;
        },
      };
    },
    [],
  );

  return (
    <iframe
      ref={previewerRef}
      name="markdownPreviewer"
      className="fullfill"
      src="./previewer.html"
      //   sandbox="true"
      allow={'*'}
    ></iframe>
  );
});

Previewer.displayName = 'Previewer';

export default Previewer;
