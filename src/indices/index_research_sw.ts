/**
 * AKShare TypeScript - 申万宏源研究指数接口
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 申万宏源研究-指数分析-周/月报表-日期序列
 * https://www.swsresearch.com/institute_sw/allIndex/analysisIndex
 *
 * @param symbol 选择: "week", "month"
 */
export async function index_analysis_week_month_sw(
  symbol: 'week' | 'month' = 'month'
): Promise<DataFrame> {
  const url = 'https://www.swsresearch.com/institute-sw/api/index_analysis/week_month_datetime/';
  const params = { type: symbol.toUpperCase() };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['date'];

  const rows = data.data.map((item: any) => [item.bargaindate]);

  return createDataFrame(columns, rows);
}

/**
 * 申万宏源研究-指数分析-周报告
 * https://www.swsresearch.com/institute_sw/allIndex/analysisIndex
 *
 * @param symbol 选择: "市场表征", "一级行业", "二级行业", "风格指数"
 * @param date 查询日期，格式 "20221104"
 */
export async function index_analysis_weekly_sw(
  symbol: '市场表征' | '一级行业' | '二级行业' | '风格指数' = '市场表征',
  date: string = '20221104'
): Promise<DataFrame> {
  const format = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;

  const url = 'https://www.swsresearch.com/institute-sw/api/index_analysis/index_analysis_reports/';
  const params = {
    page: '1',
    page_size: '50',
    index_type: symbol,
    bargaindate: format(date),
    type: 'WEEK',
    swindexcode: 'all',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.results) {
    return createDataFrame([], []);
  }

  const columns = [
    '指数代码', '指数名称', '发布日期', '收盘指数', '成交量',
    '涨跌幅', '换手率', '市盈率', '市净率', '均价',
    '成交额占比', '流通市值', '平均流通市值', '股息率',
  ];

  const rows = data.data.results.map((item: any) => [
    item.swindexcode,
    item.swindexname,
    item.bargaindate,
    parseFloat(item.closeindex),
    item.bargainamount,
    parseFloat(item.markup),
    parseFloat(item.turnoverrate),
    parseFloat(item.pe),
    parseFloat(item.pb),
    parseFloat(item.meanprice),
    parseFloat(item.bargainsumrate),
    item.negotiablessharesum1,
    item.negotiablessharesum2,
    parseFloat(item.dp),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 申万宏源研究-指数分析-月报告
 * https://www.swsresearch.com/institute_sw/allIndex/analysisIndex
 *
 * @param symbol 选择: "市场表征", "一级行业", "二级行业", "风格指数"
 * @param date 查询日期，格式 "20221031"
 */
export async function index_analysis_monthly_sw(
  symbol: '市场表征' | '一级行业' | '二级行业' | '风格指数' = '市场表征',
  date: string = '20221031'
): Promise<DataFrame> {
  const format = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;

  const url = 'https://www.swsresearch.com/institute-sw/api/index_analysis/index_analysis_reports/';
  const params = {
    page: '1',
    page_size: '50',
    index_type: symbol,
    bargaindate: format(date),
    type: 'MONTH',
    swindexcode: 'all',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.results) {
    return createDataFrame([], []);
  }

  const columns = [
    '指数代码', '指数名称', '发布日期', '收盘指数', '成交量',
    '涨跌幅', '换手率', '市盈率', '市净率', '均价',
    '成交额占比', '流通市值', '平均流通市值', '股息率',
  ];

  const rows = data.data.results.map((item: any) => [
    item.swindexcode,
    item.swindexname,
    item.bargaindate,
    parseFloat(item.closeindex),
    item.bargainamount,
    parseFloat(item.markup),
    parseFloat(item.turnoverrate),
    parseFloat(item.pe),
    parseFloat(item.pb),
    parseFloat(item.meanprice),
    parseFloat(item.bargainsumrate),
    item.negotiablessharesum1,
    item.negotiablessharesum2,
    parseFloat(item.dp),
  ]);

  return createDataFrame(columns, rows);
}
