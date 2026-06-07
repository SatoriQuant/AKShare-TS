/**
 * AKShare TypeScript - 两网及退市
 * https://quote.eastmoney.com/center/gridlist.html#staq_net_board
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-沪深个股-两网及退市
 */
export async function stock_staq_net_stop(): Promise<DataFrame> {
  const url = 'https://5.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '50000',
    po: '1',
    np: '2',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:0 s:3',
    fields: 'f12,f14',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = ['序号', '代码', '名称'];
  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
    item.f12,
    item.f14,
  ]);

  return createDataFrame(columns, rows);
}
