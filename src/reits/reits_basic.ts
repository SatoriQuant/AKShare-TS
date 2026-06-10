/**
 * AKShare TypeScript - REITs 行情及信息
 * https://quote.eastmoney.com/center/gridlist.html#fund_reits_all
 * https://www.jisilu.cn/data/cnreits/#CnReits
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取 REITs 代码与市场标识的映射（内部函数）
 * 东方财富网-行情中心-REITs-沪深 REITs
 */
async function reitsCodeMarketMap(): Promise<Record<string, number>> {
  const url = 'https://95.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '100',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:1 t:9 e:97,m:0 t:10 e:97',
    fields: 'f12,f13',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return {};
  }

  const result: Record<string, number> = {};
  for (const item of data.data.diff) {
    result[item.f12] = item.f13;
  }
  return result;
}

/**
 * 东方财富网-行情中心-REITs-沪深 REITs-实时行情
 * https://quote.eastmoney.com/center/gridlist.html#fund_reits_all
 */
export async function reits_realtime_em(): Promise<DataFrame> {
  const url = 'https://95.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '100',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:1 t:9 e:97,m:0 t:10 e:97',
    fields: 'f2,f3,f4,f5,f6,f12,f14,f15,f16,f17,f18',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅',
    '成交量', '成交额', '开盘价', '最高价', '最低价', '昨收',
  ];

  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
    item.f12,
    item.f14,
    Number(item.f2),
    Number(item.f4),
    Number(item.f3),
    Number(item.f5),
    Number(item.f6),
    Number(item.f17),
    Number(item.f15),
    Number(item.f16),
    Number(item.f18),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-REITs-沪深 REITs-历史行情
 * https://quote.eastmoney.com/sh508097.html
 *
 * @param symbol REITs 代码，默认 "508097"
 */
export async function reits_hist_em(symbol: string = '508097'): Promise<DataFrame> {
  const codeMarketDict = await reitsCodeMarketMap();
  const marketId = codeMarketDict[symbol];

  if (marketId === undefined) {
    throw new Error(`REITs 代码 "${symbol}" 不存在`);
  }

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: `${marketId}.${symbol}`,
    klt: '101',
    fqt: '1',
    lmt: '10000',
    end: '20500000',
    iscca: '1',
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64',
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    forcect: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '今开', '最高', '最低', '最新价', '成交量', '成交额', '振幅', '换手'];
  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      Number(parts[1]),
      Number(parts[3]),
      Number(parts[4]),
      Number(parts[2]),
      Number(parts[5]),
      Number(parts[6]),
      Number(parts[7]),
      Number(parts[10]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-REITs-沪深 REITs-分时行情
 * https://quote.eastmoney.com/sh508097.html
 *
 * @param symbol REITs 代码，默认 "508097"
 */
export async function reits_hist_min_em(symbol: string = '508097'): Promise<DataFrame> {
  const codeMarketDict = await reitsCodeMarketMap();
  const marketId = codeMarketDict[symbol];

  if (marketId === undefined) {
    throw new Error(`REITs 代码 "${symbol}" 不存在`);
  }

  const url = 'https://push2.eastmoney.com/api/qt/stock/trends2/get';
  const params = {
    secid: `${marketId}.${symbol}`,
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f17',
    fields2: 'f51,f53,f54,f55,f56,f57,f58',
    iscr: '0',
    iscca: '0',
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    ndays: '5',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.trends) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '最新价', '最高', '最低', '成交量', '成交额', '昨收'];
  const rows = data.data.trends.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      Number(parts[1]),
      Number(parts[2]),
      Number(parts[3]),
      Number(parts[4]),
      Number(parts[5]),
      Number(parts[6]),
    ];
  });

  return createDataFrame(columns, rows);
}
