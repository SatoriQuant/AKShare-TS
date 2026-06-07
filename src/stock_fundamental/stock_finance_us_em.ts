/**
 * AKShare TypeScript - 东方财富-美股-财务报表
 * https://emweb.eastmoney.com/PC_USF10/pages/index.html?code=TSLA&type=web&color=w#/cwfx
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 查询美股的 SECUCODE（内部代码）
 */
async function queryMarketCode(symbol: string): Promise<string> {
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_USF10_INFO_ORGPROFILE',
    columns: 'SECUCODE,SECURITY_CODE,ORG_CODE,SECURITY_INNER_CODE,ORG_NAME',
    quoteColumns: '',
    filter: `(SECURITY_CODE="${symbol}")`,
    pageNumber: '1',
    pageSize: '200',
    sortTypes: '',
    sortColumns: '',
    source: 'SECURITIES',
    client: 'PC',
  };

  const data = await httpGet<any>(url, { params });
  return data?.result?.data?.[0]?.SECUCODE || symbol;
}

/**
 * 获取可用的报告期列表
 */
async function getReportPeriods(
  stock: string,
  symbol: string,
  indicator: string
): Promise<string[]> {
  const secuCode = await queryMarketCode(stock);

  let reportName: string;
  if (symbol === '资产负债表') {
    reportName = 'RPT_USF10_FN_BALANCE';
  } else if (symbol === '综合损益表') {
    reportName = 'RPT_USF10_FN_INCOME';
  } else {
    reportName = 'RPT_USSK_FN_CASHFLOW';
  }

  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName,
    columns: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,REPORT,REPORT_DATE,FISCAL_YEAR,CURRENCY,ACCOUNT_STANDARD,REPORT_TYPE,DATE_TYPE_CODE',
    quoteColumns: '',
    filter: `(SECUCODE="${secuCode}")`,
    pageNumber: '',
    pageSize: '',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'SECURITIES',
    client: 'PC',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return [];
  }

  const reports = data.result.data;
  const allReports = [...new Set(reports.map((item: any) => item.REPORT?.trim()))] as string[];

  let filtered: string[];
  if (indicator === '年报') {
    filtered = allReports.filter(r => r.includes('FY'));
  } else if (indicator === '单季报') {
    filtered = allReports.filter(r => r.includes('Q1') || r.includes('Q2') || r.includes('Q3') || r.includes('Q4'));
  } else {
    filtered = allReports.filter(r => r.includes('Q6') || r.includes('Q9'));
  }

  return filtered.sort((a, b) => {
    const yearA = parseInt(a.split('/')[0]);
    const yearB = parseInt(b.split('/')[0]);
    return yearB - yearA;
  });
}

/**
 * 东方财富-美股-财务分析-三大报表
 *
 * @param stock 股票代码，如 "TSLA"
 * @param symbol 报表类型: "资产负债表", "综合损益表", "现金流量表"
 * @param indicator 指标类型: "年报", "单季报", "累计季报"
 */
export async function stock_financial_us_report_em(
  stock: string = 'TSLA',
  symbol: '资产负债表' | '综合损益表' | '现金流量表' = '资产负债表',
  indicator: '年报' | '单季报' | '累计季报' = '年报'
): Promise<DataFrame> {
  const secuCode = await queryMarketCode(stock);
  const periods = await getReportPeriods(stock, symbol, indicator);

  if (periods.length === 0) {
    return createDataFrame([], []);
  }

  let reportName: string;
  if (symbol === '资产负债表') {
    reportName = 'RPT_USF10_FN_BALANCE';
  } else if (symbol === '综合损益表') {
    reportName = 'RPT_USF10_FN_INCOME';
  } else {
    reportName = 'RPT_USSK_FN_CASHFLOW';
  }

  const periodsStr = `(${periods.map(p => `"${p}"`).join(',')})`;

  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName,
    columns: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,REPORT_DATE,REPORT_TYPE,REPORT,STD_ITEM_CODE,AMOUNT,ITEM_NAME',
    quoteColumns: '',
    filter: `(SECUCODE="${secuCode}")(REPORT in ${periodsStr})`,
    pageNumber: '',
    pageSize: '',
    sortTypes: '1,-1',
    sortColumns: 'STD_ITEM_CODE,REPORT_DATE',
    source: 'SECURITIES',
    client: 'PC',
  };

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

/**
 * 东方财富-美股-财务分析-主要指标
 *
 * @param symbol 股票代码，如 "TSLA"
 * @param indicator 指标类型: "年报", "单季报", "累计季报"
 */
export async function stock_financial_us_analysis_indicator_em(
  symbol: string = 'TSLA',
  indicator: '年报' | '单季报' | '累计季报' = '年报'
): Promise<DataFrame> {
  const secuCode = await queryMarketCode(symbol);

  let reportName = 'RPT_USF10_FN_GMAININDICATOR';
  let columnsStr = 'USF10_FN_GMAININDICATOR';

  // For certain codes (with underscore), use different report
  if (secuCode.includes('_')) {
    reportName = 'RPT_USF10_FN_IMAININDICATOR';
    columnsStr = 'ORG_CODE,SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,SECURITY_INNER_CODE,STD_REPORT_DATE,REPORT_DATE,DATE_TYPE,DATE_TYPE_CODE,REPORT_TYPE,REPORT_DATA_TYPE,FISCAL_YEAR,START_DATE,NOTICE_DATE,ACCOUNT_STANDARD,ACCOUNT_STANDARD_NAME,CURRENCY,CURRENCY_NAME,ORGTYPE,TOTAL_INCOME,TOTAL_INCOME_YOY,PREMIUM_INCOME,PREMIUM_INCOME_YOY,PARENT_HOLDER_NETPROFIT,PARENT_HOLDER_NETPROFIT_YOY,BASIC_EPS_CS,BASIC_EPS_CS_YOY,DILUTED_EPS_CS,PAYOUT_RATIO,CAPITIAL_RATIO,ROE,ROE_YOY,ROA,ROA_YOY,DEBT_RATIO,DEBT_RATIO_YOY,EQUITY_RATIO';
  }

  let filterStr: string;
  if (indicator === '年报') {
    filterStr = `(SECUCODE="${secuCode}")(DATE_TYPE_CODE="001")`;
  } else if (indicator === '单季报') {
    filterStr = `(SECUCODE="${secuCode}")(DATE_TYPE_CODE in ("003","006","007","008"))`;
  } else {
    filterStr = `(SECUCODE="${secuCode}")(DATE_TYPE_CODE in ("002","004"))`;
  }

  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName,
    columns: columnsStr,
    quoteColumns: '',
    pageNumber: '',
    pageSize: '',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'SECURITIES',
    client: 'PC',
    filter: filterStr,
  };

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
