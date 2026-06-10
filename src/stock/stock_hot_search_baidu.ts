/**
 * AKShare TypeScript - 百度股市通热搜股票
 * https://gushitong.baidu.com/hotlist
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 百度股市通-热搜股票
 *
 * @param symbol 市场：全部, A股, 港股, 美股
 * @param date 日期，格式 "20250616"
 * @param time 时间范围：今日, 1小时
 */
export async function stock_hot_search_baidu(
  symbol: '全部' | 'A股' | '港股' | '美股' = 'A股',
  date: string = '20250616',
  time: '今日' | '1小时' = '今日'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '全部': 'all',
    'A股': 'ab',
    '港股': 'hk',
    '美股': 'us',
  };

  const hour = new Date().getHours();
  const url = 'https://finance.pae.baidu.com/selfselect/listsugrecomm';
  const params = {
    bizType: 'wisexmlnew',
    dsp: 'iphone',
    product: 'search',
    style: 'tablelist',
    market: symbolMap[symbol],
    type: time,
    day: date,
    hour: hour.toString(),
    pn: '0',
    rn: '12',
    finClientType: 'pc',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.Result?.list?.body) {
    return createDataFrame([], []);
  }

  const columns = ['名称/代码', '涨跌幅', '综合热度'];
  const rows = data.Result.list.body.map((item: any) => [
    item.name,
    item.pxChangeRate,
    item.heat,
  ]);

  return createDataFrame(columns, rows);
}
