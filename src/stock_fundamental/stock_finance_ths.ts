/**
 * AKShare TypeScript - 同花顺-财务指标
 * https://basic.10jqka.com.cn/new/000063/finance.html
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 根据股票代码判断所属市场
 */
function getMarketCode(stockCode: string): number {
  const code = stockCode.trim();
  if (code.startsWith('000') || code.startsWith('001') ||
      code.startsWith('002') || code.startsWith('003') || code.startsWith('300')) {
    return 33;
  }
  if (code.startsWith('600') || code.startsWith('601') ||
      code.startsWith('603') || code.startsWith('605') || code.startsWith('688')) {
    return 17;
  }
  if (code.startsWith('920')) {
    return 151;
  }
  return 0;
}

/**
 * 解析同花顺财务数据的通用函数
 */
function parseFinancialData(
  dataJson: any,
  indicator: string,
  reportKey: string = 'report',
  yearKey: string = 'year',
  simpleKey?: string
): DataFrame {
  if (!dataJson?.title) {
    return createDataFrame([], []);
  }

  const dfIndex = dataJson.title.map((item: any) =>
    Array.isArray(item) ? item[0] : item
  );

  let mainData: any[];
  let mainColumns: any[];

  if (indicator === '按报告期' || indicator === '报告期') {
    mainData = dataJson[reportKey]?.slice(1) || [];
    mainColumns = dataJson[reportKey]?.[0] || [];
  } else if (indicator === '按单季度' && simpleKey && dataJson[simpleKey]) {
    mainData = dataJson[simpleKey]?.slice(1) || [];
    mainColumns = dataJson[simpleKey]?.[0] || [];
  } else {
    mainData = dataJson[yearKey]?.slice(1) || [];
    mainColumns = dataJson[yearKey]?.[0] || [];
  }

  // Transpose: columns = report dates, rows = financial items
  const columns = ['报告期', ...dfIndex.slice(1)];
  const rows: any[][] = [];

  for (let i = 0; i < mainColumns.length; i++) {
    const row: any[] = [mainColumns[i]];
    for (let j = 1; j < dfIndex.length; j++) {
      if (mainData[j - 1] && mainData[j - 1][i] !== undefined) {
        const v = mainData[j - 1][i];
        row.push(v !== null && v !== '' ? Number(v) : v);
      } else {
        row.push(null);
      }
    }
    rows.push(row);
  }

  return createDataFrame(columns, rows);
}

/**
 * 同花顺-财务指标-主要指标
 *
 * @param symbol 股票代码，如 "000063"
 * @param indicator 指标类型: "按报告期" | "按年度" | "按单季度"
 */
export async function stock_financial_abstract_ths(
  symbol: string = '000063',
  indicator: '按报告期' | '按年度' | '按单季度' = '按报告期'
): Promise<DataFrame> {
  const url = `https://basic.10jqka.com.cn/new/${symbol}/finance.html`;
  const htmlText = await httpGetText(url);

  // Extract JSON from <p id="main">...</p>
  const mainMatch = htmlText.match(/<p[^>]*id="main"[^>]*>([\s\S]*?)<\/p>/);
  if (!mainMatch) {
    return createDataFrame([], []);
  }

  let dataJson: any;
  try {
    dataJson = JSON.parse(mainMatch[1]);
  } catch {
    return createDataFrame([], []);
  }

  return parseFinancialData(dataJson, indicator, 'report', 'year', 'simple');
}

/**
 * 同花顺-财务指标-资产负债表
 *
 * @param symbol 股票代码，如 "000063"
 * @param indicator 指标类型: "按报告期" | "按年度"
 */
export async function stock_financial_debt_ths(
  symbol: string = '000063',
  indicator: '按报告期' | '按年度' = '按报告期'
): Promise<DataFrame> {
  const url = `https://basic.10jqka.com.cn/api/stock/finance/${symbol}_debt.json`;
  const rawData = await httpGetText(url);

  let outerJson: any;
  try {
    outerJson = JSON.parse(rawData);
  } catch {
    return createDataFrame([], []);
  }

  let dataJson: any;
  try {
    dataJson = JSON.parse(outerJson.flashData);
  } catch {
    return createDataFrame([], []);
  }

  return parseFinancialData(dataJson, indicator, 'report', 'year');
}

/**
 * 同花顺-财务指标-利润表
 *
 * @param symbol 股票代码，如 "000063"
 * @param indicator 指标类型: "按报告期" | "按年度" | "按单季度"
 */
