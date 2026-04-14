import http from 'http';
import fs from 'fs';
import osPath from 'path';

/**
 * ONote REST API 客户端配置
 */
export interface ClientConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

/**
 * API 统一响应格式
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

const DEFAULT_CONFIG: ClientConfig = {
  host: 'localhost',
  port: 21221,
  username: 'webdav',
  password: 'webdav',
};

/**
 * 加载配置（优先级从高到低）：
 * 1. 环境变量 ONOTE_HOST / ONOTE_PORT / ONOTE_USER / ONOTE_PASS
 * 2. ~/.onote/credentials 文件
 * 3. 默认值 localhost:21221 / webdav:webdav
 */
export function loadConfig(): ClientConfig {
  let fileConfig: Partial<ClientConfig> = {};

  const credPath = osPath.join(
    process.env.HOME || process.env.USERPROFILE || '',
    '.onote',
    'credentials',
  );

  if (fs.existsSync(credPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    } catch {
      // 凭据文件损坏，忽略
    }
  }

  return {
    host: process.env.ONOTE_HOST || fileConfig.host || DEFAULT_CONFIG.host,
    port: parseInt(process.env.ONOTE_PORT || '', 10) || fileConfig.port || DEFAULT_CONFIG.port,
    username: process.env.ONOTE_USER || fileConfig.username || DEFAULT_CONFIG.username,
    password: process.env.ONOTE_PASS || fileConfig.password || DEFAULT_CONFIG.password,
  };
}

/**
 * 发送 HTTP 请求到 ONote REST API
 *
 * 不引入任何第三方依赖——Node 内置 http 模块足够。
 */
export function request<T = unknown>(
  method: string,
  path: string,
  config: ClientConfig,
  body?: unknown,
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;

    const options: http.RequestOptions = {
      hostname: config.host,
      port: config.port,
      path: `/api/v1${path}`,
      method,
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${config.username}:${config.password}`).toString('base64'),
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf-8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body) as ApiResponse<T>;
          resolve(parsed);
        } catch {
          reject(new Error(`Invalid JSON response: ${body.slice(0, 200)}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Failed to connect to ONote at ${config.host}:${config.port}. Is it running? (${err.message})`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout: ${config.host}:${config.port}`));
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

/**
 * 健康检查 — 试探 API 是否可用
 */
export async function healthCheck(config: ClientConfig): Promise<ApiResponse> {
  // 用 search（最轻量的 GET 请求）探测
  return request('GET', '/search?q=__ping__', config);
}
