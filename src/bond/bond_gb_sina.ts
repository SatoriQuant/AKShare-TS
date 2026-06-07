/**
 * AKShare TypeScript - 新浪财经债券数据接口
 * 新浪财经-债券-中国/美国国债收益率
 * https://vip.stock.finance.sina.com.cn/mkt/#hs_z
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 中国国债收益率代码映射
 */
const zhBondSymbolMap: Record<string, string> = {
  '中国1年期国债': 'CN1YT',
  '中国2年期国债': 'CN2YT',
  '中国3年期国债': 'CN3YT',
  '中国5年期国债': 'CN5YT',
  '中国7年期国债': 'CN7YT',
  '中国10年期国债': 'CN10YT',
  '中国15年期国债': 'CN15YT',
  '中国20年期国债': 'CN20YT',
  '中国30年期国债': 'CN30YT',
};

/**
 * 美国国债收益率代码映射
 */
const usBondSymbolMap: Record<string, string> = {
  '美国1月期国债': 'US1MT',
  '美国2月期国债': 'US2MT',
  '美国3月期国债': 'US3MT',
  '美国4月期国债': 'US4MT',
  '美国6月期国债': 'US6MT',
  '美国1年期国债': 'US1YT',
  '美国2年期国债': 'US2YT',
  '美国3年期国债': 'US3YT',
  '美国5年期国债': 'US5YT',
  '美国7年期国债': 'US7YT',
  '美国10年期国债': 'US10YT',
  '美国20年期国债': 'US20YT',
  '美国30年期国债': 'US30YT',
};

export type ZhBondSymbol = keyof typeof zhBondSymbolMap;
export type UsBondSymbol = keyof typeof usBondSymbolMap;

/**
 * 获取中国国债收益率行情数据 - 新浪财经
 * https://stock.finance.sina.com.cn/forex/globalbd/cn10yt.html
 *
 * @param symbol 国债期限类型
 */
export async function bond_gb_zh_sina(
  symbol: ZhBondSymbol = '中国10年期国债'
): Promise<DataFrame> {
  const symbolCode = zhBondSymbolMap[symbol];
  if (!symbolCode) {
    return createDataFrame([], []);
  }

  const url = `https://bond.finance.sina.com.cn/hq/gb/daily?symbol=${symbolCode}`;

  try {
    const data = await httpGet<any>(url);

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '开盘', '最高', '最低', '收盘', '成交量'];

    const rows = data.result.data.map((item: any[]) => [
      item[0],
      parseFloat(item[1]),
      parseFloat(item[2]),
      parseFloat(item[3]),
      parseFloat(item[4]),
      parseFloat(item[5]),
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取美国国债收益率行情数据 - 新浪财经
 * https://stock.finance.sina.com.cn/forex/globalbd/cn10yt.html
 *
 * @param symbol 国债期限类型
 */
export async function bond_gb_us_sina(
  symbol: UsBondSymbol = '美国10年期国债'
): Promise<DataFrame> {
  const symbolCode = usBondSymbolMap[symbol];
  if (!symbolCode) {
    return createDataFrame([], []);
  }

  const url = `https://bond.finance.sina.com.cn/hq/gb/daily?symbol=${symbolCode}`;

  try {
    const data = await httpGet<any>(url);

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '开盘', '最高', '最低', '收盘', '成交量'];

    const rows = data.result.data.map((item: any[]) => [
      item[0],
      parseFloat(item[1]),
      parseFloat(item[2]),
      parseFloat(item[3]),
      parseFloat(item[4]),
      parseFloat(item[5]),
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
