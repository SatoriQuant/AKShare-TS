/**
 * AKShare TypeScript - 东方财富网-数据中心-年报季报-分红送配
 * https://data.eastmoney.com/yjfp/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-年报季报-分红送配
 * https://data.eastmoney.com/yjfp/
 * @param date 分红送配报告期，格式 "20231231"
 * @returns 分红送配数据
 */
export async function stock_fhps_em(
  date: string = '20231231'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

  const params = {
    sortColumns: 'PLAN_NOTICE_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_SHAREBONUS_DET',
    columns: 'ALL',
    quoteColumns: '',
    js: '{"data":(x),"pages":(tp)}',
    source: 'WEB',
    client: 'WEB',
    filter: `(REPORT_DATE='${dateFormatted}')`,
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
    '代码', '名称', '送转股份-送转总比例', '送转股份-送转比例',
    '送转股份-转股比例', '现金分红-现金分红比例', '现金分红-股息率',
    '每股收益', '每股净资产', '每股公积金', '每股未分配利润',
    '净利润同比增长', '总股本', '预案公告日', '股权登记日',
    '除权除息日', '方案进度', '最新公告日期'
  ];

  const rows = allData.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.BONUS_IT_RATIO,
    item.BONUS_RATIO,
    item.TRANSFER_IT_RATIO,
    item.PRETAX_BONUS_RMB,
    item.DIVIDEND_YIELD_RATIO,
    item.BASIC_EPS,
    item.BPS,
    item.CAPITAL_RESERVE_PS,
    item.UNDIST_PS,
    item.PROFIT_YOY_RATIO,
    item.TOTAL_SHARES,
    item.PLAN_NOTICE_DATE ? new Date(item.PLAN_NOTICE_DATE).toISOString().split('T')[0] : null,
    item.EQUITY_RECORD_DATE ? new Date(item.EQUITY_RECORD_DATE).toISOString().split('T')[0] : null,
    item.EX_DIVIDEND_DATE ? new Date(item.EX_DIVIDEND_DATE).toISOString().split('T')[0] : null,
      item.PROGRESS,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  // 按最新公告日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[17] || !b[17]) return 0;
    return new Date(a[17]).getTime() - new Date(b[17]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-分红送配-分红送配详情
 * https://data.eastmoney.com/yjfp/detail/300073.html
 * @param symbol 股票代码
 * @returns 分红送配详情
 */
export async function stock_fhps_detail_em(
  symbol: string = '300073'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_SHAREBONUS_DET',
    columns: 'ALL',
    quoteColumns: '',
    js: '{"data":(x),"pages":(tp)}',
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
    '报告期', '业绩披露日期', '送转股份-送转总比例', '送转股份-送股比例',
    '送转股份-转股比例', '现金分红-现金分红比例', '现金分红-现金分红比例描述',
    '现金分红-股息率', '每股收益', '每股净资产', '每股公积金',
    '每股未分配利润', '净利润同比增长', '总股本', '预案公告日',
    '股权登记日', '除权除息日', '方案进度', '最新公告日期'
  ];

  const rows = allData.map((item: any) => [
    item.REPORT_DATE ? new Date(item.REPORT_DATE).toISOString().split('T')[0] : null,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
    item.BONUS_IT_RATIO,
    item.BONUS_RATIO,
    item.TRANSFER_IT_RATIO,
    item.PRETAX_BONUS_RMB,
    item.PRETAX_BONUS_RMB_DESC,
    item.DIVIDEND_YIELD_RATIO,
    item.BASIC_EPS,
    item.BPS,
    item.CAPITAL_RESERVE_PS,
    item.UNDIST_PS,
    item.PROFIT_YOY_RATIO,
    item.TOTAL_SHARES,
    item.PLAN_NOTICE_DATE ? new Date(item.PLAN_NOTICE_DATE).toISOString().split('T')[0] : null,
    item.EQUITY_RECORD_DATE ? new Date(item.EQUITY_RECORD_DATE).toISOString().split('T')[0] : null,
    item.EX_DIVIDEND_DATE ? new Date(item.EX_DIVIDEND_DATE).toISOString().split('T')[0] : null,
    item.PROGRESS,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  // 按报告期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}
