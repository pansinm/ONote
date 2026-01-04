/**
 * 环境配置验证和管理模块
 *
 * 负责加载、验证和管理应用环境变量
 */

import dotenv from 'dotenv';
import path from 'path';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('EnvConfig');

// 加载 .env 文件
const envPath = path.join(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  logger.warn('.env file not found or invalid, using defaults');
}

/**
 * 环境变量配置接口
 */
export interface EnvConfig {
  // 应用配置
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  PORT: number;

  // OpenAI API
  OPENAI_API_KEY?: string;
  OPENAI_API_BASE_URL?: string;
  OPENAI_MODEL?: string;

  // 数据存储
  DEFAULT_NOTE_DIR: string;
  BACKUP_DIR: string;
  AUTOSAVE_INTERVAL: number;

  // WebDAV
  WEBDAV_ENABLED: boolean;
  WEBDAV_PORT: number;
  WEBDAV_USERNAME?: string;
  WEBDAV_PASSWORD?: string;

  // 更新
  AUTO_UPDATE_ENABLED: boolean;
  UPDATE_CHECK_INTERVAL: number;

  // 调试
  DEVTOOLS_ENABLED: boolean;
  PERFORMANCE_MONITORING: boolean;
  DEBUG_MODE: boolean;

  // 安全
  CSP_ENABLED: boolean;
  ALLOW_REMOTE_RESOURCES: boolean;

  // 插件
  PLUGIN_DIR: string;
  ALLOW_THIRD_PARTY_PLUGINS: boolean;
}

/**
 * 验证函数类型
 */
type Validator<T> = (value: string) => T;

/**
 * 验证器集合
 */
const validators = {
  string: (value: string): string => value,
  number: (value: string): number => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return num;
  },
  boolean: (value: string): boolean => {
    return value.toLowerCase() === 'true';
  },
  enum: <T extends string>(...values: T[]): Validator<T> => {
    return (value: string): T => {
      if (!values.includes(value as T)) {
        throw new Error(`Invalid value: ${value}, must be one of: ${values.join(', ')}`);
      }
      return value as T;
    };
  },
  url: (value: string): string => {
    try {
      new URL(value);
      return value;
    } catch {
      throw new Error(`Invalid URL: ${value}`);
    }
  },
  optional: <T>(validator: Validator<T>): Validator<T | undefined> => {
    return (value: string): T | undefined => {
      if (!value || value.trim() === '') {
        return undefined;
      }
      return validator(value);
    };
  },
};

/**
 * 获取环境变量或使用默认值
 */
function getEnv<T>(
  key: string,
  validator: Validator<T>,
  defaultValue: T
): T {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    return defaultValue;
  }

  try {
    return validator(value);
  } catch (error) {
    logger.warn(`Warning: Invalid ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }
}

/**
 * 解析波浪号路径
 */
function expandHomeDir(filePath: string): string {
  if (filePath.startsWith('~/')) {
    return path.join(process.env.HOME || process.env.USERPROFILE || '', filePath.slice(2));
  }
  return filePath;
}

/**
 * 加载并验证环境配置
 */
export function loadConfig(): EnvConfig {
  return {
    // 应用配置
    NODE_ENV: getEnv(
      'NODE_ENV',
      validators.enum('development', 'production', 'test'),
      'development'
    ),
    LOG_LEVEL: getEnv(
      'LOG_LEVEL',
      validators.enum('debug', 'info', 'warn', 'error'),
      'info'
    ),
    PORT: getEnv('PORT', validators.number, 8080),

    // OpenAI API
    OPENAI_API_KEY: getEnv('OPENAI_API_KEY', validators.optional(validators.string), undefined),
    OPENAI_API_BASE_URL: getEnv('OPENAI_API_BASE_URL', validators.optional(validators.url), undefined),
    OPENAI_MODEL: getEnv('OPENAI_MODEL', validators.optional(validators.string), undefined),

    // 数据存储
    DEFAULT_NOTE_DIR: expandHomeDir(
      getEnv('DEFAULT_NOTE_DIR', validators.string, '~/Documents/ONote')
    ),
    BACKUP_DIR: expandHomeDir(
      getEnv('BACKUP_DIR', validators.string, '~/Documents/ONoteBackup')
    ),
    AUTOSAVE_INTERVAL: getEnv('AUTOSAVE_INTERVAL', validators.number, 5000),

    // WebDAV
    WEBDAV_ENABLED: getEnv('WEBDAV_ENABLED', validators.boolean, false),
    WEBDAV_PORT: getEnv('WEBDAV_PORT', validators.number, 8080),
    WEBDAV_USERNAME: getEnv('WEBDAV_USERNAME', validators.optional(validators.string), undefined),
    WEBDAV_PASSWORD: getEnv('WEBDAV_PASSWORD', validators.optional(validators.string), undefined),

    // 更新
    AUTO_UPDATE_ENABLED: getEnv('AUTO_UPDATE_ENABLED', validators.boolean, true),
    UPDATE_CHECK_INTERVAL: getEnv('UPDATE_CHECK_INTERVAL', validators.number, 24),

    // 调试
    DEVTOOLS_ENABLED: getEnv('DEVTOOLS_ENABLED', validators.boolean, true),
    PERFORMANCE_MONITORING: getEnv('PERFORMANCE_MONITORING', validators.boolean, false),
    DEBUG_MODE: getEnv('DEBUG_MODE', validators.boolean, false),

    // 安全
    CSP_ENABLED: getEnv('CSP_ENABLED', validators.boolean, true),
    ALLOW_REMOTE_RESOURCES: getEnv('ALLOW_REMOTE_RESOURCES', validators.boolean, false),

    // 插件
    PLUGIN_DIR: expandHomeDir(
      getEnv('PLUGIN_DIR', validators.string, '~/.onote/plugins')
    ),
    ALLOW_THIRD_PARTY_PLUGINS: getEnv('ALLOW_THIRD_PARTY_PLUGINS', validators.boolean, true),
  };
}

/**
 * 配置单例
 */
let config: EnvConfig | null = null;

/**
 * 获取配置实例
 */
export function getConfig(): EnvConfig {
  if (!config) {
    config = loadConfig();
  }
  return config;
}

/**
 * 重新加载配置（用于测试）
 */
export function reloadConfig(): EnvConfig {
  config = loadConfig();
  return config;
}

/**
 * 验证必需的配置
 */
export function validateRequiredConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getConfig();

  // 检查关键配置
  if (config.WEBDAV_ENABLED && (!config.WEBDAV_USERNAME || !config.WEBDAV_PASSWORD)) {
    errors.push('WebDAV is enabled but username or password is missing');
  }

  // 检查 OpenAI 配置（如果使用 LLM 功能）
  // 注意：这里只是警告，不是错误，因为 LLM 功能是可选的
  if (!config.OPENAI_API_KEY) {
    logger.warn('Warning: OPENAI_API_KEY not set, LLM features will be disabled');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// 导出默认配置实例
export default getConfig();
