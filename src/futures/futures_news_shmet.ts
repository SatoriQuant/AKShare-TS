/**
 * AKShare TypeScript - 上海金属网-快讯
 * https://www.shmet.com/newsFlash/newsFlash.html
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

type ShmetSymbol =
  | '全部'
  | '要闻'
  | 'VIP'
  | '财经'
  | '铜'
  | '铝'
  | '铅'
  | '锌'
  | '镍'
  | '锡'
  | '贵金属'
  | '小金属';

/**
 * 上海金属网-快讯
 * https://www.shmet.com/newsFlash/newsFlash.html
 *
 * @param symbol 分类：全部, 要闻, VIP, 财经, 铜, 铝, 铅, 锌, 镍, 锡, 贵金属, 小金属
 */
export async function futures_news_shmet(
  symbol: ShmetSymbol = '全部'
): Promise<DataFrame> {
  const url = 'https://www.shmet.com/api/rest/news/queryNewsflashList';

  const symbolMap: Record<string, string> = {
    '要闻': '0',
    'VIP': '100',
    '财经': '999',
    '铜': '1002',
    '铝': '1003',
    '铅': '1005',
    '锌': '1004',
    '镍': '1006',
    '锡': '1007',
    '贵金属': '1008',
    '小金属': '1009',
  };

  let payload: Record<string, any>;
  if (symbol === '全部') {
    payload = { currentPage: 1, pageSize: 100 };
  } else {
    payload = {
      currentPage: 1,
      pageSize: 2000,
      content: '',
      flashTag: symbolMap[symbol],
    };
  }

  try {
    const data = await httpPost<any>(url, payload);

    if (!data?.data?.dataList) {
      return createDataFrame([], []);
    }

    const columns = ['发布时间', '内容'];

    const rows = data.data.dataList.map((item: any[]) => {
      // dataList items are arrays; index 3 is time, index 5 is content
      const timestamp = item[3];
      const content = item[5] || '';

      let publishTime = '';
      if (timestamp) {
        try {
          const date = new Date(timestamp);
          publishTime = date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        } catch {
          publishTime = String(timestamp);
        }
      }

      return [publishTime, content];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
