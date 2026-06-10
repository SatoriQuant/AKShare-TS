/**
 * AKShare TypeScript - 申万宏源指数数据接口
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 申万宏源研究-指数发布-指数详情-指数历史数据
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex/releasedetail?code=801001
 *
 * @param symbol 指数代码，如 "801030"
 * @param period 周期：day, week, month
 */
export async function index_hist_sw(
  symbol: string = '801030',
  period: 'day' | 'week' | 'month' = 'day'
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    day: 'DAY',
    week: 'WEEK',
    month: 'MONTH',
  };

  const url = 'https://www.swsresearch.com/institute-sw/api/index_publish/trend/';
  const params = {
    swindexcode: symbol,
    period: periodMap[period],
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['代码', '日期', '收盘', '开盘', '最高', '最低', '成交量', '成交额'];

  const rows = data.data.map((item: any) => [
    item.swindexcode,
    item.bargaindate,
    parseFloat(item.closeindex),
    parseFloat(item.openindex),
    parseFloat(item.maxindex),
    parseFloat(item.minindex),
    item.bargainamount,
    item.bargainsum,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 申万宏源研究-指数发布-指数详情-指数分时数据
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex/releasedetail?code=801001
 *
 * @param symbol 指数代码，如 "801001"
 */
export async function index_min_sw(symbol: string = '801001'): Promise<DataFrame> {
  const url = 'https://www.swsresearch.com/institute-sw/api/index_publish/details/timelines/';
  const params = {
    swindexcode: symbol,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['代码', '名称', '价格', '日期', '时间'];

  const rows = data.data.map((item: any) => [
    item.l1,
    item.l2,
    parseFloat(item.l8),
    item.trading_date,
    item.trading_time,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 申万宏源研究-指数发布-指数详情-成分股
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex/releasedetail?code=801001
 *
 * @param symbol 指数代码，如 "801001"
 */
export async function index_component_sw(symbol: string = '801001'): Promise<DataFrame> {
  const url = 'https://www.swsresearch.com/institute-sw/api/index_publish/details/component_stocks/';
  const params = {
    swindexcode: symbol,
    page: '1',
    page_size: '10000',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.results) {
    return createDataFrame([], []);
  }

  const columns = ['序号', '证券代码', '证券名称', '最新权重', '计入日期'];

  const rows = data.data.results.map((item: any, idx: number) => [
    idx + 1,
    item.stockcode,
    item.stockname,
    parseFloat(item.newweight),
    item.beginningdate,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 申万宏源研究-指数系列-实时行情
 * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex
 *
 * @param symbol 选择: "市场表征", "一级行业", "二级行业", "风格指数", "大类风格指数", "金创指数"
 */
export async function index_realtime_sw(
  symbol: '市场表征' | '一级行业' | '二级行业' | '风格指数' | '大类风格指数' | '金创指数' = '二级行业'
): Promise<DataFrame> {
  // 大类风格指数 and 金创指数 use a different endpoint
  if (symbol === '大类风格指数' || symbol === '金创指数') {
    const url = 'https://www.swsresearch.com/insWechatSw/dflgOrJcIndex/pageList';
    const payload = {
      pageNo: 1,
      pageSize: 10,
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

  const url = 'https://www.swsresearch.com/institute-sw/api/index_publish/current/';
  const params = {
    page: '1',
    page_size: '50',
    indextype: symbol,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.results) {
    return createDataFrame([], []);
  }

  // Simple version: just get first page for now
  const columns = [
    '指数代码', '指数名称', '昨收盘', '今开盘', '最新价',
    '成交额', '成交量', '最高价', '最低价',
  ];

  const rows = data.data.results.map((item: any[]) => [
    item[0],
    item[1],
    parseFloat(item[2]),
    parseFloat(item[3]),
    parseFloat(item[6]),
    item[4],
    item[7],
    parseFloat(item[5]),
    parseFloat(item[8]),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 申万宏源研究-指数分析-日报告
 * https://www.swsresearch.com/institute_sw/allIndex/analysisIndex
 *
 * @param symbol 选择: "市场表征", "一级行业", "二级行业", "风格指数"
 * @param startDate 开始日期，格式 "20221103"
 * @param endDate 结束日期，格式 "20221103"
 */
export async function index_analysis_daily_sw(
  symbol: '市场表征' | '一级行业' | '二级行业' | '风格指数' = '市场表征',
  startDate: string = '20221103',
  endDate: string = '20221103'
): Promise<DataFrame> {
  const format = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;

  const url = 'https://www.swsresearch.com/institute-sw/api/index_analysis/index_analysis_report/';
  const params = {
    page: '1',
    page_size: '50',
    index_type: symbol,
    start_date: format(startDate),
    end_date: format(endDate),
    type: 'DAY',
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
