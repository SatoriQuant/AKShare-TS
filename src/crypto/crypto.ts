/**
 * AKShare TypeScript - 加密货币数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取加密货币实时行情 - 东方财富
 */
export async function crypto_spot_em(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '100',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:150',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '币种代码', '币种名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '流通市值', '总市值'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 币种代码
    item.f14,  // 币种名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f21,  // 流通市值
    item.f20,  // 总市值
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取加密货币历史行情 - 东方财富
 *
 * @param symbol 币种代码，如 "BTC"
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function crypto_hist_em(
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
    secid: `150.${symbol}`,
    beg: startDate || '19700101',
    end: endDate || '20500101',
    lmt: '1000000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额', '振幅', '涨跌幅', '涨跌额'];

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
      parseFloat(parts[7]),
      parseFloat(parts[8]),
      parseFloat(parts[9]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 获取比特币 CME 成交量报告
 */
export async function crypto_bitcoin_cme(date: string = '20230830'): Promise<DataFrame> {
  const url = 'https://datacenter-api.jin10.com/reports/list';
  const params = {
    category: 'cme',
    date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
    attr_id: '4',
  };

  const headers = {
    accept: '*/*',
    origin: 'https://datacenter.jin10.com',
    referer: 'https://datacenter.jin10.com/',
    'x-app-id': 'rU6QIu7JHe2gOUeR',
    'x-version': '1.0.0',
    'x-csrf-token': '',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
  };

  try {
    const data = await httpGet<any>(url, { params, headers });
    const keys = data?.data?.keys;
    const values = data?.data?.values;

    if (!Array.isArray(keys) || !Array.isArray(values) || keys.length === 0) {
      return createDataFrame([], []);
    }

    const columns = keys.map((item: any) => String(item?.name ?? '').trim());
    const rows = values.map((item: any[]) => item.map((v) => (v === null || v === undefined ? '' : v)));
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
