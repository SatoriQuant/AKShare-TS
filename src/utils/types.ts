/**
 * AKShare TypeScript - 类型定义
 */

/**
 * DataFrame 类型 - 类似 pandas DataFrame
 */
export interface DataFrame {
  columns: string[];
  data: any[][];
  index?: (string | number)[];
}

/**
 * 请求配置
 */
export interface RequestConfig {
  /** 请求头 */
  headers?: Record<string, string>;
  /** 查询参数 */
  params?: Record<string, any>;
  /** 请求体 */
  data?: any;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 代理配置 */
  proxy?: ProxyConfig;
  /** 重试次数 */
  retries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'arraybuffer' | 'blob';
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** 内容类型 */
  contentType?: string;
}

/**
 * 代理配置
 */
export interface ProxyConfig {
  host: string;
  port: number;
  protocol?: 'http' | 'https' | 'socks5';
  auth?: {
    username: string;
    password: string;
  };
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  /** 每页大小 */
  pageSize?: number;
  /** 最大页数 */
  maxPages?: number;
  /** 页间延迟（毫秒） */
  delay?: number;
}

/**
 * K线数据
 */
export interface KlineData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
  amplitude?: number;
  changePercent?: number;
  changeAmount?: number;
  turnover?: number;
}

/**
 * 股票基本信息
 */
export interface StockInfo {
  code: string;
  name: string;
  market?: string;
  industry?: string;
  listDate?: string;
  delistDate?: string;
}

/**
 * 基金净值数据
 */
export interface FundNavData {
  date: string;
  nav: number;       // 单位净值
  accNav: number;    // 累计净值
  dailyReturn?: number; // 日增长率
}

/**
 * 债券信息
 */
export interface BondInfo {
  code: string;
  name: string;
  issuer?: string;
  maturity?: string;
  couponRate?: number;
  faceValue?: number;
}

/**
 * 期货数据
 */
export interface FuturesData {
  symbol: string;
  name: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number;
  settlement?: number;
}

/**
 * 宏观经济数据
 */
export interface MacroData {
  date: string;
  value: number;
  indicator: string;
  unit?: string;
  country?: string;
}

/**
 * 汇率数据
 */
export interface ExchangeRateData {
  date: string;
  currency: string;
  rate: number;
  base?: string;
}

/**
 * 期权数据
 */
export interface OptionData {
  symbol: string;
  name: string;
  underlying: string;
  expiry: string;
  strike: number;
  type: 'call' | 'put';
  price: number;
  volume?: number;
  openInterest?: number;
  impliedVolatility?: number;
}

/**
 * API 响应
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 数据源配置
 */
export interface DataSourceConfig {
  /** 数据源名称 */
  name: string;
  /** 基础 URL */
  baseUrl: string;
  /** 默认请求头 */
  headers?: Record<string, string>;
  /** 默认超时 */
  timeout?: number;
}

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 配置选项
 */
export interface AkShareConfig {
  /** 日志级别 */
  logLevel?: LogLevel;
  /** 默认代理 */
  proxy?: ProxyConfig;
  /** 请求超时 */
  timeout?: number;
  /** 重试次数 */
  retries?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 缓存配置 */
  cache?: {
    enabled: boolean;
    ttl?: number; // 缓存时间（秒）
  };
}
