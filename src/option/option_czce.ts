/**
 * AKShare TypeScript - 郑州商品交易所-交易数据-历史行情下载-期权历史行情下载
 * http://www.czce.com.cn/cn/jysj/lshqxz/H770319index_1.htm
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// 郑商所期权品种上市年份
const CZCE_SYMBOL_YEAR_MAP: Record<string, string> = {
  'SR': '2017',
  'CF': '2019',
  'TA': '2019',
  'MA': '2019',
  'RM': '2020',
  'ZC': '2020',
  'OI': '2022',
  'PK': '2022',
  'PX': '2023',
  'SH': '2023',
  'SA': '2023',
  'PF': '2023',
  'SM': '2023',
  'SF': '2023',
  'UR': '2023',
  'AP': '2023',
  'CJ': '2024',
  'FG': '2024',
  'PR': '2024',
};

// 郑商所期权品种名称到代码的映射
const CZCE_SYMBOL_NAME_MAP: Record<string, string> = {
  '白糖': 'SR',
  '棉花': 'CF',
  'PTA': 'TA',
  '甲醇': 'MA',
  '菜籽粕': 'RM',
  '动力煤': 'ZC',
  '菜籽油': 'OI',
  '花生': 'PK',
  '对二甲苯': 'PX',
  '烧碱': 'SH',
  '纯碱': 'SA',
  '短纤': 'PF',
  '锰硅': 'SM',
  '硅铁': 'SF',
  '尿素': 'UR',
  '苹果': 'AP',
  '红枣': 'CJ',
  '玻璃': 'FG',
  '瓶片': 'PR',
};

/**
 * 郑州商品交易所-交易数据-历史行情下载-期权历史行情下载
 * http://www.czce.com.cn/cn/jysj/lshqxz/H770319index_1.htm
 * @param symbol 品种代码，如 "SR", "CF" 等
 * @param year 年份，如 "2021"
 * @returns 指定年份的日频期权数据
 */
export async function option_hist_yearly_czce(
  symbol: string = 'SR',
  year: string = '2021'
): Promise<DataFrame> {
  // 检查品种是否在指定年份已上市
  const startYear = CZCE_SYMBOL_YEAR_MAP[symbol];
  if (!startYear || parseInt(startYear) > parseInt(year)) {
    console.warn(`${year}年，品种${symbol}尚未上市`);
    return createDataFrame([], []);
  }

  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Option/${year}/OptionDataAllHistory/${symbol}OPTIONS${year}.txt`;

  try {
    const text = await httpGetText(url);
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 3) {
      return createDataFrame([], []);
    }

    // 第一行是标题，跳过
    const headerLine = lines[1]; // 第二行通常是列名
    const columns = headerLine.split('|').map(h => h).filter(h => h.trim());

    if (columns.length === 0) {
      return createDataFrame([], []);
    }

    const rows: any[][] = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const parts = line.split('|').map(p => p);
      if (parts.length >= columns.length) {
        rows.push(parts.slice(0, columns.length));
      }
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取郑商所期权品种名称到代码的映射
 * @returns 品种名称到代码的映射
 */
export function getCzceSymbolMap(): Record<string, string> {
  return { ...CZCE_SYMBOL_NAME_MAP };
}

/**
 * 获取郑商所期权品种代码到上市年份的映射
 * @returns 品种代码到上市年份的映射
 */
export function getCzceSymbolYearMap(): Record<string, string> {
  return { ...CZCE_SYMBOL_YEAR_MAP };
}
