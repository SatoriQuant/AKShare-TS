/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-股票账户统计
 * https://data.eastmoney.com/cjsj/gpkhsj.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-股票账户统计
 * https://data.eastmoney.com/cjsj/gpkhsj.html
 * @returns 股票账户统计数据
 */
export async function stock_account_statistics_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_STOCK_OPEN_DATA',
    columns: 'ALL',
    pageSize: '500',
    sortColumns: 'STATISTICS_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    p: '1',
    pageNo: '1',
    pageNum: '1',
    pageNumber: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '数据日期', '新增投资者-数量', '新增投资者-环比', '新增投资者-同比',
    '期末投资者-总量', '期末投资者-A股账户', '期末投资者-B股账户',
    '沪深总市值', '沪深户均市值', '上证指数-收盘', '上证指数-涨跌幅'
  ];

  const rows = data.result.data.map((item: any) => [
    item.STATISTICS_DATE ? new Date(item.STATISTICS_DATE).toISOString().split('T')[0] : null,
    item.NEW_INVESTOR_NUM,
    item.NEW_INVESTOR_RATIO,
    item.NEW_INVESTOR_SAME_RATIO,
    item.END_INVESTOR_TOTAL,
    item.END_INVESTOR_A,
    item.END_INVESTOR_B,
    item.TOTAL_MARKET_CAP,
    item.AVG_MARKET_CAP,
    item.SH_INDEX_CLOSE,
    item.SH_INDEX_CHANGE,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}
