/**
 * AKShare TypeScript - 沪深港通数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取沪深港通资金流向 - 东方财富
 *
 * @param indicator 指标类型：沪股通, 深股通, 北向, 南向
 */
export async function stock_hsgt_fund_flow_summary(
  indicator: '沪股通' | '深股通' | '北向' | '南向' = '北向'
): Promise<DataFrame> {
  let marketType = '0';
  switch (indicator) {
    case '沪股通':
      marketType = '1';
      break;
    case '深股通':
      marketType = '2';
      break;
    case '北向':
      marketType = '0';
      break;
    case '南向':
      marketType = '3';
      break;
  }

  const url = 'https://push2his.eastmoney.com/api/qt/kamt.kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4',
    fields2: 'f51,f52,f53,f54,f55,f56',
    klt: '101',
    lmt: '1000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.s2n) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '当日净流入', '当日余额', '历史累计净流入', '当日成交额', '当日买入额', '当日卖出额'];

  let rawData: string[];
  switch (indicator) {
    case '沪股通':
      rawData = data.data.s2n;
      break;
    case '深股通':
      rawData = data.data.s2s;
      break;
    case '北向':
      rawData = data.data.s2n;
      break;
    case '南向':
      rawData = data.data.n2s;
      break;
    default:
      rawData = data.data.s2n;
  }

  const rows = rawData.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseFloat(parts[5]),
      parseFloat(parts[6]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 获取北向资金历史数据 - 东方财富
 */
export async function stock_hsgt_north_net_flow_in_em(): Promise<DataFrame> {
  const url = 'https://push2his.eastmoney.com/api/qt/kamt.kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4',
    fields2: 'f51,f52,f53,f54,f55,f56',
    klt: '101',
    lmt: '1000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.s2n) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '当日净流入', '当日余额', '历史累计净流入', '当日成交额', '当日买入额', '当日卖出额'];

  const rows = data.data.s2n.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseFloat(parts[5]),
      parseFloat(parts[6]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 获取南向资金历史数据 - 东方财富
 */
export async function stock_hsgt_south_net_flow_in_em(): Promise<DataFrame> {
  const url = 'https://push2his.eastmoney.com/api/qt/kamt.kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4',
    fields2: 'f51,f52,f53,f54,f55,f56',
    klt: '101',
    lmt: '1000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.n2s) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '当日净流入', '当日余额', '历史累计净流入', '当日成交额', '当日买入额', '当日卖出额'];

  const rows = data.data.n2s.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseFloat(parts[5]),
      parseFloat(parts[6]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 获取沪股通十大成交股 - 东方财富
 */
export async function stock_hsgt_sh_top10_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_MUTUAL_TOP10_STA',
    columns: 'ALL',
    filter: `(TRADE_DATE='latest')(MUTUAL_TYPE="001")`,
    pageNumber: '1',
    pageSize: '50',
    sortTypes: '-1',
    sortColumns: 'NET_BUY_AMT',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '代码', '名称', '最新价', '涨跌幅', '成交额', '净买入额', '净买入占比'];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.DEAL_AMT,
    item.NET_BUY_AMT,
    item.RATIO_INCREASE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取深股通十大成交股 - 东方财富
 */
export async function stock_hsgt_sz_top10_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_MUTUAL_TOP10_STA',
    columns: 'ALL',
    filter: `(TRADE_DATE='latest')(MUTUAL_TYPE="002")`,
    pageNumber: '1',
    pageSize: '50',
    sortTypes: '-1',
    sortColumns: 'NET_BUY_AMT',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '代码', '名称', '最新价', '涨跌幅', '成交额', '净买入额', '净买入占比'];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.DEAL_AMT,
    item.NET_BUY_AMT,
    item.RATIO_INCREASE,
  ]);

  return createDataFrame(columns, rows);
}
