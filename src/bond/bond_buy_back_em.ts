/**
 * AKShare TypeScript - 质押式回购数据接口
 * 东方财富网-行情中心-债券市场-质押式回购
 * https://quote.eastmoney.com/center/gridlist.html#bond_sz_buyback
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取上证质押式回购列表 - 东方财富
 */
export async function bond_sh_buy_back_em(): Promise<DataFrame> {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get';
  const params = {
    np: '1',
    fltt: '1',
    invt: '2',
    fs: 'm:1+b:MK0356',
    fields: 'f12,f13,f14,f1,f2,f4,f3,f152,f17,f18,f15,f16,f5,f6',
    fid: 'f6',
    pn: '1',
    pz: '1000',
    po: '1',
    dect: '1',
    wbp2u: '|0|0|0|web',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data?.diff) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅',
      '今开', '最高', '最低', '昨收', '成交量', '成交额'
    ];

    const rows = data.data.diff.map((item: any, index: number) => [
      index + 1,
      item.f12,           // 代码
      item.f14,           // 名称
      item.f2 / 1000,     // 最新价
      item.f4 / 1000,     // 涨跌额
      item.f3 / 100,      // 涨跌幅
      item.f17 / 1000,    // 今开
      item.f15 / 1000,    // 最高
      item.f16 / 1000,    // 最低
      item.f18 / 1000,    // 昨收
      item.f5,            // 成交量
      item.f6,            // 成交额
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取深证质押式回购列表 - 东方财富
 */
export async function bond_sz_buy_back_em(): Promise<DataFrame> {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get';
  const params = {
    np: '1',
    fltt: '1',
    invt: '2',
    fs: 'm:0+b:MK0356',
    fields: 'f12,f13,f14,f1,f2,f4,f3,f152,f17,f18,f15,f16,f5,f6',
    fid: 'f6',
    pn: '1',
    pz: '1000',
    po: '1',
    dect: '1',
    wbp2u: '|0|0|0|web',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data?.diff) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅',
      '今开', '最高', '最低', '昨收', '成交量', '成交额'
    ];

    const rows = data.data.diff.map((item: any, index: number) => [
      index + 1,
      item.f12,           // 代码
      item.f14,           // 名称
      item.f2 / 1000,     // 最新价
      item.f4 / 1000,     // 涨跌额
      item.f3 / 100,      // 涨跌幅
      item.f17 / 1000,    // 今开
      item.f15 / 1000,    // 最高
      item.f16 / 1000,    // 最低
      item.f18 / 1000,    // 昨收
      item.f5,            // 成交量
      item.f6,            // 成交额
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取质押式回购历史数据 - 东方财富
 *
 * @param symbol 质押式回购代码，如 204001, 131810
 */
export async function bond_buy_back_hist_em(symbol: string = '204001'): Promise<DataFrame> {
  const marketId = symbol.startsWith('1') ? '0' : '1';
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
    forcect: '1',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data?.klines) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额'];

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
  } catch (error) {
    return createDataFrame([], []);
  }
}
