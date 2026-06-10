/**
 * AKShare TypeScript - 上交所-融资融券数据
 * http://www.sse.com.cn/market/oTradingData/ margin/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 上交所-融资融券-融资融券余额
 * http://www.sse.com.cn/market/oTradingData/ margin/
 * @returns 融资融券余额数据
 */
export async function stock_margin_sse(start_date: string = '2023-01-01', end_date: string = '2023-12-31'): Promise<DataFrame> {
  const url = 'http://query.sse.com.cn/marketdata/tradedata/query/rzyrqjy/getRzyrqjy';
  const params = {
    isPagination: 'true',
    'pageHelp.pageSize': '500',
    'pageHelp.pageNo': '1',
    'pageHelp.beginPage': '1',
    'pageHelp.endPage': '1',
    startDate: start_date,
    endDate: end_date,
  };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Referer': 'http://www.sse.com.cn/',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.result) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '融资余额', '融资买入额', '融资偿还额', '融资净买入',
    '融券余额', '融券卖出量', '融券偿还量', '融券净卖出', '融资融券余额'
  ];

  const rows = data.result.map((item: any) => [
    item.date,
    item.rzye,
    item.rzmre,
    item.rzche,
    item.rzjme,
    item.rqye,
    item.rqmcl,
    item.rqchl,
    item.rqjmg,
    item.rzrqye,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 上交所-融资融券-分市场数据
 * http://www.sse.com.cn/market/oTradingData/ margin/
 * @returns 分市场融资融券数据
 */
export async function stock_margin_detail_sse(date: string = '2023-12-29'): Promise<DataFrame> {
  const url = 'http://query.sse.com.cn/marketdata/tradedata/query/rzyrqjy/getRzyrqmx';
  const params = {
    isPagination: 'true',
    'pageHelp.pageSize': '500',
    'pageHelp.pageNo': '1',
    'pageHelp.beginPage': '1',
    'pageHelp.endPage': '1',
    startDate: date,
    endDate: date,
  };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Referer': 'http://www.sse.com.cn/',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.result) {
    return createDataFrame([], []);
  }

  const columns = [
    '标的证券代码', '标的证券简称', '融资余额', '融资买入额', '融资偿还额',
    '融券余额', '融券卖出量', '融券偿还量', '融券余量', '融资融券余额'
  ];

  const rows = data.result.map((item: any) => [
    item.stockCode,
    item.stockName,
    item.rzye,
    item.rzmre,
    item.rzche,
    item.rqye,
    item.rqmcl,
    item.rqchl,
    item.rqyl,
    item.rzrqye,
  ]);

  return createDataFrame(columns, rows);
}
