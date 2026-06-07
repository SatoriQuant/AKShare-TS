/**
 * AKShare TypeScript - 行业板块数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取行业板块列表 - 东方财富
 */
export async function stock_board_industry_name_em(): Promise<DataFrame> {
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
    fs: 'm:90+t:2',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f124,f107,f104,f105',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '排名', '板块名称', '板块代码', '最新价', '涨跌幅', '涨跌额',
    '总市值', '换手率', '上涨家数', '下跌家数', '领涨股票', '领涨涨跌幅'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f14,  // 板块名称
    item.f12,  // 板块代码
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f20,  // 总市值
    item.f8,   // 换手率
    item.f104, // 上涨家数
    item.f105, // 下跌家数
    item.f128, // 领涨股票
    item.f136, // 领涨涨跌幅
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取行业板块成分股 - 东方财富
 *
 * @param board 板块名称，如 "银行"
 */
export async function stock_board_industry_cons_em(
  board: string
): Promise<DataFrame> {
  // 先获取板块代码
  const boardList = await stock_board_industry_name_em();
  const boardRow = boardList.data.find((row: any[]) => row[0] === board);

  if (!boardRow) {
    return createDataFrame([], []);
  }

  const boardCode = boardRow[1];

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
    fs: `b:${boardCode}+f:!50`,
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '换手率', '市盈率-动态', '市净率'
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
    item.f23,  // 市净率
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取行业板块历史行情 - 东方财富
 *
 * @param board 板块名称
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function stock_board_industry_hist_em(
  board: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  // 先获取板块代码
  const boardList = await stock_board_industry_name_em();
  const boardRow = boardList.data.find((row: any[]) => row[0] === board);

  if (!boardRow) {
    return createDataFrame([], []);
  }

  const boardCode = boardRow[1];

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
    secid: `90.${boardCode}`,
    beg: startDate || '19700101',
    end: endDate || '20500101',
    lmt: '1000000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额',
    '振幅', '涨跌幅', '涨跌额', '换手率'
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
