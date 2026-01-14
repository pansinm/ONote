import { z } from 'zod';
import type { Tool } from '../core/types';

export const readFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
});

export const writeFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  content: z.string(),
});

export const replaceFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  operations: z.array(z.object({
    mode: z.enum(['string', 'regex', 'line_range', 'line_number']),
    search: z.string().min(1, 'Search content cannot be empty'),
    replace: z.string(),
    replaceAll: z.boolean().optional(),
    caseSensitive: z.boolean().optional(),
    lineStart: z.number().optional(),
    lineEnd: z.number().optional(),
  })),
  preview: z.boolean().optional(),
});

export const createFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  content: z.string().optional().default(''),
});

export const deleteFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
});

export const listFilesSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
});

export const searchFilesSchema = z.object({
  rootUri: z.string().min(1, 'Root URI is required'),
  keywords: z.string().min(1, 'Keywords is required'),
});

export const searchInFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  pattern: z.string().min(1, 'Pattern is required'),
});

export const addTodoSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  parentId: z.string().optional(),
});

export const updateTodoSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

export const deleteTodoSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
});

export const listTodosSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
});

export type ReadFileParams = z.infer<typeof readFileSchema>;
export type WriteFileParams = z.infer<typeof writeFileSchema>;
export type ReplaceFileParams = z.infer<typeof replaceFileSchema>;
export type CreateFileParams = z.infer<typeof createFileSchema>;
export type DeleteFileParams = z.infer<typeof deleteFileSchema>;
export type ListFilesParams = z.infer<typeof listFilesSchema>;
export type SearchFilesParams = z.infer<typeof searchFilesSchema>;
export type SearchInFileParams = z.infer<typeof searchInFileSchema>;
export type AddTodoParams = z.infer<typeof addTodoSchema>;
export type UpdateTodoParams = z.infer<typeof updateTodoSchema>;
export type DeleteTodoParams = z.infer<typeof deleteTodoSchema>;
export type ListTodosParams = z.infer<typeof listTodosSchema>;

export function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, unknown>
): T {
  const result = schema.safeParse(params);
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(', ');
    throw new Error(`Invalid parameters: ${errors}`);
  }
  return result.data;
}

export function createValidatedTool(
  tool: Tool,
  schema: z.ZodSchema<unknown>
): Tool {
  return {
    ...tool,
    executor: async (params) => {
      validateParams(schema, params);
      return tool.executor(params);
    },
  };
}

export function createValidatedFileTools(
  createTools: (channel: any) => Tool[],
  channel: any
): Tool[] {
  const tools = createTools(channel);
  const validationMap: Record<string, z.ZodSchema<unknown>> = {
    readFile: readFileSchema,
    writeFile: writeFileSchema,
    replaceFileContent: replaceFileSchema,
    createFile: createFileSchema,
    deleteFile: deleteFileSchema,
    listFiles: listFilesSchema,
    searchFiles: searchFilesSchema,
    searchInFile: searchInFileSchema,
  };

  return tools.map(tool => {
    const schema = validationMap[tool.name];
    if (schema) {
      return createValidatedTool(tool, schema);
    }
    return tool;
  });
}
