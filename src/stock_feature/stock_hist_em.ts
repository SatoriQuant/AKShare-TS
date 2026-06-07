/**
 * AKShare TypeScript - 东方财富网-行情首页-沪深京 A 股
 * https://quote.eastmoney.com/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-沪深京 A 股-实时行情
 * https://quote.eastmoney.com/center/gridlist.html#hs_a_board
 * @returns 实时行情数据
 */
export async function stock_zh_a_spot_em_feature(): Promise<DataFrame> {
  const url = 'https://82.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '5000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:0 t:6,m:0 t:80,m:1 t:2,m:1 t:23,m:0 t:81 s:2048',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '最高', '最低', '今开', '昨收', '量比', '换手率', '市盈率-动态',
    '市净率', '总市值', '流通市值', '涨速', '5分钟涨跌', '60日涨跌幅', '年初至今涨跌幅'
  ];

  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
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
    item.f8,
    item.f9,
    item.f23,
    item.f20,
    item.f21,
    item.f22,
    item.f11,
    item.f24,
    item.f25,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-沪 A 股-实时行情
 * https://quote.eastmoney.com/center/gridlist.html#hs_a_board
 * @returns 沪A股实时行情数据
 */
export async function stock_sh_a_spot_em(): Promise<DataFrame> {
  const url = 'https://82.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '5000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:1 t:2,m:1 t:23',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '最高', '最低', '今开', '昨收', '量比', '换手率', '市盈率-动态',
    '市净率', '总市值', '流通市值', '涨速', '5分钟涨跌', '60日涨跌幅', '年初至今涨跌幅'
  ];

  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
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
    item.f8,
    item.f9,
    item.f23,
    item.f20,
    item.f21,
    item.f22,
    item.f11,
    item.f24,
    item.f25,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-深 A 股-实时行情
 * https://quote.eastmoney.com/center/gridlist.html#hs_a_board
 * @returns 深A股实时行情数据
 */
export async function stock_sz_a_spot_em(): Promise<DataFrame> {
  const url = 'https://82.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '5000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:0 t:6,m:0 t:80',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '最高', '最低', '今开', '昨收', '量比', '换手率', '市盈率-动态',
    '市净率', '总市值', '流通市值', '涨速', '5分钟涨跌', '60日涨跌幅', '年初至今涨跌幅'
  ];

  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
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
    item.f8,
    item.f9,
    item.f23,
    item.f20,
    item.f21,
    item.f22,
    item.f11,
    item.f24,
    item.f25,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-京 A 股-实时行情
 * https://quote.eastmoney.com/center/gridlist.html#hs_a_board
 * @returns 京A股实时行情数据
 */
export async function stock_bj_a_spot_em(): Promise<DataFrame> {
  const url = 'https://82.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '5000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:0 t:81 s:2048',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '最高', '最低', '今开', '昨收', '量比', '换手率', '市盈率-动态',
    '市净率', '总市值', '流通市值', '涨速', '5分钟涨跌', '60日涨跌幅', '年初至今涨跌幅'
  ];

  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
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
    item.f8,
    item.f9,
    item.f23,
    item.f20,
    item.f21,
    item.f22,
    item.f11,
    item.f24,
    item.f25,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情首页-沪深京 A 股-每日行情
 * https://quote.eastmoney.com/concept/sh603777.html?from=classic
 * @param symbol 股票代码
 * @param period 周期，可选 {'daily', 'weekly', 'monthly'}
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @param adjust 复权类型，可选 {"qfq": "前复权", "hfq": "后复权", "": "不复权"}
 * @returns 每日行情数据
 */
