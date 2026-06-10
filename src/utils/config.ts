/**
 * AKShare TypeScript - 配置管理
 */

import { AkShareConfig, ProxyConfig, LogLevel } from './types';

/**
 * 全局配置单例
 */
class Config {
  private static instance: Config;
  private config: AkShareConfig;

  private constructor() {
    this.config = {
      logLevel: 'info',
      timeout: 30000,
      retries: 3,
      headers: {},
      cache: {
        enabled: false,
        ttl: 300,
      },
    };
  }

  /**
   * 获取配置实例
   */
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * 更新配置
   */
  update(config: Partial<AkShareConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * 获取配置
   */
  get(): AkShareConfig {
    return { ...this.config };
  }

  /**
   * 获取日志级别
   */
  getLogLevel(): LogLevel {
    return this.config.logLevel || 'info';
  }

  /**
   * 获取代理配置
   */
  getProxy(): ProxyConfig | undefined {
    return this.config.proxy;
  }

  /**
   * 设置代理
   */
  setProxy(proxy: ProxyConfig | undefined): void {
    this.config.proxy = proxy;
  }

  /**
   * 获取超时时间
   */
  getTimeout(): number {
    return this.config.timeout || 30000;
  }

  /**
   * 获取重试次数
   */
  getRetries(): number {
    return this.config.retries || 3;
  }

  /**
   * 获取自定义请求头
   */
  getHeaders(): Record<string, string> {
    return this.config.headers || {};
  }

  /**
   * 是否启用缓存
   */
  isCacheEnabled(): boolean {
    return this.config.cache?.enabled ?? false;
  }

  /**
   * 获取缓存 TTL
   */
  getCacheTTL(): number {
    return this.config.cache?.ttl ?? 300;
  }
}

/**
 * 全局配置实例
 */
export const config = Config.getInstance();

/**
 * 初始化配置
 */
export function initConfig(akshareConfig?: Partial<AkShareConfig>): void {
  if (akshareConfig) {
    config.update(akshareConfig);
  }
}

/**
 * 设置代理
 */
export function setProxy(proxy: ProxyConfig | undefined): void {
  config.setProxy(proxy);
}

/**
 * 获取当前配置
 */
export function getConfig(): AkShareConfig {
  return config.get();
}
