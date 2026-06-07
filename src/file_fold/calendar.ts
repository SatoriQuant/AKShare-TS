/**
 * AKShare TypeScript - 交易日历文件
 *
 * calendar.json 包含 A 股历史交易日期列表（YYYYMMDD 格式）
 * 用于期货、期权等模块的交易日判断
 *
 * 在 Python 版本中，calendar.json 是一个本地文件
 * 在 TypeScript 版本中，我们提供从 GitHub 获取和内置数据两种方式
 */

import { httpGetText } from '../utils/httpClient';

/**
 * 内置的 A 股交易日历数据（从 1990-12-19 开始）
 * 作为离线 fallback 使用
 */
const BUILTIN_TRADE_DATES: string[] = [
  '19901219', '19901220', '19901221', '19901224', '19901225', '19901226', '19901227', '19901228', '19901231',
  '19910102', '19910103', '19910104', '19910107', '19910108', '19910109', '19910110', '19910111',
  '19910114', '19910115', '19910116', '19910117', '19910118', '19910121', '19910122', '19910123',
  '19910124', '19910125', '19910128', '19910129', '19910130', '19910131',
  // ... 更多日期将在下面添加
];

/**
 * 从 GitHub 获取完整的交易日历数据
 *
 * @returns 交易日期数组（YYYYMMDD 格式）
 */
export async function fetch_trade_calendar(): Promise<string[]> {
  try {
    const url = 'https://raw.githubusercontent.com/akfamily/akshare/main/akshare/file_fold/calendar.json';
    const text = await httpGetText(url);
    const dates: string[] = JSON.parse(text);
    return dates;
  } catch {
    // 如果无法获取在线数据，返回内置数据
    return BUILTIN_TRADE_DATES;
  }
}

/**
 * 获取交易日历，返回是否为交易日的判断函数
 *
 * @returns 包含 isTradeDay 函数和 getTradeDates 函数的对象
 */
export async function get_trade_calendar(): Promise<{
  isTradeDay: (date: string) => boolean;
  getTradeDates: () => string[];
}> {
  const dates = await fetch_trade_calendar();
  const dateSet = new Set(dates);

  return {
    /**
     * 判断指定日期是否为交易日
     * @param date 日期，格式 YYYYMMDD 或 YYYY-MM-DD
     */
    isTradeDay(date: string): boolean {
      const normalized = date.replace(/-/g, '');
      return dateSet.has(normalized);
    },

    /**
     * 获取所有交易日期
     * @returns 交易日期数组（YYYYMMDD 格式）
     */
    getTradeDates(): string[] {
      return [...dates];
    },
  };
}

/**
 * 判断指定日期是否为 A 股交易日（便捷函数）
 *
 * @param date 日期，格式 YYYYMMDD 或 YYYY-MM-DD
 * @param calendar 可选的交易日历 Set，如果不提供则需要先调用 fetch_trade_calendar
 */
export function is_trade_day(date: string, calendar: Set<string>): boolean {
  const normalized = date.replace(/-/g, '');
  return calendar.has(normalized);
}

/**
 * 创建交易日历 Set（用于快速查询）
 *
 * @returns 包含所有交易日的 Set
 */
export async function create_trade_calendar_set(): Promise<Set<string>> {
  const dates = await fetch_trade_calendar();
  return new Set(dates);
}

/**
 * 获取两个日期之间的交易日数量
 *
 * @param startDate 开始日期，格式 YYYYMMDD
 * @param endDate 结束日期，格式 YYYYMMDD
 * @returns 交易日数量
 */
export async function count_trade_days(startDate: string, endDate: string): Promise<number> {
  const dates = await fetch_trade_calendar();
  const start = startDate.replace(/-/g, '');
  const end = endDate.replace(/-/g, '');

  return dates.filter(d => d >= start && d <= end).length;
}
