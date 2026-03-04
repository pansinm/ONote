import * as monaco from 'monaco-editor';

// Mock the stores module that tools.ts imports
jest.mock('../../stores', () => {
  const mockGetOrCreateModel = jest.fn();
  const mockSave = jest.fn();

  return {
    __esModule: true,
    default: {
      get activationStore() {
        return { activeFileUri: '' };
      },
      get fileStore() {
        return {
          getOrCreateModel: mockGetOrCreateModel,
          save: mockSave,
        };
      },
      get settingStore() {
        return {};
      },
      get layoutStore() {
        return {};
      },
      get todoStore() {
        return {};
      },
      get fileListStore() {
        return { files: [] };
      },
      __mockGetOrCreateModel: mockGetOrCreateModel,
      __mockSave: mockSave,
    },
  };
});

import { TOOLS } from '../tools';
import stores from '../../stores';

// Get mock functions
const mockGetOrCreateModel = (stores as any).__mockGetOrCreateModel;
const mockSave = (stores as any).__mockSave;

describe('applyPatch tool', () => {
  const mockUri = 'file:///test/file.md';
  let mockModel: monaco.editor.ITextModel;
  const applyPatch = TOOLS.applyPatch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockModel = monaco.editor.createModel(
      'line 1\nline 2\nline 3\nline 4\nline 5',
      'markdown',
      monaco.Uri.parse(mockUri),
    );
    mockGetOrCreateModel.mockResolvedValue(mockModel);
    mockSave.mockResolvedValue(undefined);
  });

  afterEach(() => {
    mockModel?.dispose();
  });

  describe('single line replacement', () => {
    it('should replace a single line', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 2, startColumn: 1, endLine: 2, endColumn: 8, newText: 'new line 2' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nnew line 2\nline 3\nline 4\nline 5');
      expect(mockSave).toHaveBeenCalledWith(mockUri);
    });

    it('should replace multiple lines in one call', async () => {
      const params = {
        uri: mockUri,
        patches: [
          { startLine: 1, startColumn: 1, endLine: 1, endColumn: 7, newText: 'first' },
          { startLine: 5, startColumn: 1, endLine: 5, endColumn: 7, newText: 'last' },
        ],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 2 edit operation(s)');
      expect(mockModel.getValue()).toBe('first\nline 2\nline 3\nline 4\nlast');
    });
  });

  describe('multi-line replacement', () => {
    it('should replace multiple consecutive lines', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 2, startColumn: 1, endLine: 4, endColumn: 7, newText: 'replaced content' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nreplaced content\nline 5');
    });
  });

  describe('delete operation', () => {
    it('should delete a single line with empty newText', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 3, startColumn: 1, endLine: 4, endColumn: 1, newText: '' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nline 2\nline 4\nline 5');
    });

    it('should delete multiple consecutive lines', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 2, startColumn: 1, endLine: 5, endColumn: 1, newText: '' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nline 5');
    });
  });

  describe('insert operation', () => {
    it('should insert a line at the beginning', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 1, startColumn: 1, endLine: 1, endColumn: 7, newText: 'new first line\nline 1' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('new first line\nline 1\nline 2\nline 3\nline 4\nline 5');
    });

    it('should insert a line after a specific line', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 2, startColumn: 1, endLine: 2, endColumn: 7, newText: 'line 2\ninserted line' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nline 2\ninserted line\nline 3\nline 4\nline 5');
    });

    it('should insert a line at the end', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 5, startColumn: 1, endLine: 5, endColumn: 7, newText: 'line 5\nnew last line' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nline 2\nline 3\nline 4\nline 5\nnew last line');
    });
  });

  describe('partial line editing with columns', () => {
    it('should replace part of a line using startColumn and endColumn', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 2, startColumn: 1, endLine: 2, endColumn: 5, newText: 'NEW' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nNEW 2\nline 3\nline 4\nline 5');
    });

    it('should use default endColumn when not specified (end of line)', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 2, startColumn: 6, endLine: 2, newText: 'TWO' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nline TWO\nline 3\nline 4\nline 5');
    });
  });

  describe('cross-line editing', () => {
    it('should replace text spanning multiple lines with specific columns', async () => {
      const model = monaco.editor.createModel(
        'line 1 AAA\nline 2 BBB\nline 3 CCC\nline 4 DDD',
        'markdown',
        monaco.Uri.parse(mockUri),
      );
      mockGetOrCreateModel.mockResolvedValue(model);

      // Replace from line 2 column 6 (after 'line ') to line 3 column 7 (after 'line ')
      // This should replace '2 BBB\nline 3' with 'REPLACED'
      const params = {
        uri: mockUri,
        patches: [{ startLine: 2, startColumn: 6, endLine: 3, endColumn: 7, newText: 'REPLACED' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(model.getValue()).toBe('line 1 AAA\nline REPLACED CCC\nline 4 DDD');
      model.dispose();
    });
  });

  describe('mixed operations', () => {
    it('should apply multiple different edit operations in one call', async () => {
      const params = {
        uri: mockUri,
        patches: [
          { startLine: 2, startColumn: 1, endLine: 2, endColumn: 7, newText: 'MODIFIED' },
          { startLine: 4, startColumn: 1, endLine: 5, endColumn: 1, newText: '' },
          { startLine: 5, startColumn: 1, endLine: 5, endColumn: 7, newText: 'INSERTED' },
        ],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 3 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nMODIFIED\nline 3\nINSERTED');
    });
  });

  describe('error handling', () => {
    it('should throw error when getOrCreateModel fails', async () => {
      mockGetOrCreateModel.mockRejectedValue(new Error('File not found'));

      const params = {
        uri: mockUri,
        patches: [{ startLine: 1, startColumn: 1, endLine: 1, endColumn: 7, newText: 'test' }],
      };

      await expect(applyPatch.execute?.(params, {} as any)).rejects.toThrow('Failed to apply edits: File not found');
    });

    it('should throw error when save fails', async () => {
      mockSave.mockRejectedValue(new Error('Save failed'));

      const params = {
        uri: mockUri,
        patches: [{ startLine: 1, startColumn: 1, endLine: 1, endColumn: 7, newText: 'test' }],
      };

      await expect(applyPatch.execute?.(params, {} as any)).rejects.toThrow('Failed to apply edits: Save failed');
    });
  });

  describe('edge cases', () => {
    it('should handle empty patches array', async () => {
      const params = { uri: mockUri, patches: [] };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 0 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nline 2\nline 3\nline 4\nline 5');
    });

    it('should preserve empty lines', async () => {
      const modelWithEmptyLines = monaco.editor.createModel(
        'line 1\n\nline 3\n\nline 5',
        'markdown',
        monaco.Uri.parse(mockUri),
      );
      mockGetOrCreateModel.mockResolvedValue(modelWithEmptyLines);

      const params = {
        uri: mockUri,
        patches: [{ startLine: 3, startColumn: 1, endLine: 3, endColumn: 7, newText: 'modified' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(modelWithEmptyLines.getValue()).toBe('line 1\n\nmodified\n\nline 5');
      modelWithEmptyLines.dispose();
    });

    it('should handle replacement with text containing newlines', async () => {
      const params = {
        uri: mockUri,
        patches: [{ startLine: 3, startColumn: 1, endLine: 3, endColumn: 7, newText: 'line 3a\nline 3b\nline 3c' }],
      };
      const result = await applyPatch.execute?.(params, {} as any);

      expect(result).toBe('Successfully applied 1 edit operation(s)');
      expect(mockModel.getValue()).toBe('line 1\nline 2\nline 3a\nline 3b\nline 3c\nline 4\nline 5');
    });
  });
});
