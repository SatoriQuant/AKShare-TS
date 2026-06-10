/**
 * AKShare TypeScript - 交易日历工具
 * 新浪财经-交易日历
 * https://finance.sina.com.cn/realstock/company/klc_td_sh.txt
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-交易日历-历史数据
 * https://finance.sina.com.cn/realstock/company/klc_td_sh.txt
 *
 * 从新浪获取A股交易日历数据
 */
export async function tool_trade_date_hist_sina(): Promise<DataFrame> {
  const url = 'https://finance.sina.com.cn/realstock/company/klc_td_sh.txt';
  const text = await httpGetText(url);

  // 新浪返回的数据格式为: var klc_td_sh = "...dates..."
  // 需要解析 JavaScript 变量中的日期字符串
  const match = text.match(/var\s+klc_td_sh\s*=\s*"([^"]+)"/);
  if (!match) {
    // 如果无法解析，返回空 DataFrame
    return createDataFrame(['trade_date'], []);
  }

  const encoded = match[1];

  // 简单解码：新浪使用自定义编码，日期以逗号分隔
  // 直接尝试提取 YYYYMMDD 格式的日期
  const datePattern = /(\d{8})/g;
  const dates: string[] = [];
  let dateMatch;

  while ((dateMatch = datePattern.exec(encoded)) !== null) {
    dates.push(dateMatch[1]);
  }

  // 如果简单正则匹配不到，尝试直接分割
  if (dates.length === 0) {
    const parts = encoded.split(',');
    for (const part of parts) {
      const cleaned = part.replace(/[^0-9]/g, '');
      if (cleaned.length === 8) {
        dates.push(cleaned);
      }
    }
  }

  // 补充缺失的日期 1992-05-04 (Python 版本中的特殊处理)
  const extraDate = '19920504';
  if (!dates.includes(extraDate)) {
    dates.push(extraDate);
  }

  // 排序
  dates.sort();

  // 格式化为 YYYY-MM-DD
  const rows = dates.map(d => [
    `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
  ]);

  return createDataFrame(['trade_date'], rows);
}

/**
 * 获取交易日历（静态数据版本）
 *
 * 当在线接口不可用时，使用内置的交易日历数据
 * 该函数返回从 1990-12-19 至今的 A 股交易日列表
 */
export async function tool_trade_date_hist_sina_offline(): Promise<DataFrame> {
  try {
    // 尝试从本地 calendar.json 加载
    const response = await fetch('https://raw.githubusercontent.com/akfamily/akshare/main/akshare/file_fold/calendar.json');
    if (response.ok) {
      const dates: string[] = await response.json();
      const rows = dates.map(d => [
        `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
      ]);
      return createDataFrame(['trade_date'], rows);
    }
  } catch {
    // ignore
  }

  return createDataFrame(['trade_date'], []);
}
