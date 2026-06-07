/**
 * AKShare TypeScript - 中国指数数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取沪深重要指数实时行情 - 东方财富
 * https://quote.eastmoney.com/center/hszs.html
 */
export async function stock_zh_index_spot_main_em(): Promise<DataFrame> {
  const url = 'https://33.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '100',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    dect: '1',
    wbp2u: '|0|0|0|web',
    fid: '',
    fs: 'b:MK0010',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,' +
      'f23,f24,f25,f26,f22,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '最高', '最低', '今开', '昨收', '量比',
  ];

  const rows = data.data.diff.map((item: any, idx: number) => [
    idx + 1,
    item.f12,
    item.f14,
    item.f2,
    item.f3,
    item.f4,
    item.f5,
    item.f6,
    item.f7,
    item.f15,
    item.f16,
    item.f17,
    item.f18,
    item.f10,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取指数实时行情 - 东方财富
 * https://quote.eastmoney.com/center/gridlist.html#index_sz
 *
 * @param symbol 指数系列，选择: "沪深重要指数", "上证系列指数", "深证系列指数", "指数成份", "中证系列指数"
 */
export async function stock_zh_index_spot_em(
  symbol: '沪深重要指数' | '上证系列指数' | '深证系列指数' | '指数成份' | '中证系列指数' = '上证系列指数'
): Promise<DataFrame> {
  if (symbol === '沪深重要指数') {
    return stock_zh_index_spot_main_em();
  }

  const symbolMap: Record<string, string> = {
    '上证系列指数': 'm:1+t:1',
    '深证系列指数': 'm:0 t:5',
    '指数成份': 'm:1+s:3,m:0+t:5',
    '中证系列指数': 'm:2',
  };

  const url = 'https://48.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '2000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    wbp2u: '|0|0|0|web',
    fid: 'f12',
    fs: symbolMap[symbol] || 'm:1+t:1',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,' +
      'f26,f22,f33,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '最高', '最低', '今开', '昨收', '量比',
  ];

  const rows = data.data.diff.map((item: any, idx: number) => [
    idx + 1,
    item.f12,
    item.f14,
    item.f2,
    item.f3,
    item.f4,
    item.f5,
    item.f6,
    item.f7,
    item.f15,
    item.f16,
    item.f17,
    item.f18,
    item.f10,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取全球主要指数实时行情 - 东方财富
 * 包含A股、港股、美股等主要指数
 */
export async function stock_zh_index_spot_em_global(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '1000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:1+s:2,m:0+t:5,m:0+t:6,m:0+t:13,m:0+t:80,m:1+t:2,m:1+t:23',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '指数代码', '指数名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '换手率', '市盈率',
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,
    item.f14,
    item.f2,
    item.f3,
    item.f4,
    item.f5,
    item.f6,
    item.f7,
    item.f8,
    item.f9,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取指数历史行情 - 东方财富
 * 支持带市场前缀的指数代码：sz(深交所), sh(上交所), csi(中证), bj(北交所)
 *
 * @param symbol 指数代码，如 "sh000001", "sz399001", "csi000300"
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期，格式 "YYYYMMDD"
 * @param endDate 结束日期，格式 "YYYYMMDD"
 */
export async function stock_zh_index_daily_em(
  symbol: string = 'sh000001',
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate: string = '19700101',
  endDate: string = '20500101'
): Promise<DataFrame> {
  const marketMap: Record<string, string> = { sz: '0', sh: '1', csi: '2', bj: '0' };
  const periodMap: Record<string, string> = {
    daily: '101',
    weekly: '102',
    monthly: '103',
  };

  let secid: string;
  if (symbol.startsWith('sz')) {
    secid = `${marketMap.sz}.${symbol.slice(2)}`;
  } else if (symbol.startsWith('sh')) {
    secid = `${marketMap.sh}.${symbol.slice(2)}`;
  } else if (symbol.startsWith('csi')) {
    secid = `${marketMap.csi}.${symbol.slice(3)}`;
  } else if (symbol.startsWith('bj')) {
    secid = `${marketMap.bj}.${symbol.slice(2)}`;
  } else {
    // Fallback: try to detect market from first digit
    const market = symbol.startsWith('0') ? '1' : '0';
    secid = `${market}.${symbol}`;
  }

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid,
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: periodMap[period],
    fqt: '0',
    beg: startDate,
    end: endDate,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额',
    '振幅', '涨跌幅', '涨跌额', '换手率',
  ];

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
      parseFloat(parts[10]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 获取指数成分股 - 东方财富
 *
 * @param symbol 指数代码
 */
export async function index_stock_cons(symbol: string = '000300'): Promise<DataFrame> {
  const market = symbol.startsWith('0') ? '1' : '0';

  const url = 'https://push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '1000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: `ii:${symbol}+m:${market}`,
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '换手率', '市盈率-动态', '市净率',
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,
    item.f14,
    item.f2,
    item.f3,
    item.f4,
    item.f5,
    item.f6,
    item.f7,
    item.f8,
    item.f9,
    item.f23,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-股票和市场代码映射
 */
export async function index_code_id_map_em(): Promise<Record<string, number>> {
  const url = 'https://80.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '100',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'b:MK0010,m:1+t:1,m:0 t:5,m:1+s:3,m:0+t:5,m:2',
    fields: 'f3,f12,f13',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return {};
  }

  const dict: Record<string, number> = {};
  data.data.diff.forEach((item: any) => {
    dict[item.f12] = item.f13;
  });

  return dict;
}

/**
 * 东方财富网-中国指数-历史行情数据（增强版）
 * 自动检测市场前缀
 *
 * @param symbol 指数代码，如 "000859"
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function index_zh_a_hist(
  symbol: string = '000859',
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate: string = '19700101',
  endDate: string = '22220101'
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    daily: '101',
    weekly: '102',
    monthly: '103',
  };

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';

  // Try to get the market code from cache, fallback to trying different markets
  const markets = ['1', '0', '2', '47'];

  for (const market of markets) {
    const params = {
      secid: `${market}.${symbol}`,
      ut: '7eea3edcaed734bea9cbfc24409ed989',
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: periodMap[period],
      fqt: '0',
      beg: startDate,
      end: endDate,
    };

    const data = await httpGet<any>(url, { params });

    if (data?.data?.klines) {
      const columns = [
        '日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额',
        '振幅', '涨跌幅', '涨跌额', '换手率',
      ];

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
          parseFloat(parts[10]),
        ];
      });

      return createDataFrame(columns, rows);
    }
  }

  return createDataFrame([], []);
}