export async function stock_zh_a_hist_feature(
  symbol: string = '000001',
  period: string = 'daily',
  start_date: string = '19700101',
  end_date: string = '20500101',
  adjust: string = ''
): Promise<DataFrame> {
  const market_code = symbol.startsWith('6') ? 1 : 0;
  const adjust_dict: { [key: string]: string } = { qfq: '1', hfq: '2', '': '0' };
  const period_dict: { [key: string]: string } = { daily: '101', weekly: '102', monthly: '103' };

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f116',
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    klt: period_dict[period] || '101',
    fqt: adjust_dict[adjust] || '0',
    secid: `${market_code}.${symbol}`,
    beg: start_date,
    end: end_date,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines || data.data.klines.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额', '振幅', '涨跌幅', '涨跌额', '换手率', '股票代码'
  ];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseFloat(parts[5]),
      parseFloat(parts[6]),
      parseFloat(parts[7]),
      parseFloat(parts[8]),
      parseFloat(parts[9]),
      parseFloat(parts[10]),
      symbol,
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情首页-沪深京 A 股-每日分时行情
 * https://quote.eastmoney.com/concept/sh603777.html?from=classic
 * @param symbol 股票代码
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @param period 周期，可选 {'1', '5', '15', '30', '60'}
 * @param adjust 复权类型，可选 {'', 'qfq', 'hfq'}
 * @returns 每日分时行情数据
 */
export async function stock_zh_a_hist_min_em(
  symbol: string = '000001',
  start_date: string = '1979-09-01 09:32:00',
  end_date: string = '2222-01-01 09:32:00',
  period: string = '5',
  adjust: string = ''
): Promise<DataFrame> {
  const market_code = symbol.startsWith('6') ? 1 : 0;
  const adjust_map: { [key: string]: string } = { '': '0', qfq: '1', hfq: '2' };

  if (period === '1') {
    const url = 'https://push2his.eastmoney.com/api/qt/stock/trends2/get';
    const params = {
      fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
      ut: '7eea3edcaed734bea9cbfc24409ed989',
      ndays: '5',
      iscr: '0',
      secid: `${market_code}.${symbol}`,
    };

    const data = await httpGet<any>(url, { params });

    if (!data?.data?.trends || data.data.trends.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['时间', '开盘', '收盘', '最高', '最低', '成交量', '成交额', '均价'];
    const rows = data.data.trends.map((item: string) => {
      const parts = item.split(',');
      return [
        parts[0],
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
        parseFloat(parts[4]),
        parseFloat(parts[5]),
        parseFloat(parts[6]),
        parseFloat(parts[7]),
      ];
    });

    // Filter by date range
    const filteredRows = rows.filter((row: any[]) => {
      const time = row[0];
      return time >= start_date && time <= end_date;
    });

    return createDataFrame(columns, filteredRows);
  } else {
    const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
    const params = {
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      ut: '7eea3edcaed734bea9cbfc24409ed989',
      klt: period,
      fqt: adjust_map[adjust] || '0',
      secid: `${market_code}.${symbol}`,
      beg: '0',
      end: '20500000',
    };

    const data = await httpGet<any>(url, { params });

    if (!data?.data?.klines || data.data.klines.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['时间', '开盘', '收盘', '最高', '最低', '涨跌幅', '涨跌额', '成交量', '成交额', '振幅', '换手率'];
    const rows = data.data.klines.map((item: string) => {
      const parts = item.split(',');
      return [
        parts[0],
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
        parseFloat(parts[4]),
        parseFloat(parts[5]),
        parseFloat(parts[6]),
        parseFloat(parts[7]),
        parseFloat(parts[8]),
        parseFloat(parts[9]),
        parseFloat(parts[10]),
      ];
    });

    // Filter by date range
    const filteredRows = rows.filter((row: any[]) => {
      const time = row[0];
      return time >= start_date && time <= end_date;
    });

    return createDataFrame(columns, filteredRows);
  }
}

/**
 * 东方财富网-港股-实时行情
 * https://quote.eastmoney.com/center/gridlist.html#hk_stocks
 * @returns 港股实时行情数据
 */
export async function stock_hk_spot_em(): Promise<DataFrame> {
  const url = 'https://72.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '5000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:128 t:3,m:128 t:4,m:128 t:1,m:128 t:2',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅', '今开', '最高', '最低', '昨收', '成交量', '成交额'
  ];

  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
    item.f12,
    item.f14,
    item.f2,
    item.f4,
    item.f3,
    item.f17,
    item.f15,
    item.f16,
    item.f18,
    item.f5,
    item.f6,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情-港股-每日行情
 * https://quote.eastmoney.com/hk/08367.html
 * @param symbol 港股代码
 * @param period 周期，可选 {'daily', 'weekly', 'monthly'}
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @param adjust 复权类型，可选 {"qfq": "1", "hfq": "2", "": "不复权"}
 * @returns 每日行情数据
 */
export async function stock_hk_hist(
  symbol: string = '00593',
  period: string = 'daily',
  start_date: string = '19700101',
  end_date: string = '22220101',
  adjust: string = ''
): Promise<DataFrame> {
  const adjust_dict: { [key: string]: string } = { qfq: '1', hfq: '2', '': '0' };
  const period_dict: { [key: string]: string } = { daily: '101', weekly: '102', monthly: '103' };

  const url = 'https://33.push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: `116.${symbol}`,
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: period_dict[period] || '101',
    fqt: adjust_dict[adjust] || '0',
    end: '20500000',
    lmt: '1000000',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines || data.data.klines.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额', '振幅', '涨跌幅', '涨跌额', '换手率'];
  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseFloat(parts[5]),
      parseFloat(parts[6]),
      parseFloat(parts[7]),
      parseFloat(parts[8]),
      parseFloat(parts[9]),
      parseFloat(parts[10]),
    ];
  });

  // Filter by date range
  const filteredRows = rows.filter((row: any[]) => {
    const date = row[0];
    return date >= start_date && date <= end_date;
  });

  return createDataFrame(columns, filteredRows);
}

