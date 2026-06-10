/**
 * AKShare TypeScript - 外汇数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取外汇实时行情 - 东方财富
 */
export async function forex_spot_em(): Promise<DataFrame> {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get';
  const baseParams = {
    np: '1',
    fltt: '2',
    invt: '2',
    fs: 'm:119,m:120,m:133',
    fields: 'f12,f13,f14,f1,f2,f4,f3,f152,f17,f18,f15,f16',
    fid: 'f3',
    po: '1',
    dect: '1',
    wbp2u: '|0|0|0|web',
    pz: '100',
  };

  const columns = ['序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅', '今开', '最高', '最低', '昨收'];
  const rows: any[][] = [];

  for (let page = 1; page <= 100; page++) {
    const data = await httpGet<any>(url, { params: { ...baseParams, pn: String(page) } });
    const diff = data?.data?.diff;
    if (!Array.isArray(diff) || diff.length === 0) {
      break;
    }

    for (const item of diff) {
      rows.push([
        rows.length + 1,
        item.f12,
        item.f14,
        item.f2,
        item.f4,
        item.f3,
        item.f17,
        item.f15,
        item.f16,
        item.f18,
      ]);
    }
  }

  return createDataFrame(columns, rows);
}

/**
 * 获取外汇历史行情 - 东方财富
 *
 * @param symbol 货币对代码，如 "EURUSD"
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function forex_hist_em(
  symbol: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    daily: '101',
    weekly: '102',
    monthly: '103',
  };

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: periodMap[period],
    fqt: '1',
    secid: `119.${symbol}`,
    beg: startDate || '19700101',
    end: endDate || '20500101',
    lmt: '1000000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量', '振幅', '涨跌幅', '涨跌额'];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseInt(parts[5]),
      parseFloat(parts[7]),
      parseFloat(parts[8]),
      parseFloat(parts[9]),
    ];
  });

  return createDataFrame(columns, rows);
}
