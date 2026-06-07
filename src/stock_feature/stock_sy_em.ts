/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-商誉
 * https://data.eastmoney.com/sy/scgk.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-商誉-A股商誉市场概况
 * https://data.eastmoney.com/sy/scgk.html
 * @returns A股商誉市场概况数据
 */
export async function stock_sy_profile_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_GOODWILL_MARKETSTATISTICS',
    token: '894050c76af8597a853f5b408b759f5d',
    columns: 'ALL',
    filter: '((GOODWILL_STATE="1")( | IMPAIRMENT_STATE="1"))(TRADE_BOARD="all")',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '报告期', '商誉', '商誉减值', '净资产',
    '商誉占净资产比例', '商誉减值占净资产比例',
    '净利润规模', '商誉减值占净利润比例',
  ];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE ? new Date(item.REPORT_DATE).toISOString().split('T')[0] : null,
    item.GOODWILL,
    item.IMPAIRMENT,
    item.NET_ASSETS,
    item.GOODWILL_RATIO,
    item.IMPAIRMENT_RATIO,
    item.NET_PROFIT,
    item.IMPAIRMENT_NP_RATIO,
  ]);

  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-商誉-个股商誉明细
 * https://data.eastmoney.com/sy/list.html
 * @param date 报告期，格式 "20231231"
 * @returns 个股商誉明细数据
 */
export async function stock_sy_jz_em(date: string = '20231231'): Promise<DataFrame> {
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'SECURITY_CODE',
    sortTypes: '1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_GOODWILL_DET',
    token: '894050c76af8597a853f5b408b759f5d',
    columns: 'ALL',
    filter: `(REPORT_DATE='${dateFormatted}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '股票代码', '股票简称', '报告期', '商誉', '商誉减值',
    '净资产', '商誉占净资产比例', '商誉减值占净资产比例',
    '净利润', '商誉减值占净利润比例',
  ];

  const rows = allData.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.REPORT_DATE ? new Date(item.REPORT_DATE).toISOString().split('T')[0] : null,
    item.GOODWILL,
    item.IMPAIRMENT,
    item.NET_ASSETS,
    item.GOODWILL_RATIO,
    item.IMPAIRMENT_RATIO,
    item.NET_PROFIT,
    item.IMPAIRMENT_NP_RATIO,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-商誉-行业商誉
 * https://data.eastmoney.com/sy/hylist.html
 * @param date 报告期，格式 "20231231"
 * @returns 行业商誉数据
 */
export async function stock_sy_hy_em(date: string = '20231231'): Promise<DataFrame> {
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'INDUSTRY_CODE',
    sortTypes: '1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_GOODWILL_INDUSTRYSTATISTICS',
    token: '894050c76af8597a853f5b408b759f5d',
    columns: 'ALL',
    filter: `(REPORT_DATE='${dateFormatted}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '行业代码', '行业', '公司数量', '商誉', '商誉减值',
    '净资产', '商誉占净资产比例', '商誉减值占净资产比例',
    '净利润', '商誉减值占净利润比例',
  ];

  const rows = data.result.data.map((item: any) => [
    item.INDUSTRY_CODE,
    item.INDUSTRY_NAME,
    item.COMPANY_NUM,
    item.GOODWILL,
    item.IMPAIRMENT,
    item.NET_ASSETS,
    item.GOODWILL_RATIO,
    item.IMPAIRMENT_RATIO,
    item.NET_PROFIT,
    item.IMPAIRMENT_NP_RATIO,
  ]);

  return createDataFrame(columns, rows);
}