/**
 * 东方财富网-美股-实时行情
 * https://quote.eastmoney.com/center/gridlist.html#us_stocks
 * @returns 美股实时行情数据
 */
export async function stock_us_spot_em(): Promise<DataFrame> {
  const url = 'https://72.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '5000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:105,m:106,m:107',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '名称', '最新价', '涨跌额', '涨跌幅', '开盘价', '最高价', '最低价',
    '昨收价', '总市值', '市盈率', '成交量', '成交额', '振幅', '换手率', '代码'
  ];

  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
    item.f14,
    item.f2,
    item.f4,
    item.f3,
    item.f17,
    item.f15,
    item.f16,
    item.f18,
    item.f20,
    item.f9,
    item.f5,
    item.f6,
    item.f7,
    item.f8,
    `${item.f13}.${item.f12}`,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情-美股-每日行情
 * https://quote.eastmoney.com/us/ENTX.html#fullScreenChart
 * @param symbol 股票代码，需要通过 stock_us_spot_em() 获取
 * @param period 周期，可选 {'daily', 'weekly', 'monthly'}
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @param adjust 复权类型，可选 {"qfq": "1", "hfq": "2", "": "不复权"}
 * @returns 每日行情数据
 */
export async function stock_us_hist(
  symbol: string = '105.MSFT',
  period: string = 'daily',
  start_date: string = '19700101',
  end_date: string = '22220101',
  adjust: string = ''
): Promise<DataFrame> {
  const period_dict: { [key: string]: string } = { daily: '101', weekly: '102', monthly: '103' };
  const adjust_dict: { [key: string]: string } = { qfq: '1', hfq: '2', '': '0' };

  const url = 'https://63.push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: symbol,
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: period_dict[period] || '101',
    fqt: adjust_dict[adjust] || '0',
    end: '20500000',
    lmt: '1000000',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines || data.data.klines.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额', '振幅', '涨跌幅', '涨跌额', '换手率'];
  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseFloat(parts[5]),
      parseFloat(parts[6]),
      parseFloat(parts[7]),
      parseFloat(parts[8]),
      parseFloat(parts[9]),
      parseFloat(parts[10]),
    ];
  });

  // Filter by date range
  const filteredRows = rows.filter((row: any[]) => {
    const date = row[0];
    return date >= start_date && date <= end_date;
  });

  // Sort by date
  filteredRows.sort((a: any[], b: any[]) => {
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, filteredRows);
}
