import LocalBackend from './LocalBackend';

function createBackend(type: string, projectId: string) {
  switch (type) {
    case 'local':
    default:
      return new LocalBackend(projectId);
  }
}

export default createBackend;
