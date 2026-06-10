/**
 * AKShare TypeScript - LOF 基金数据接口
 * 东方财富-LOF 行情
 * https://quote.eastmoney.com/center/gridlist.html#fund_lof
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * LOF 代码和市场标识映射缓存
 */
let lofCodeIdMap: Record<string, number> | null = null;

/**
 * 获取 LOF 代码和市场标识映射
 */
async function getLofCodeIdMap(): Promise<Record<string, number>> {
  if (lofCodeIdMap) return lofCodeIdMap;

  const url = 'https://2.push2.eastmoney.com/api/qt/clist/get';
  const baseParams = {
    pz: '100',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    wbp2u: '|0|0|0|web',
    fid: 'f12',
    fs: 'b:MK0404,b:MK0405,b:MK0406,b:MK0407',
    fields: 'f3,f12,f13',
  };

  const map: Record<string, number> = {};

  for (let page = 1; page <= 50; page++) {
    const data = await httpGet<any>(url, { params: { ...baseParams, pn: String(page) } });
    const diff = data?.data?.diff;
    if (!Array.isArray(diff) || diff.length === 0) {
      break;
    }
    for (const item of diff) {
      map[item.f12] = item.f13;
    }
  }

  lofCodeIdMap = map;
  return map;
}

/**
 * 获取 LOF 实时行情 - 东方财富
 * https://quote.eastmoney.com/center/gridlist.html#fund_lof
 */
export async function fund_lof_spot_em(): Promise<DataFrame> {
  const url = 'https://88.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '10000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    wbp2u: '|0|0|0|web',
    fid: 'f3',
    fs: 'b:MK0404,b:MK0405,b:MK0406,b:MK0407',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data?.diff) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '名称', '最新价', '涨跌额', '涨跌幅', '成交量', '成交额',
      '开盘价', '最高价', '最低价', '昨收', '换手率', '流通市值', '总市值',
    ];

    const rows = data.data.diff.map((item: any) => [
      item.f12,
      item.f14,
      parseFloat(item.f2) || null,
      parseFloat(item.f4) || null,
      parseFloat(item.f3) || null,
      parseFloat(item.f5) || null,
      parseFloat(item.f6) || null,
      parseFloat(item.f17) || null,
      parseFloat(item.f15) || null,
      parseFloat(item.f16) || null,
      parseFloat(item.f18) || null,
      parseFloat(item.f8) || null,
      parseFloat(item.f21) || null,
      parseFloat(item.f20) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取 LOF 历史行情 - 东方财富
 * https://quote.eastmoney.com/sz166009.html
 *
 * @param symbol LOF 代码
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param adjust 复权类型：qfq 前复权, hfq 后复权, 空 不复权
 */
export async function fund_lof_hist_em(
  symbol: string = '166009',
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate: string = '19700101',
  endDate: string = '20500101',
  adjust: '' | 'qfq' | 'hfq' = ''
): Promise<DataFrame> {
  try {
    const codeIdMap = await getLofCodeIdMap();
    const secId = codeIdMap[symbol];
    if (!secId) {
      return createDataFrame([], []);
    }

    const adjustMap: Record<string, string> = { 'qfq': '1', 'hfq': '2', '': '0' };
    const periodMap: Record<string, string> = { daily: '101', weekly: '102', monthly: '103' };

    const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
    const params = {
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f116',
      ut: '7eea3edcaed734bea9cbfc24409ed989',
      klt: periodMap[period],
      fqt: adjustMap[adjust],
      secid: `${secId}.${symbol}`,
      beg: startDate,
      end: endDate,
      lmt: '1000000',
    };

    const data = await httpGet<any>(url, { params });

    if (!data?.data?.klines) {
      return createDataFrame([], []);
    }

    const columns = [
      '日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额',
      '振幅', '涨跌幅', '涨跌额', '换手率',
    ];

    const toNum = (v: string): number | null => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const rows = data.data.klines.map((item: string) => {
      const parts = item.split(',');
      return [
        parts[0],
        toNum(parts[1]),
        toNum(parts[2]),
        toNum(parts[3]),
        toNum(parts[4]),
        toNum(parts[5]),
        toNum(parts[6]),
        toNum(parts[7]),
        toNum(parts[8]),
        toNum(parts[9]),
        toNum(parts[10]),
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
