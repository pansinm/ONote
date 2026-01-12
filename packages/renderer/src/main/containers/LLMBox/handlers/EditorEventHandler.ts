import { BaseHandler } from './BaseHandler';
import type {
  GetCurrentFileInfoResponse,
  AgentGetRootUriResponse,
  AgentGetActiveFileUriResponse,
} from '../types';
import type { Stores } from '/@/main/stores/types';

export class GetCurrentFileInfoHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: undefined): Promise<GetCurrentFileInfoResponse> {
    const { fileUri, rootUri } = {
      fileUri: this.stores.activationStore.activeFileUri,
      rootUri: this.stores.activationStore.rootUri,
    };
    return { fileUri, rootUri };
  }
}

export class AgentGetRootUriHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: undefined): Promise<AgentGetRootUriResponse> {
    return { rootUri: this.stores.activationStore.rootUri };
  }
}

export class AgentGetActiveFileUriHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: undefined): Promise<AgentGetActiveFileUriResponse> {
    return { fileUri: this.stores.activationStore.activeFileUri };
  }
}
