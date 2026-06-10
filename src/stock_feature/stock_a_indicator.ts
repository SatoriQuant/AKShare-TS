/**
 * AKShare TypeScript - 乐咕乐股-市盈率, 市净率和股息率查询
 * https://www.legulegu.com/stocklist
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 亿牛网-港股指标
 * https://eniu.com/gu/hk01093/roe
 * @param symbol 港股代码，如 "hk01093"
 * @param indicator 指标类型，可选 {"港股", "市盈率", "市净率", "股息率", "ROE", "市值"}
 * @returns 指定 symbol 和 indicator 的数据
 */
export async function stock_hk_indicator_eniu(
  symbol: string = 'hk01093',
  indicator: string = '市盈率'
): Promise<DataFrame> {
  if (indicator === '港股') {
    const url = 'https://eniu.com/static/data/stock_list.json';
    const data = await httpGet<any[]>(url);

    if (!data || data.length === 0) {
      return createDataFrame([], []);
    }

    // 过滤港股数据
    const hkData = data.filter((item: any) => item.stock_id && item.stock_id.includes('hk'));

    if (hkData.length === 0) {
      return createDataFrame([], []);
    }

    const columns = Object.keys(hkData[0]);
    const rows = hkData.map((item: any) => columns.map(col => item[col]));

    return createDataFrame(columns, rows);
  }

  let url = '';
  switch (indicator) {
    case '市盈率':
      url = `https://eniu.com/chart/peh/${symbol}`;
      break;
    case '市净率':
      url = `https://eniu.com/chart/pbh/${symbol}`;
      break;
    case '股息率':
      url = `https://eniu.com/chart/dvh/${symbol}`;
      break;
    case 'ROE':
      url = `https://eniu.com/chart/roeh/${symbol}`;
      break;
    default:
      url = `https://eniu.com/chart/marketvalueh/${symbol}`;
      break;
  }

  const data = await httpGet<any[]>(url);

  if (!data || data.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(data[0]);
  const rows = data.map((item: any) => columns.map(col => item[col]));

  return createDataFrame(columns, rows);
}
