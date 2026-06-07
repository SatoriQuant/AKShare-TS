/**
 * AKShare TypeScript - 申万宏源研究-基金指数接口
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 申万宏源研究-申万指数-指数发布-基金指数-实时行情
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex
 *
 * @param symbol 选择: "基础一级", "基础二级", "基础三级", "特色指数"
 */
export async function index_realtime_fund_sw(
  symbol: '基础一级' | '基础二级' | '基础三级' | '特色指数' = '基础一级'
): Promise<DataFrame> {
  const url = 'https://www.swsresearch.com/insWechatSw/fundIndex/pageList';
  const payload = {
    pageNo: 1,
    pageSize: 50,
    indexTypeName: symbol,
    sortField: '',
    rule: '',
    indexType: 1,
  };

  const data = await httpPost<any>(url, payload);

  if (!data?.data?.list) {
    return createDataFrame([], []);
  }

  const columns = ['指数代码', '指数名称', '昨收盘', '日涨跌幅', '年涨跌幅'];

  const rows = data.data.list.map((item: any) => [
    item.swIndexCode,
    item.swIndexName,
    parseFloat(item.lastCloseIndex),
    parseFloat(item.lastMarkup),
    parseFloat(item.yearMarkup),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 申万宏源研究-申万指数-指数发布-基金指数-历史行情
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex/fundDetail?code=807100
 *
 * @param symbol 基金指数代码，如 "807200"
 * @param period 周期：day, week, month
 */
export async function index_hist_fund_sw(
  symbol: string = '807200',
  period: 'day' | 'week' | 'month' = 'day'
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    day: 'DAY',
    week: 'WEEK',
    month: 'MONTH',
  };

  const url = 'https://www.swsresearch.com/insWechatSw/fundIndex/getFundKChartData';
  const payload = {
    swIndexCode: symbol,
    type: periodMap[period],
  };

  const data = await httpPost<any>(url, payload);

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '收盘指数', '开盘指数', '最高指数', '最低指数', '涨跌幅'];

  const rows = data.data.map((item: any) => [
    item.bargaindate,
    parseFloat(item.closeindex),
    parseFloat(item.openindex),
    parseFloat(item.maxindex),
    parseFloat(item.minindex),
    parseFloat(item.markup),
  ]);

  return createDataFrame(columns, rows);
}
