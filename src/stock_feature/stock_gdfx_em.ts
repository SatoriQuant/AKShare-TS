/**
 * AKShare TypeScript - 东方财富网-数据中心-股东分析
 * https://data.eastmoney.com/gdfx/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-股东分析-十大流通股东
 * https://data.eastmoney.com/gdfx/HoldingAnalysis/600000.html
 * @param symbol 股票代码
 * @param date 报告期，如 "20231231"
 * @returns 十大流通股东数据
 */
export async function stock_gdfx_free_holding_detail_em(
  symbol: string = '600000',
  date: string = '20231231'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'HOLDER_NUM',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_F10_EH_FREEHOLDERS',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")(REPORT_DATE='${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '股东名称', '股东性质', '股份类型', '持股数量', '持股比例',
    '持仓市值', '增减', '变动比例', '报告期'
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.HOLDER_NAME,
    item.HOLDER_TYPE,
    item.SHARES_TYPE,
    item.HOLD_NUM,
    item.HOLD_RATIO,
    item.HOLD_MARKET_CAP,
    item.HOLD_NUM_CHANGE,
    item.CHANGE_RATIO,
    item.REPORT_DATE ? new Date(item.REPORT_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-股东分析-十大股东
 * https://data.eastmoney.com/gdfx/HoldingAnalysis/600000.html
 * @param symbol 股票代码
 * @param date 报告期，如 "20231231"
 * @returns 十大股东数据
 */
export async function stock_gdfx_holding_detail_em(
  symbol: string = '600000',
  date: string = '20231231'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'HOLDER_NUM',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_F10_EH_HOLDERS',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")(REPORT_DATE='${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '股东名称', '股东性质', '股份类型', '持股数量', '持股比例',
    '持仓市值', '增减', '变动比例', '报告期'
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.HOLDER_NAME,
    item.HOLDER_TYPE,
    item.SHARES_TYPE,
    item.HOLD_NUM,
    item.HOLD_RATIO,
    item.HOLD_MARKET_CAP,
    item.HOLD_NUM_CHANGE,
    item.CHANGE_RATIO,
    item.REPORT_DATE ? new Date(item.REPORT_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-股东分析-股东户数
 * https://data.eastmoney.com/gdfx/HolderNumber/600000.html
 * @param symbol 股票代码
 * @returns 股东户数数据
 */
export async function stock_gdfx_holding_num_em(symbol: string = '600000'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'END_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_F10_EH_HOLDERNUMCHANGE',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '报告期', '股东户数', '股东户数变化', '股东户数变化比例',
    '户均持股数量', '户均持股数量变化', '户均持股数量变化比例'
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.END_DATE ? new Date(item.END_DATE).toISOString().split('T')[0] : null,
    item.HOLDER_NUM,
    item.HOLDER_NUM_CHANGE,
    item.HOLDER_NUM_RATIO,
    item.AVG_SHARES,
    item.AVG_SHARES_CHANGE,
    item.AVG_SHARES_RATIO,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-股东分析-十大股东-机构持股
 * https://data.eastmoney.com/gdfx/InstitutionHold/600000.html
 * @param symbol 股票代码
 * @returns 机构持股数据
 */
export async function stock_gdfx_institution_holding_em(symbol: string = '600000'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_MAIN_ORGHOLD',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '报告期', '机构名称', '持股数量', '持股比例', '持仓市值',
    '持股变化', '持股变化比例'
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.REPORT_DATE ? new Date(item.REPORT_DATE).toISOString().split('T')[0] : null,
    item.ORG_NAME,
    item.HOLD_NUM,
    item.HOLD_RATIO,
    item.HOLD_MARKET_CAP,
    item.HOLD_NUM_CHANGE,
    item.CHANGE_RATIO,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-股东分析-个股-机构持股详情
 * https://data.eastmoney.com/gdfx/InstitutionHoldDetail/600000.html
 * @param symbol 股票代码
 * @param date 报告期，如 "20231231"
 * @returns 机构持股详情数据
 */
export async function stock_gdfx_institution_holding_detail_em(
  symbol: string = '600000',
  date: string = '20231231'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'HOLD_NUM',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_MAIN_ORGHOLDDET',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")(REPORT_DATE='${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '机构名称', '机构类型', '持股数量', '持股比例', '持仓市值',
    '持股变化', '持股变化比例', '报告期'
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.ORG_NAME,
    item.ORG_TYPE,
    item.HOLD_NUM,
    item.HOLD_RATIO,
    item.HOLD_MARKET_CAP,
    item.HOLD_NUM_CHANGE,
    item.CHANGE_RATIO,
    item.REPORT_DATE ? new Date(item.REPORT_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
