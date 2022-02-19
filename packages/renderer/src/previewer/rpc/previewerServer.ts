import Server from '/@/rpc/Server';

const previewerServer = new Server();

previewerServer.handle(
  'renderMarkdown',
  async (uri: string, content: string) => {
    const event = new CustomEvent<{ uri: string; content: string }>(
      'content-changed',
      {
        detail: {
          uri,
          content,
        },
      },
    );
    document.dispatchEvent(event);
  },
);

export default previewerServer;
