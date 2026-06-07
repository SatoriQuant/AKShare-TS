/**
 * AKShare TypeScript - 东方财富-数据中心-年报季报
 * https://data.eastmoney.com/bbsj/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-年报季报-业绩快报-业绩报表
 * https://data.eastmoney.com/bbsj/202003/yjbb.html
 * @param date 报告期，如 "20200331", "20200630", "20200930", "20201231"
 * @returns 业绩报表数据
 */
export async function stock_yjbb_em_report(date: string = '20200331'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'UPDATE_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_LICO_FN_CPD',
    columns: 'ALL',
    filter: `(REPORTDATE='${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}')`,
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
    '序号', '股票代码', '股票简称', '每股收益', '营业总收入-营业总收入',
    '营业总收入-同比增长', '营业总收入-季度环比增长', '净利润-净利润',
    '净利润-同比增长', '净利润-季度环比增长', '每股净资产', '净资产收益率',
    '每股经营现金流量', '销售毛利率', '所处行业', '最新公告日期'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.BASIC_EPS,
    item.TOTAL_OPERATE_INCOME,
    item.YSTZ,
    item.SJLTZ,
    item.PARENT_NETPROFIT,
    item.NETPROFIT_YSTZ,
    item.NETPROFIT_SJLTZ,
    item.BPS,
    item.WEIGHTAVG_ROE,
    item.MGJYXJJE,
    item.XSMLL,
    item.INDUSTRY,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-年报季报-业绩快报
 * https://data.eastmoney.com/bbsj/202003/yjkb.html
 * @param date 报告期，如 "20200331", "20200630", "20200930", "20201231"
 * @returns 业绩快报数据
 */
export async function stock_yjkb_em(date: string = '20200331'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'UPDATE_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_FCI_PERFORMANCEE',
    columns: 'ALL',
    filter: `(REPORT_DATE='${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}')`,
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
    '序号', '股票代码', '股票简称', '预计营业收入', '预计净利润',
    '营业收入变化', '净利润变化', '每股收益', '每股净资产', '净资产收益率',
    '所处行业', '最新公告日期'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.ESTIMATE_OPERATE_INCOME,
    item.ESTIMATE_NET_PROFIT,
    item.OPERATE_INCOME_YOY,
    item.NET_PROFIT_YOY,
    item.EPS,
    item.BPS,
    item.ROE,
    item.INDUSTRY,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-年报季报-业绩预告
 * https://data.eastmoney.com/bbsj/202003/yjyg.html
 * @param date 报告期，如 "20200331", "20200630", "20200930", "20201231"
 * @returns 业绩预告数据
 */
export async function stock_yjyg_em(date: string = '20200331'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'UPDATE_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_PUBLIC_OP_NEWPREDICT',
    columns: 'ALL',
    filter: `(REPORT_DATE='${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}')`,
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
    '序号', '股票代码', '股票简称', '预告类型', '预告净利润', '预告净利润增长',
    '预告营业收入', '预告营业收入增长', '所处行业', '最新公告日期'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.PREDICT_FINANCE_CODE,
    item.PREDICT_FINANCE_EXPLAIN,
    item.CHANGE_REASON_EXPLAIN,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-年报季报-分红送配
 * https://data.eastmoney.com/yjfp/
 * @param date 报告期，如 "20231231"
 * @returns 分红送配数据
 */
export async function stock_fhps_em_report(date: string = '20231231'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
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
    filter: `(REPORT_DATE='${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}')`,
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
    '代码', '名称', '送转股份-送转总比例', '送转股份-送转比例', '送转股份-转股比例',
    '现金分红-现金分红比例', '现金分红-股息率', '每股收益', '每股净资产', '每股公积金',
    '每股未分配利润', '净利润同比增长', '总股本', '预案公告日', '股权登记日',
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
    item.UNDISTRIBUTED_PS,
    item.YSTZ,
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
 * 东方财富-数据中心-年报季报-分红送配详情
 * https://data.eastmoney.com/yjfp/detail/300073.html
 * @param symbol 股票代码
 * @returns 分红送配详情数据
 */
export async function stock_fhps_detail_em_report(symbol: string = '300073'): Promise<DataFrame> {
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
    '送转股份-送转总比例', '送转股份-送股比例', '送转股份-转股比例',
    '现金分红-现金分红比例', '业绩披露日期', '股权登记日', '除权除息日',
    '报告期', '方案进度', '现金分红-现金分红比例描述', '最新公告日期',
    '每股收益', '每股净资产', '每股公积金', '每股未分配利润', '净利润同比增长',
    '总股本', '现金分红-股息率'
  ];

  const rows = allData.map((item: any) => [
    item.BONUS_IT_RATIO,
    item.BONUS_RATIO,
    item.TRANSFER_IT_RATIO,
    item.PRETAX_BONUS_RMB,
    item.PLAN_NOTICE_DATE ? new Date(item.PLAN_NOTICE_DATE).toISOString().split('T')[0] : null,
    item.EQUITY_RECORD_DATE ? new Date(item.EQUITY_RECORD_DATE).toISOString().split('T')[0] : null,
    item.EX_DIVIDEND_DATE ? new Date(item.EX_DIVIDEND_DATE).toISOString().split('T')[0] : null,
    item.REPORT_DATE ? new Date(item.REPORT_DATE).toISOString().split('T')[0] : null,
    item.PROGRESS,
    item.PRETAX_BONUS_RMB_DESC,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
    item.BASIC_EPS,
    item.BPS,
    item.CAPITAL_RESERVE_PS,
    item.UNDISTRIBUTED_PS,
    item.YSTZ,
    item.TOTAL_SHARES,
    item.DIVIDEND_YIELD_RATIO,
  ]);

  return createDataFrame(columns, rows);
}
