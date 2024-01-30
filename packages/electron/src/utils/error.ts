/**
 * 自定义错误
 */

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = AssertionError.name;
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends Error {
  timeout: number;
  constructor(message: string, timeout: number) {
    super(message);
    this.name = TimeoutError.name;
    this.timeout = timeout;
  }
}
