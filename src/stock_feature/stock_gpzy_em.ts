/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-股权质押
 * https://data.eastmoney.com/gpzy/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-股权质押-股权质押市场概况
 * https://data.eastmoney.com/gpzy/marketProfile.aspx
 * @returns 股权质押市场概况数据
 */
export async function stock_gpzy_profile_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_CSDC_STATISTICS',
    columns: 'ALL',
    quoteColumns: '',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  // 获取剩余页数据
  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '交易日期', 'A股质押总比例', '质押公司数量', '质押笔数', '质押总股数',
    '质押总市值', '沪深300指数', '涨跌幅'
  ];

  const rows = allData.map((item: any) => [
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
    item.A_SHARES_PLEDGE_RATIO ? item.A_SHARES_PLEDGE_RATIO / 100 : null,
    item.PLEDGE_COMPANY_NUM,
    item.PLEDGE_NUM,
    item.PLEDGE_SHARES,
    item.PLEDGE_MARKET_CAP,
    item.HS300_INDEX,
    item.CHANGE_RATE,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-股权质押-上市公司质押比例
 * https://data.eastmoney.com/gpzy/pledgeRatio.aspx
 * @param date 指定交易日，如 "20240906"
 * @returns 上市公司质押比例数据
 */
export async function stock_gpzy_pledge_ratio_em(date: string = '20240906'): Promise<DataFrame> {
  const trade_date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'PLEDGE_RATIO',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_CSDC_LIST',
    columns: 'ALL',
    quoteColumns: '',
    source: 'WEB',
    client: 'WEB',
    filter: `(TRADE_DATE='${trade_date}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  // 获取剩余页数据
  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '股票代码', '股票简称', '交易日期', '所属行业', '质押比例',
    '质押股数', '质押市值', '质押笔数', '无限售股质押数', '限售股质押数',
    '近一年涨跌幅', '所属行业代码'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
    item.INDUSTRY,
    item.PLEDGE_RATIO,
    item.PLEDGE_SHARES,
    item.PLEDGE_MARKET_CAP,
    item.PLEDGE_NUM,
    item.FREE_PLEDGE_SHARES,
    item.LOCK_PLEDGE_SHARES,
    item.YEAR_CHANGE_RATE,
    item.INDUSTRY_CODE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-股权质押-重要股东股权质押明细
 * https://data.eastmoney.com/gpzy/pledgeDetail.aspx
 * @param symbol 股票代码
 * @returns 重要股东股权质押明细数据
 */
export async function stock_gpzy_pledge_ratio_detail_em(symbol: string = '000001'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'NOTICE_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPTA_APP_ACCUMDETAILS',
    columns: 'ALL',
    quoteColumns: '',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  // 获取剩余页数据
  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '公告日期', '股东名称', '质押股数', '质押市值', '质权人',
    '质押开始日期', '质押结束日期', '质押原因', '股票代码', '股票简称'
  ];

  const rows = allData.map((item: any) => [
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
    item.HOLDER_NAME,
    item.PLEDGE_SHARES,
    item.PLEDGE_MARKET_CAP,
    item.PLEDGE_HOLDER,
    item.PLEDGE_START_DATE ? new Date(item.PLEDGE_START_DATE).toISOString().split('T')[0] : null,
    item.PLEDGE_END_DATE ? new Date(item.PLEDGE_END_DATE).toISOString().split('T')[0] : null,
    item.PLEDGE_REASON,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
  ]);

  // 按公告日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-股权质押-质押机构分布统计-证券公司
 * https://data.eastmoney.com/gpzy/distributeStatistics.aspx
 * @returns 证券公司质押机构分布统计数据
 */
export async function stock_gpzy_pledge_distribute_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'PLEDGE_SHARES',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_CSDC_SECPLEDGE_STATISTICS',
    columns: 'ALL',
    quoteColumns: '',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '证券公司', '质押股数', '质押市值', '质押笔数',
    '质押公司数量', '质押比例'
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.ORG_NAME,
    item.PLEDGE_SHARES,
    item.PLEDGE_MARKET_CAP,
    item.PLEDGE_NUM,
    item.PLEDGE_COMPANY_NUM,
    item.PLEDGE_RATIO,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-股权质押-行业数据
 * https://data.eastmoney.com/gpzy/industryData.aspx
 * @returns 行业质押数据
 */
export async function stock_gpzy_pledge_industry_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'PLEDGE_RATIO',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_CSDC_INDUSTRY_STATISTICS',
    columns: 'ALL',
    quoteColumns: '',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '行业', '质押公司数量', '质押股数', '质押市值',
    '质押笔数', '质押比例', '行业代码'
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.INDUSTRY_NAME,
    item.PLEDGE_COMPANY_NUM,
    item.PLEDGE_SHARES,
    item.PLEDGE_MARKET_CAP,
    item.PLEDGE_NUM,
    item.PLEDGE_RATIO,
    item.INDUSTRY_CODE,
  ]);

  return createDataFrame(columns, rows);
}
