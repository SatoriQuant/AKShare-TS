/**
 * AKShare TypeScript - ETF 基金数据接口
 */

import { load } from 'cheerio';
import { httpGet } from '../utils/httpClient';
import { httpGetTextGbk } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取 ETF 实时行情 - 东方财富
 */
export async function fund_etf_spot_em(): Promise<DataFrame> {
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
    fs: 'b:MK0021,b:MK0022,b:MK0023,b:MK0024',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '基金代码', '基金名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '换手率', '市盈率'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 基金代码
    item.f14,  // 基金名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f7,   // 振幅
    item.f8,   // 换手率
    item.f9,   // 市盈率
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取 ETF 历史行情 - 东方财富
 *
 * @param symbol ETF 代码
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function fund_etf_hist_em(
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
    secid: `0.${symbol}`,
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

/**
 * 获取货币基金列表 - 东方财富
 */
export async function fund_money_fund_daily_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/HBJJ_pjsyl.html';

  try {
    const html = await httpGetTextGbk(url);
    const $ = load(html);

    const tables: string[][][] = [];
    $('table').each((_, table) => {
      const tableRows: string[][] = [];
      $(table)
        .find('tr')
        .each((__, tr) => {
          const row: string[] = [];
          $(tr)
            .find('th,td')
            .each((___, cell) => {
              row.push($(cell).text().replace(/\u00a0/g, ' ').trim());
            });
          if (row.length > 0) {
            tableRows.push(row);
          }
        });
      if (tableRows.length > 0) {
        tables.push(tableRows);
      }
    });

    if (tables.length < 2) {
      return createDataFrame([], []);
    }

    const rawTable = tables[1];
    if (rawTable.length < 3) {
      return createDataFrame([], []);
    }

    const headerDates: string[] = [];
    $('table')
      .eq(1)
      .find('th')
      .each((_, th) => {
        const text = $(th).text().replace(/\u00a0/g, ' ').trim();
        const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          headerDates.push(dateMatch[0]);
        }
      });
    const rowDateCandidates = rawTable
      .slice(0, 2)
      .flatMap((row) => row)
      .map((cell) => String(cell).match(/\d{4}-\d{2}-\d{2}/)?.[0] || '')
      .filter((v) => v.length > 0);

    const uniqueDates = Array.from(new Set([...headerDates, ...rowDateCandidates]));
    const showDay = uniqueDates.length >= 2
      ? [uniqueDates[0], uniqueDates[0], uniqueDates[0], uniqueDates[1], uniqueDates[1], uniqueDates[1]]
      : ['','','','','',''];
    const tempTable = rawTable.slice(1).map((row) => row.slice(2));
    if (tempTable.length < 2) {
      return createDataFrame([], []);
    }

    const rawRows = tempTable.slice(1).map((row) => row.slice(1));

    const columns = [
      '基金代码',
      '基金简称',
      `${showDay[0] || ''}-万份收益`,
      `${showDay[1] || ''}-7日年化%`,
      `${showDay[2] || ''}-单位净值`,
      `${showDay[3] || ''}-万份收益`,
      `${showDay[4] || ''}-7日年化%`,
      `${showDay[5] || ''}-单位净值`,
      '日涨幅',
      '成立日期',
      '基金经理',
      '手续费',
      '可购全部',
    ];

    const rows = rawRows.map((row) => {
      const normalized = row.slice(0, columns.length);
      while (normalized.length < columns.length) {
        normalized.push('');
      }

      if (normalized.length > 1) {
        normalized[1] = String(normalized[1]).replace(/基金吧档案$/g, '').trim();
      }

      return normalized;
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
