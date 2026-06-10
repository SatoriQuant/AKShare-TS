/**
 * AKShare TypeScript - 雪球-个股-公司概况-公司简介
 * https://xueqiu.com/snowman/S/SH601127/detail#/GSJJ
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 雪球-个股-公司概况-公司简介 (A股)
 *
 * @param symbol 证券代码，如 "SH601127"
 * @param token 雪球财经的 token
 */
export async function stock_individual_basic_info_xq(
  symbol: string = 'SH601127',
  token?: string
): Promise<DataFrame> {
  const url = 'https://stock.xueqiu.com/v5/stock/f10/cn/company.json';
  const params = { symbol };

  const headers: Record<string, string> = {};
  if (token) {
    headers['cookie'] = `xq_a_token=${token};`;
  }

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['item', 'value'];
  const entries = Object.entries(data.data);
  const rows = entries.map(([key, value]) => [key, value]);

  return createDataFrame(columns, rows);
}

/**
 * 雪球-个股-公司概况-公司简介 (美股)
 *
 * @param symbol 证券代码，如 "NVDA"
 * @param token 雪球财经的 token
 */
export async function stock_individual_basic_info_us_xq(
  symbol: string = 'NVDA',
  token?: string
): Promise<DataFrame> {
  const url = 'https://stock.xueqiu.com/v5/stock/f10/us/company.json';
  const params = { symbol };

  const headers: Record<string, string> = {};
  if (token) {
    headers['cookie'] = `xq_a_token=${token};`;
  }

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['item', 'value'];
  const entries = Object.entries(data.data);
  const rows = entries.map(([key, value]) => [key, value]);

  return createDataFrame(columns, rows);
}

/**
 * 雪球-个股-公司概况-公司简介 (港股)
 *
 * @param symbol 证券代码，如 "02097"
 * @param token 雪球财经的 token
 */
export async function stock_individual_basic_info_hk_xq(
  symbol: string = '02097',
  token?: string
): Promise<DataFrame> {
  const url = 'https://stock.xueqiu.com/v5/stock/f10/hk/company.json';
  const params = { symbol };

  const headers: Record<string, string> = {};
  if (token) {
    headers['cookie'] = `xq_a_token=${token};`;
  }

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['item', 'value'];
  const entries = Object.entries(data.data);
  const rows = entries.map(([key, value]) => [key, value]);

  return createDataFrame(columns, rows);
}
