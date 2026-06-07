/**
 * AKShare TypeScript - 东方财富-港股-财务报表
 * https://emweb.securities.eastmoney.com/PC_HKF10/FinancialAnalysis/index?type=web&code=00700
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富-港股-财务报表-三大报表
 *
 * @param stock 股票代码，如 "00700"
 * @param symbol 报表类型: "资产负债表", "利润表", "现金流量表"
 * @param indicator 指标类型: "年度", "报告期"
 */
export async function stock_financial_hk_report_em(
  stock: string = '00700',
  symbol: '资产负债表' | '利润表' | '现金流量表' = '资产负债表',
  indicator: '年度' | '报告期' = '年度'
): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';

  // First, get available report dates
  const reportParams = {
    reportName: 'RPT_CUSTOM_HKSK_APPFN_CASHFLOW_SUMMARY',
    columns: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,START_DATE,REPORT_DATE,FISCAL_YEAR,CURRENCY,ACCOUNT_STANDARD,REPORT_TYPE',
    quoteColumns: '',
    filter: `(SECUCODE="${stock}.HK")`,
    source: 'F10',
    client: 'PC',
  };

  const reportData = await httpGet<any>(url, { params: reportParams });

  if (!reportData?.result?.data?.[0]?.REPORT_LIST) {
    return createDataFrame([], []);
  }

  const reportList = reportData.result.data[0].REPORT_LIST;

  // Filter by indicator
  let filteredReports = reportList;
  if (indicator === '年度') {
    filteredReports = reportList.filter((item: any) => item.REPORT_TYPE === '年报');
  }

  const yearList = filteredReports.map((item: any) => item.REPORT_DATE.split(' ')[0]);

  if (yearList.length === 0) {
    return createDataFrame([], []);
  }

  // Determine report name
  let reportName: string;
  if (symbol === '资产负债表') {
    reportName = 'RPT_HKF10_FN_BALANCE_PC';
  } else if (symbol === '利润表') {
    reportName = 'RPT_HKF10_FN_INCOME_PC';
  } else {
    reportName = 'RPT_HKF10_FN_CASHFLOW_PC';
  }

  const yearFilter = yearList.map((y: string) => `'${y}'`).join(',');

  const detailParams = {
    reportName,
    columns: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,ORG_CODE,REPORT_DATE,DATE_TYPE_CODE,FISCAL_YEAR,STD_ITEM_CODE,STD_ITEM_NAME,AMOUNT,STD_REPORT_DATE',
    quoteColumns: '',
    filter: `(SECUCODE="${stock}.HK")(REPORT_DATE in (${yearFilter}))`,
    pageNumber: '1',
    pageSize: '',
    sortTypes: '-1,1',
    sortColumns: 'REPORT_DATE,STD_ITEM_CODE',
    source: 'F10',
    client: 'PC',
  };

  const detailData = await httpGet<any>(url, { params: detailParams });

  if (!detailData?.result?.data) {
    return createDataFrame([], []);
  }

  const resultData = detailData.result.data;
  if (resultData.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(resultData[0]);
  const rows = resultData.map((item: any) => columns.map(col => item[col]));

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-港股-财务分析-主要指标
 *
 * @param symbol 股票代码，如 "00700"
 * @param indicator 指标类型: "年度", "报告期"
 */
export async function stock_financial_hk_analysis_indicator_em(
  symbol: string = '00853',
  indicator: '年度' | '报告期' = '年度'
): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params: Record<string, string> = {
    reportName: 'RPT_HKF10_FN_MAININDICATOR',
    columns: 'HKF10_FN_MAININDICATOR',
    quoteColumns: '',
    pageNumber: '1',
    pageSize: '9',
    sortTypes: '-1',
    sortColumns: 'STD_REPORT_DATE',
    source: 'F10',
    client: 'PC',
  };

  if (indicator === '年度') {
    params.filter = `(SECUCODE="${symbol}.HK")(DATE_TYPE_CODE="001")`;
  } else {
    params.filter = `(SECUCODE="${symbol}.HK")`;
  }

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const resultData = data.result.data;
  if (resultData.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(resultData[0]);
  const rows = resultData.map((item: any) => columns.map(col => item[col]));

  return createDataFrame(columns, rows);
}
