/**
 * AKShare TypeScript - 错误处理
 */

/**
 * AKShare 基础异常类
 */
export class AkShareError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AkShareError';
  }
}

/**
 * API 错误 - HTTP 请求失败
 */
export class APIError extends AkShareError {
  statusCode: number;
  url?: string;

  constructor(message: string, statusCode: number, url?: string) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.url = url;
  }
}

/**
 * 数据解析错误
 */
export class DataParsingError extends AkShareError {
  rawData?: any;

  constructor(message: string, rawData?: any) {
    super(message);
    this.name = 'DataParsingError';
    this.rawData = rawData;
  }
}

/**
 * 参数错误
 */
export class InvalidParameterError extends AkShareError {
  parameter?: string;

  constructor(message: string, parameter?: string) {
    super(message);
    this.name = 'InvalidParameterError';
    this.parameter = parameter;
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AkShareError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * 频率限制错误
 */
export class RateLimitError extends AkShareError {
  retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends AkShareError {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * 数据源错误
 */
export class DataSourceError extends AkShareError {
  source: string;

  constructor(message: string, source: string) {
    super(message);
    this.name = 'DataSourceError';
    this.source = source;
  }
}
