/**
 * AKShare TypeScript - 日志工具
 */

import { LogLevel } from './types';
import { config } from './config';

/**
 * 日志级别优先级
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * 日志颜色
 */
const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // 青色
  info: '\x1b[32m',  // 绿色
  warn: '\x1b[33m',  // 黄色
  error: '\x1b[31m', // 红色
};

const RESET_COLOR = '\x1b[0m';

/**
 * 日志类
 */
class Logger {
  private static instance: Logger;
  private level: LogLevel;

  private constructor() {
    this.level = config.getLogLevel();
  }

  /**
   * 获取日志实例
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 更新日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 检查是否应该输出日志
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level];
    const prefix = `${color}[${timestamp}] [${level.toUpperCase()}]${RESET_COLOR}`;
    return `${prefix} ${message}`;
  }

  /**
   * 输出调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  /**
   * 输出信息日志
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  /**
   * 输出警告日志
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  /**
   * 输出错误日志
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }
}

/**
 * 全局日志实例
 */
export const logger = Logger.getInstance();

/**
 * 设置日志级别
 */
export function setLogLevel(level: LogLevel): void {
  logger.setLevel(level);
}
