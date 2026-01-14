import { ConfigManager } from '../ConfigManager';
import { AgentConfig } from '../types';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let mockChannel: any;

  beforeEach(() => {
    const config: AgentConfig = {
      apiKey: 'test-api-key',
      model: 'gpt-4',
      apiBase: 'https://api.openai.com/v1',
      rootUri: 'file:///test',
    };

    configManager = new ConfigManager(config);

    mockChannel = {
      send: jest.fn(),
    };
  });

  describe('基本功能', () => {
    it('getConfig 返回初始配置', () => {
      const config = configManager.getConfig();

      expect(config.apiKey).toBe('test-api-key');
      expect(config.model).toBe('gpt-4');
      expect(config.apiBase).toBe('https://api.openai.com/v1');
    });

    it('updateRootUri 正确更新根 URI', () => {
      configManager.updateRootUri('file:///new/path');

      const config = configManager.getConfig();
      expect(config.rootUri).toBe('file:///new/path');
    });

    it('setChannel 正确设置 channel', () => {
      configManager.setChannel(mockChannel);

      expect((configManager as any).channel).toBe(mockChannel);
    });
  });

  describe('fetchLLMConfig', () => {
    it('未设置 channel 时返回默认配置', async () => {
      const result = await configManager.fetchLLMConfig();

      expect(result).toEqual({
        apiKey: 'test-api-key',
        model: 'gpt-4',
        apiBase: 'https://api.openai.com/v1',
      });
    });

    it('channel 返回错误时返回 null', async () => {
      mockChannel.send.mockResolvedValue({ error: 'Failed to fetch config' });
      configManager.setChannel(mockChannel);

      const result = await configManager.fetchLLMConfig();

      expect(result).toBeNull();
    });

    it('channel 返回完整配置时返回配置', async () => {
      mockChannel.send.mockResolvedValue({
        apiKey: 'new-api-key',
        model: 'gpt-4o',
        apiBase: 'https://api.custom.com/v1',
      });
      configManager.setChannel(mockChannel);

      const result = await configManager.fetchLLMConfig();

      expect(result).toEqual({
        apiKey: 'new-api-key',
        model: 'gpt-4o',
        apiBase: 'https://api.custom.com/v1',
      });
    });

    it('channel 部分返回时合并配置', async () => {
      mockChannel.send.mockResolvedValue({
        apiKey: 'new-api-key',
      });
      configManager.setChannel(mockChannel);

      const result = await configManager.fetchLLMConfig();

      expect(result).toEqual({
        apiKey: 'new-api-key',
        model: 'gpt-4',
        apiBase: 'https://api.openai.com/v1',
      });
    });

    it('channel 抛出异常时返回 null', async () => {
      mockChannel.send.mockRejectedValue(new Error('Network error'));
      configManager.setChannel(mockChannel);

      const result = await configManager.fetchLLMConfig();

      expect(result).toBeNull();
    });
  });
});
