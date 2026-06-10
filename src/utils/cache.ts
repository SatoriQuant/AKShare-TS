/**
 * AKShare TypeScript - 缓存工具
 */

import { config } from './config';

/**
 * 缓存项
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * 内存缓存类
 */
class MemoryCache {
  private static instance: MemoryCache;
  private cache: Map<string, CacheItem<any>> = new Map();

  private constructor() {}

  /**
   * 获取缓存实例
   */
  static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  /**
   * 生成缓存键
   */
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  }

  /**
   * 检查缓存是否有效
   */
  private isValid(item: CacheItem<any>): boolean {
    const now = Date.now();
    return now - item.timestamp < item.ttl * 1000;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    if (!config.isCacheEnabled()) return;

    const cacheTTL = ttl || config.getCacheTTL();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: cacheTTL,
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    if (!config.isCacheEnabled()) return null;

    const item = this.cache.get(key);
    if (!item) return null;

    if (!this.isValid(item)) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    if (!config.isCacheEnabled()) return false;

    const item = this.cache.get(key);
    if (!item) return false;

    if (!this.isValid(item)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (!this.isValid(item)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 全局缓存实例
 */
export const cache = MemoryCache.getInstance();

/**
 * 缓存装饰器
 */
export function cached(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      const cachedResult = cache.get(key);

      if (cachedResult !== null) {
        return cachedResult;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result, ttl);
      return result;
    };

    return descriptor;
  };
}

/**
 * 带缓存的请求函数
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cachedResult = cache.get<T>(key);
  if (cachedResult !== null) {
    return cachedResult;
  }

  const result = await fetchFn();
  cache.set(key, result, ttl);
  return result;
}
