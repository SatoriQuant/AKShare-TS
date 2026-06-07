/**
 * AKShare TypeScript - 深交所-融资融券数据
 * http://www.szse.cn/market/product/stock/list/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 深交所-融资融券-融资融券余额
 * http://www.szse.cn/market/product/stock/list/
 * @returns 融资融券余额数据
 */
export async function stock_margin_szse(start_date: string = '2023-01-01', end_date: string = '2023-12-31'): Promise<DataFrame> {
  const url = 'http://www.szse.cn/api/report/ShowReport/data';
  const params = {
    SHOWTYPE: 'JSON',
    CATALOGID: '1834_xxpl',
    txtDate: start_date,
    endDate: end_date,
  };

  const data = await httpGet<any>(url, { params });

  if (!data || data.length === 0 || !data[0]?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '融资余额', '融资买入额', '融资偿还额', '融资净买入',
    '融券余额', '融券卖出量', '融券偿还量', '融券净卖出', '融资融券余额'
  ];

  const rows = data[0].data.map((item: any) => [
    item.rq,
    parseFloat(item.rzye) || null,
    parseFloat(item.rzmre) || null,
    parseFloat(item.rzche) || null,
    parseFloat(item.rzjme) || null,
    parseFloat(item.rqye) || null,
    parseFloat(item.rqmcl) || null,
    parseFloat(item.rqchl) || null,
    parseFloat(item.rqjmg) || null,
    parseFloat(item.rzrqye) || null,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 深交所-融资融券-分市场数据
 * http://www.szse.cn/market/product/stock/list/
 * @param date 查询日期
 * @returns 分市场融资融券数据
 */
export async function stock_margin_detail_szse(date: string = '2023-12-29'): Promise<DataFrame> {
  const url = 'http://www.szse.cn/api/report/ShowReport/data';
  const params = {
    SHOWTYPE: 'JSON',
    CATALOGID: '1834_xxpl',
    txtDate: date,
    endDate: date,
  };

  const data = await httpGet<any>(url, { params });

  if (!data || data.length === 0 || !data[0]?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '证券代码', '证券简称', '融资余额', '融资买入额', '融资偿还额',
    '融券余额', '融券卖出量', '融券偿还量', '融券余量', '融资融券余额'
  ];

  const rows = data[0].data.map((item: any) => [
    item.zqdm,
    item.zqjc,
    parseFloat(item.rzye) || null,
    parseFloat(item.rzmre) || null,
    parseFloat(item.rzche) || null,
    parseFloat(item.rqye) || null,
    parseFloat(item.rqmcl) || null,
    parseFloat(item.rqchl) || null,
    parseFloat(item.rqyl) || null,
    parseFloat(item.rzrqye) || null,
  ]);

  return createDataFrame(columns, rows);
}
