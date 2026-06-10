/**
 * AKShare TypeScript - 东方财富网-期货行情-高频数据
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-期货分钟级K线数据
 *
 * @param symbol 合约代码，如 "热卷主连"
 * @param period 分钟周期：1, 5, 15, 30, 60
 */
export async function futures_zh_minute_em(
  symbol: string,
  period: 1 | 5 | 15 | 30 | 60 = 5
): Promise<DataFrame> {
  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: period.toString(),
    fqt: '1',
    secid: `113.${symbol}`,
    lmt: '1000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '开盘', '收盘', '最高', '最低', '成交量', '成交额'];
  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseInt(parts[5]),
      parseFloat(parts[6]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-国际期货分钟级K线数据
 *
 * @param symbol 合约代码，如 "HG00Y"
 * @param period 分钟周期：1, 5, 15, 30, 60
 */
export async function futures_global_minute_em(
  symbol: string,
  period: 1 | 5 | 15 | 30 | 60 = 5
): Promise<DataFrame> {
  // Determine market code from symbol
  let baseSymbol = '';
  for (let i = 0; i < symbol.length; i++) {
    if (/\d/.test(symbol[i])) break;
    baseSymbol += symbol[i];
  }
  if (!baseSymbol) baseSymbol = symbol;

  let marketCode = 101; // default
  if (['HG', 'GC', 'SI', 'QI', 'QO', 'MGC', 'LTH'].includes(baseSymbol)) marketCode = 101;
  else if (['CL', 'NG', 'RB', 'HO', 'PA', 'PL', 'QM'].includes(baseSymbol)) marketCode = 102;
  else if (['ZW', 'ZM', 'ZS', 'ZC', 'XC', 'XK', 'XW', 'YM', 'TY', 'US', 'EH', 'ZL', 'ZR', 'ZO', 'FV', 'TU', 'UL', 'NQ', 'ES'].includes(baseSymbol)) marketCode = 103;

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: `${marketCode}.${symbol}`,
    klt: period.toString(),
    fqt: '1',
    lmt: '1000',
    end: '20500000',
    iscca: '1',
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64',
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    forcect: '1',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '开盘', '收盘', '最高', '最低', '成交量', '持仓量'];
  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseInt(parts[5]),
      parseInt(parts[12]) || 0,
    ];
  });

  return createDataFrame(columns, rows);
}
