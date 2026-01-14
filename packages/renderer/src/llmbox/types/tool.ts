export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  enum?: string[];
  default?: unknown;
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, ToolParameter>;
  required?: string[];
  [key: string]: unknown;
}

export interface ToolArrayItemSchema {
  type: 'object';
  description?: string;
  properties: Record<string, ToolParameter>;
  required?: string[];
  [key: string]: unknown;
}

export interface ToolArrayParameter {
  type: 'array';
  description: string;
  items: ToolArrayItemSchema;
  [key: string]: unknown;
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
  executor: (params: Record<string, unknown>) => Promise<unknown>;
  metadata?: {
    category: 'file' | 'search' | 'custom';
    permission: 'read' | 'write';
    dangerous?: boolean;
  };
}
