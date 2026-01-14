import { BaseHandler } from './BaseHandler';
import type {
  GetCurrentFileInfoResponse,
  AgentGetRootUriResponse,
  AgentGetActiveFileUriResponse,
} from '../types';
import type { Stores } from '/@/main/stores/types';
import { LLM_BOX_MESSAGE_TYPES } from '../../../../llmbox/constants/LLMBoxConstants';

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

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO;
  }
}

export class AgentGetRootUriHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: undefined): Promise<AgentGetRootUriResponse> {
    return { rootUri: this.stores.activationStore.rootUri };
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_GET_ROOT_URI;
  }
}

export class AgentGetActiveFileUriHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: undefined): Promise<AgentGetActiveFileUriResponse> {
    return { fileUri: this.stores.activationStore.activeFileUri };
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_GET_ACTIVE_FILE_URI;
  }
}
