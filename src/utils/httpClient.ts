/**
 * AKShare TypeScript - HTTP 客户端
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestConfig, ProxyConfig } from './types';
import {
  APIError,
  NetworkError,
  RateLimitError,
  TimeoutError,
  DataParsingError
} from './errors';

/**
 * 默认请求头
 */
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate',
};

/**
 * HTTP 客户端类
 */
export class HttpClient {
  private client: AxiosInstance;
  private retries: number;
  private retryDelay: number;

  constructor(config?: RequestConfig) {
    this.retries = config?.retries ?? 3;
    this.retryDelay = config?.retryDelay ?? 1000;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        ...DEFAULT_HEADERS,
        ...config?.headers,
      },
      timeout: config?.timeout ?? 30000,
    };

    // 配置代理
    if (config?.proxy) {
      axiosConfig.proxy = this.formatProxy(config.proxy);
    }

    this.client = axios.create(axiosConfig);
  }

  /**
   * 格式化代理配置
   */
  private formatProxy(proxy: ProxyConfig): AxiosRequestConfig['proxy'] {
    return {
      host: proxy.host,
      port: proxy.port,
      protocol: proxy.protocol || 'http',
      ...(proxy.auth && {
        auth: {
          username: proxy.auth.username,
          password: proxy.auth.password,
        },
      }),
    };
  }

  /**
   * 带重试的请求
   */
  private async requestWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = this.retries
  ): Promise<AxiosResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;

        // 判断是否需要重试
        if (attempt < retries) {
          const shouldRetry = this.shouldRetry(error);
          if (shouldRetry) {
            const delay = this.calculateDelay(attempt);
            await this.sleep(delay);
            continue;
          }
        }

        // 不重试或重试次数用完，抛出错误
        throw this.handleError(error);
      }
    }

    throw lastError || new NetworkError('请求失败');
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    // 网络错误或超时应该重试
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // 5xx 错误应该重试
    if (error.response?.status >= 500) {
      return true;
    }

    // 429 频率限制应该重试
    if (error.response?.status === 429) {
      return true;
    }

    // 连接错误应该重试
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      return true;
    }

    return false;
  }

  /**
   * 计算重试延迟（指数退避）
   */
  private calculateDelay(attempt: number): number {
    return this.retryDelay * Math.pow(2, attempt);
  }

  /**
   * 休眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 处理错误
   */
  private handleError(error: any): Error {
    if (error.response) {
      const { status, statusText } = error.response;

      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        return new RateLimitError(
          `请求频率过高，请稍后重试`,
          retryAfter ? parseInt(retryAfter) : undefined
        );
      }

      return new APIError(
        `HTTP ${status}: ${statusText}`,
        status,
        error.config?.url
      );
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new TimeoutError('请求超时');
    }

    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      return new NetworkError('网络连接失败');
    }

    return new NetworkError(error.message || '网络请求失败');
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.requestWithRetry<T>(
      () => this.client.get<T>(url, {
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout,
        responseType: config?.responseType ?? 'json',
      })
    );
    return response.data;
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.requestWithRetry<T>(
      () => this.client.post<T>(url, data, {
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout,
        responseType: config?.responseType ?? 'json',
      })
    );
    return response.data;
  }

  /**
   * 获取原始响应（用于需要解析 HTML 等场景）
   */
  async getRaw(url: string, config?: RequestConfig): Promise<AxiosResponse> {
    return this.requestWithRetry(
      () => this.client.get(url, {
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout,
        responseType: config?.responseType ?? 'text',
      })
    );
  }

  /**
   * 获取文本响应
   */
  async getText(url: string, config?: RequestConfig): Promise<string> {
    const response = await this.getRaw(url, config);
    return response.data as string;
  }

  /**
   * 获取 JSON 响应
   */
  async getJson<T = any>(url: string, config?: RequestConfig): Promise<T> {
    try {
      return await this.get<T>(url, config);
    } catch (error: any) {
      if (error instanceof DataParsingError) {
        throw error;
      }
      throw new DataParsingError('JSON 解析失败', error.message);
    }
  }
}

/**
 * 创建默认 HTTP 客户端实例
 */
export const defaultHttpClient = new HttpClient();

/**
 * 便捷的 GET 请求函数
 */
export async function httpGet<T = any>(url: string, config?: RequestConfig): Promise<T> {
  return defaultHttpClient.get<T>(url, config);
}

/**
 * 便捷的 POST 请求函数
 */
export async function httpPost<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
  return defaultHttpClient.post<T>(url, data, config);
}

/**
 * 便捷的文本请求函数
 */
export async function httpGetText(url: string, config?: RequestConfig): Promise<string> {
  return defaultHttpClient.getText(url, config);
}

/**
 * 便捷的 GBK 编码文本请求函数
 * 用于 THS 等使用 GBK 编码的网站
 */
export async function httpGetTextGbk(url: string, config?: RequestConfig): Promise<string> {
  const axios = (await import('axios')).default;
  const response = await axios.get(url, {
    params: config?.params,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      ...config?.headers,
    },
    responseType: 'arraybuffer',
    timeout: config?.timeout ?? 30000,
  });
  const buffer = response.data as ArrayBuffer;
  const decoder = new TextDecoder('gbk');
  return decoder.decode(buffer);
}

/**
 * 便捷的 JSON 请求函数
 */
export async function httpGetJson<T = any>(url: string, config?: RequestConfig): Promise<T> {
  return defaultHttpClient.getJson<T>(url, config);
}