export async function stock_financial_benefit_ths(
  symbol: string = '000063',
  indicator: '按报告期' | '按年度' | '按单季度' = '按报告期'
): Promise<DataFrame> {
  const url = `https://basic.10jqka.com.cn/api/stock/finance/${symbol}_benefit.json`;
  const rawData = await httpGetText(url);

  let outerJson: any;
  try {
    outerJson = JSON.parse(rawData);
  } catch {
    return createDataFrame([], []);
  }

  let dataJson: any;
  try {
    dataJson = JSON.parse(outerJson.flashData);
  } catch {
    return createDataFrame([], []);
  }

  return parseFinancialData(dataJson, indicator, 'report', 'year', 'simple');
}

/**
 * 同花顺-财务指标-现金流量表
 *
 * @param symbol 股票代码，如 "000063"
 * @param indicator 指标类型: "按报告期" | "按年度" | "按单季度"
 */
export async function stock_financial_cash_ths(
  symbol: string = '000063',
  indicator: '按报告期' | '按年度' | '按单季度' = '按报告期'
): Promise<DataFrame> {
  const url = `https://basic.10jqka.com.cn/api/stock/finance/${symbol}_cash.json`;
  const rawData = await httpGetText(url);

  let outerJson: any;
  try {
    outerJson = JSON.parse(rawData);
  } catch {
    return createDataFrame([], []);
  }

  let dataJson: any;
  try {
    dataJson = JSON.parse(outerJson.flashData);
  } catch {
    return createDataFrame([], []);
  }

  return parseFinancialData(dataJson, indicator, 'report', 'year', 'simple');
}

/**
 * 同花顺-财务指标-重要指标 (新版API)
 *
 * @param symbol 股票代码，如 "000063"
 * @param indicator 指标类型: "按报告期" | "一季度" | "二季度" | "三季度" | "四季度" | "按年度"
 */
