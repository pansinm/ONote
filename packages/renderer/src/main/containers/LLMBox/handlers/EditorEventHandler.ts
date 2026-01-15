import { BaseHandler } from './BaseHandler';
import type {
  GetCurrentFileInfoResponse,
  AgentGetRootUriResponse,
  AgentGetActiveFileUriResponse,
} from '../types';
import stores from '/@/main/stores';
import { LLM_BOX_MESSAGE_TYPES } from '../../../../llmbox/utils/constants';

export class GetCurrentFileInfoHandler extends BaseHandler {
  async handle(data: undefined): Promise<GetCurrentFileInfoResponse> {
    const { fileUri, rootUri } = {
      fileUri: stores.activationStore.activeFileUri,
      rootUri: stores.activationStore.rootUri,
    };
    return { fileUri, rootUri };
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO;
  }
}

export class AgentGetRootUriHandler extends BaseHandler {
  async handle(data: undefined): Promise<AgentGetRootUriResponse> {
    return { rootUri: stores.activationStore.rootUri };
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_GET_ROOT_URI;
  }
}

export class AgentGetActiveFileUriHandler extends BaseHandler {
  async handle(data: undefined): Promise<AgentGetActiveFileUriResponse> {
    return { fileUri: stores.activationStore.activeFileUri };
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_GET_ACTIVE_FILE_URI;
  }
}
