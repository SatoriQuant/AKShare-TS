/**
 * AKShare TypeScript - 东方财富个股资金流向
 * https://data.eastmoney.com/zjlx/detail.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-资金流向-行业资金流-行业历史资金流
 *
 * @param symbol 行业名称，如 "汽车服务"
 */
export async function stock_sector_fund_flow_hist(
  symbol: string = '汽车服务'
): Promise<DataFrame> {
  // First get board code from name
  const listUrl = 'https://push2.eastmoney.com/api/qt/clist/get';
  const listParams = {
    fid: 'f62',
    po: '1',
    pz: '100',
    pn: '1',
    np: '1',
    fltt: '2',
    invt: '2',
    ut: '8dec03ba335b81bf4ebdf7b29ec27d15',
    fs: 'm:90 t:2',
    fields: 'f12,f14',
  };

  const listData = await httpGet<any>(listUrl, { params: listParams });
  if (!listData?.data?.diff) {
    return createDataFrame([], []);
  }

  const boardItem = listData.data.diff.find((item: any) => item.f14 === symbol);
  if (!boardItem) {
    return createDataFrame([], []);
  }

  const boardCode = boardItem.f12;
  const url = 'https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get';
  const params = {
    lmt: '0',
    klt: '101',
    fields1: 'f1,f2,f3,f7',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65',
    secid: `90.${boardCode}`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const rawColumns = [
    '日期', '主力净流入-净额', '小单净流入-净额', '中单净流入-净额',
    '大单净流入-净额', '超大单净流入-净额', '主力净流入-净占比',
    '小单净流入-净占比', '中单净流入-净占比', '大单净流入-净占比',
    '超大单净流入-净占比', '-', '-', '-', '-',
  ];

  const selectedColumns = [
    '日期', '主力净流入-净额', '主力净流入-净占比',
    '超大单净流入-净额', '超大单净流入-净占比',
    '大单净流入-净额', '大单净流入-净占比',
    '中单净流入-净额', '中单净流入-净占比',
    '小单净流入-净额', '小单净流入-净占比',
  ];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    const fullRow: Record<string, any> = {};
    rawColumns.forEach((col, i) => {
      if (col !== '-') fullRow[col] = parts[i];
    });
    return selectedColumns.map(col => {
      if (col === '日期') return fullRow[col];
      return parseFloat(fullRow[col]);
    });
  });

  return createDataFrame(selectedColumns, rows);
}

/**
 * 东方财富-数据中心-资金流向-概念资金流-概念历史资金流
 *
 * @param symbol 概念名称，如 "数据要素"
 */
export async function stock_concept_fund_flow_hist(
  symbol: string = '数据要素'
): Promise<DataFrame> {
  // First get concept code from name
  const listUrl = 'https://push2.eastmoney.com/api/qt/clist/get';
  const listParams = {
    pn: '1',
    pz: '100',
    po: '1',
    np: '1',
    fields: 'f3,f12,f13,f14,f62',
    fid: 'f62',
    fs: 'm:90+t:3',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
    _: Date.now().toString(),
  };

  const listData = await httpGet<any>(listUrl, { params: listParams });
  if (!listData?.data?.diff) {
    return createDataFrame([], []);
  }

  const conceptItem = listData.data.diff.find((item: any) => item.f14 === symbol);
  if (!conceptItem) {
    return createDataFrame([], []);
  }

  const conceptCode = conceptItem.f12;
  const url = 'https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get';
  const params = {
    lmt: '0',
    klt: '101',
    fields1: 'f1,f2,f3,f7',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65',
    secid: `90.${conceptCode}`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const rawColumns = [
    '日期', '主力净流入-净额', '小单净流入-净额', '中单净流入-净额',
    '大单净流入-净额', '超大单净流入-净额', '主力净流入-净占比',
    '小单净流入-净占比', '中单净流入-净占比', '大单净流入-净占比',
    '超大单净流入-净占比', '-', '-', '-', '-',
  ];

  const selectedColumns = [
    '日期', '主力净流入-净额', '主力净流入-净占比',
    '超大单净流入-净额', '超大单净流入-净占比',
    '大单净流入-净额', '大单净流入-净占比',
    '中单净流入-净额', '中单净流入-净占比',
    '小单净流入-净额', '小单净流入-净占比',
  ];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    const fullRow: Record<string, any> = {};
    rawColumns.forEach((col, i) => {
      if (col !== '-') fullRow[col] = parts[i];
    });
    return selectedColumns.map(col => {
      if (col === '日期') return fullRow[col];
      return parseFloat(fullRow[col]);
    });
  });

  return createDataFrame(selectedColumns, rows);
}
