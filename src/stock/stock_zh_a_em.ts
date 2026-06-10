/**
 * AKShare TypeScript - 东方财富股票数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { KlineData, StockInfo } from '../utils/types';

/**
 * 股票日线行情数据 - 东方财富
 *
 * @param symbol 股票代码，如 "000001"
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期，格式 "20240101"
 * @param endDate 结束日期，格式 "20240101"
 * @param adjust 复权类型：qfq 前复权, hfq 后复权, "" 不复权
 */
export async function stock_zh_a_hist(
  symbol: string = '000001',
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate: string = '19700101',
  endDate: string = '20500101',
  adjust: 'qfq' | 'hfq' | '' = ''
): Promise<DataFrame> {
  // 确定市场代码
  const market = symbol.startsWith('6') ? '1' : '0';

  // 构建调整参数
  let adjustParam = '';
  switch (adjust) {
    case 'qfq':
      adjustParam = '1';
      break;
    case 'hfq':
      adjustParam = '2';
      break;
    default:
      adjustParam = '0';
  }

  // 周期参数
  const periodMap: Record<string, string> = {
    daily: '101',
    weekly: '102',
    monthly: '103',
  };

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f116',
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    klt: periodMap[period],
    fqt: adjustParam,
    secid: `${market}.${symbol}`,
    beg: startDate,
    end: endDate,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const rows = data.data.klines
    .map((item: string) => item.split(','))
    .map((parts: string[]) => [
      parts[0] ?? null,
      symbol,
      parts[1] ? Number(parts[1]) : null,
      parts[2] ? Number(parts[2]) : null,
      parts[3] ? Number(parts[3]) : null,
      parts[4] ? Number(parts[4]) : null,
      parts[5] ? Number(parts[5]) : null,
      parts[6] ? Number(parts[6]) : null,
      parts[7] ? Number(parts[7]) : null,
      parts[8] ? Number(parts[8]) : null,
      parts[9] ? Number(parts[9]) : null,
      parts[10] ? Number(parts[10]) : null,
    ]);

  return createDataFrame(
    ['日期', '股票代码', '开盘', '收盘', '最高', '最低', '成交量', '成交额', '振幅', '涨跌幅', '涨跌额', '换手率'],
    rows
  );
}

/**
 * 股票实时行情数据 - 东方财富
 *
 * @param symbol 股票代码，如 "000001"
 */
export async function stock_zh_a_spot(symbol: string): Promise<Record<string, any>> {
  const market = symbol.startsWith('6') ? '1' : '0';

  const url = 'https://push2.eastmoney.com/api/qt/stock/get';
  const params = {
    secid: `${market}.${symbol}`,
    fields: 'f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f57,f58,f60,f62,f71,f92,f152,f168,f169,f170,f171,f177,f531',
    ut: 'fa5fd1943c7b386f172d6893dbbd1d0c',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return {};
  }

  const d = data.data;
  return {
    code: d.f57,
    name: d.f58,
    latest: d.f43 / 100,
    high: d.f44 / 100,
    low: d.f45 / 100,
    open: d.f46 / 100,
    volume: d.f47,
    amount: d.f48,
    previousClose: d.f60 / 100,
    changePercent: d.f170 / 100,
    changeAmount: d.f169 / 100,
    amplitude: d.f171 / 100,
    turnover: d.f168 / 100,
    pe: d.f162 / 100,
    pb: d.f167 / 100,
    totalValue: d.f116,
    circulatingValue: d.f117,
  };
}

/**
 * 获取所有A股实时行情 - 东方财富
 *
 * @param market 市场：sh 上海, sz 深圳, all 全部
 */
export async function stock_zh_a_spot_em(
  market: 'sh' | 'sz' | 'all' = 'all'
): Promise<DataFrame> {
  let marketCode = 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23';
  if (market === 'sh') {
    marketCode = 'm:1+t:2,m:1+t:23';
  } else if (market === 'sz') {
    marketCode = 'm:0+t:6,m:0+t:80';
  }

  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '10000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: marketCode,
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '换手率', '市盈率-动态', '量比', '5分钟涨跌', '60日涨跌幅',
    '年初至今涨跌幅', '市净率', '总市值', '流通市值'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 代码
    item.f14,  // 名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f7,   // 振幅
    item.f8,   // 换手率
    item.f9,   // 市盈率-动态
    item.f10,  // 量比
    item.f22,  // 5分钟涨跌
    item.f24,  // 60日涨跌幅
    item.f25,  // 年初至今涨跌幅
    item.f23,  // 市净率
    item.f20,  // 总市值
    item.f21,  // 流通市值
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取A股股票列表
 */
export async function stock_zh_a_code_name(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '10000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23',
    fields: 'f12,f14',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = ['code', 'name'];
  const rows = data.data.diff.map((item: any) => [item.f12, item.f14]);

  return createDataFrame(columns, rows);
}

/**
 * 获取股票历史分笔数据
 *
 * @param symbol 股票代码
 * @param date 日期，格式 "20240101"
 */
export async function stock_zh_a_tick_tx(
  symbol: string,
  date: string
): Promise<DataFrame> {
  const market = symbol.startsWith('6') ? '1' : '0';
  const dateStr = date.replace(/-/g, '');

  const url = `https://push2his.eastmoney.com/api/qt/stock/trends2/get`;
  const params = {
    secid: `${market}.${symbol}`,
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
    iscr: '0',
    ndays: '1',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.trends) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '价格', '涨跌幅', '成交量', '成交额', '最新价'];
  const rows = data.data.trends.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],           // 时间
      parseFloat(parts[1]), // 价格
      parseFloat(parts[3]), // 涨跌幅
      parseInt(parts[5]),   // 成交量
      parseFloat(parts[6]), // 成交额
      parseFloat(parts[1]), // 最新价
    ];
  });

  return createDataFrame(columns, rows);
}