export async function stock_financial_abstract_new_ths(
  symbol: string = '000063',
  indicator: string = '按报告期'
): Promise<DataFrame> {
  const url = 'https://basic.10jqka.com.cn/basicapi/finance/index/v1/app_data/';

  const periodMap: Record<string, string> = {
    '按报告期': '0',
    '一季度': '1',
    '二季度': '2',
    '三季度': '3',
    '四季度': '4',
    '按年度': '4',
  };

  const params = {
    code: symbol,
    id: 'client_stock_importance',
    market: String(getMarketCode(symbol)),
    type: 'stock',
    page: '1',
    size: '50',
    period: periodMap[indicator] || '0',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.data) {
    return createDataFrame([], []);
  }

  const financialData = data.data.data;
  const records: any[] = [];
  const allMetricFields = new Set<string>();

  // First pass: collect all field names
  for (const report of financialData) {
    for (const [metricName, metricValues] of Object.entries(report.index_list)) {
      if (typeof metricValues === 'object' && metricValues !== null) {
        for (const field of Object.keys(metricValues as object)) {
          allMetricFields.add(field);
        }
      }
    }
  }

  // Second pass: build records
  for (const report of financialData) {
    for (const [metricName, metricValues] of Object.entries(report.index_list)) {
      const record: any = {
        report_date: report.date,
        report_name: report.report_name,
        report_period: report.report,
        quarter_name: report.quarter_name,
        metric_name: metricName,
      };

      if (typeof metricValues === 'object' && metricValues !== null) {
        for (const [field, value] of Object.entries(metricValues as object)) {
          record[field] = value;
        }
      } else {
        record.value = metricValues;
      }
      records.push(record);
    }
  }

  if (records.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(records[0]);
  const rows = records.map(record => columns.map(col => record[col]));

  return createDataFrame(columns, rows);
}

/**
 * 同花顺-财务指标-资产负债表 (新版API)
 *
 * @param symbol 股票代码，如 "000063"
 * @param indicator 指标类型: "按报告期" | "按年度"
 */
export async function stock_financial_debt_new_ths(
  symbol: string = '000063',
  indicator: '按报告期' | '按年度' = '按报告期'
): Promise<DataFrame> {
  const url = 'https://basic.10jqka.com.cn/basicapi/finance/index/v1/app_data/';
  const params = {
    code: symbol,
    id: 'client_stock_debt',
    market: String(getMarketCode(symbol)),
    type: 'stock',
    page: '1',
    size: '50',
    period: indicator === '按报告期' ? '0' : '4',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.data) {
    return createDataFrame([], []);
  }

  const financialData = data.data.data;
  const records: any[] = [];

  for (const report of financialData) {
    for (const [metricName, metricValues] of Object.entries(report.index_list)) {
      const record: any = {
        report_date: report.date,
        report_name: report.report_name,
        report_period: report.report,
        quarter_name: report.quarter_name,
        metric_name: metricName,
      };

      if (typeof metricValues === 'object' && metricValues !== null) {
        for (const [field, value] of Object.entries(metricValues as object)) {
          record[field] = value;
        }
      } else {
        record.value = metricValues;
      }
      records.push(record);
    }
  }

  if (records.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(records[0]);
  const rows = records.map(record => columns.map(col => record[col]));

  return createDataFrame(columns, rows);
}

/**
 * 同花顺-财务指标-利润表 (新版API)
 *
 * @param symbol 股票代码，如 "000063"
 * @param indicator 指标类型: "按报告期" | "一季度" | "二季度" | "三季度" | "四季度" | "按年度"
 */
export async function stock_financial_benefit_new_ths(
  symbol: string = '000063',
  indicator: string = '按报告期'
): Promise<DataFrame> {
  const url = 'https://basic.10jqka.com.cn/basicapi/finance/index/v1/app_data/';

  const periodMap: Record<string, string> = {
    '按报告期': '0',
    '一季度': '1',
    '二季度': '2',
    '三季度': '3',
    '四季度': '4',
    '按年度': '4',
  };

  const params = {
    code: symbol,
    id: 'client_stock_benefit',
    market: String(getMarketCode(symbol)),
    type: 'stock',
    page: '1',
    size: '50',
    period: periodMap[indicator] || '0',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.data) {
    return createDataFrame([], []);
  }

  const financialData = data.data.data;
  const records: any[] = [];

  for (const report of financialData) {
    for (const [metricName, metricValues] of Object.entries(report.index_list)) {
      const record: any = {
        report_date: report.date,
        report_name: report.report_name,
        report_period: report.report,
        quarter_name: report.quarter_name,
        metric_name: metricName,
      };

      if (typeof metricValues === 'object' && metricValues !== null) {
        for (const [field, value] of Object.entries(metricValues as object)) {
          record[field] = value;
        }
      } else {
        record.value = metricValues;
      }
      records.push(record);
    }
  }

  if (records.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(records[0]);
  const rows = records.map(record => columns.map(col => record[col]));

  return createDataFrame(columns, rows);
}

/**
 * 同花顺-财务指标-现金流量表 (新版API)
 *
 * @param symbol 股票代码，如 "000063"
 * @param indicator 指标类型: "按报告期" | "一季度" | "二季度" | "三季度" | "四季度" | "按年度"
 */
export async function stock_financial_cash_new_ths(
  symbol: string = '000063',
  indicator: string = '按报告期'
): Promise<DataFrame> {
  const url = 'https://basic.10jqka.com.cn/basicapi/finance/index/v1/app_data/';

  const periodMap: Record<string, string> = {
    '按报告期': '0',
    '一季度': '1',
    '二季度': '2',
    '三季度': '3',
    '四季度': '4',
    '按年度': '4',
  };

  const params = {
    code: symbol,
    id: 'client_stock_cash',
    market: String(getMarketCode(symbol)),
    type: 'stock',
    page: '1',
    size: '50',
    period: periodMap[indicator] || '0',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.data) {
    return createDataFrame([], []);
  }

  const financialData = data.data.data;
  const records: any[] = [];

  for (const report of financialData) {
    for (const [metricName, metricValues] of Object.entries(report.index_list)) {
      const record: any = {
        report_date: report.date,
        report_name: report.report_name,
        report_period: report.report,
        quarter_name: report.quarter_name,
        metric_name: metricName,
      };

      if (typeof metricValues === 'object' && metricValues !== null) {
        for (const [field, value] of Object.entries(metricValues as object)) {
          record[field] = value;
        }
      } else {
        record.value = metricValues;
      }
      records.push(record);
    }
  }

  if (records.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(records[0]);
  const rows = records.map(record => columns.map(col => record[col]));

  return createDataFrame(columns, rows);
}

/**
 * 同花顺-公司大事-高管持股变动
 *
 * @param symbol 股票代码，如 "688981"
 */
export async function stock_management_change_ths(symbol: string = '688981'): Promise<DataFrame> {
  const columns = ['变动日期', '姓名', '变动数量', '交易均价', '剩余股数', '变动原因'];
  // Requires HTML parsing with BeautifulSoup-like functionality
  return createDataFrame(columns, []);
}

/**
 * 同花顺-公司大事-股东持股变动
 *
 * @param symbol 股票代码，如 "688981"
 */
export async function stock_shareholder_change_ths(symbol: string = '688981'): Promise<DataFrame> {
  const columns = ['公告日期', '股东名称', '变动数量', '交易均价', '剩余股份总数'];
  // Requires HTML parsing with BeautifulSoup-like functionality
  return createDataFrame(columns, []);
}
