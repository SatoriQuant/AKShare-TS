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

    const rows = data.data.dataList.map((item: any) => {
      // 兼容对象结构与数组结构
      const timestamp = item?.pushTime ?? item?.[3];
      const content = item?.contentText ?? item?.content ?? item?.[5] ?? '';

      let publishTime = '';
      if (timestamp) {
        try {
          const millis = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
          const date = new Date(millis);
          const formatted = new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Asia/Shanghai',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(date);
          publishTime = `${formatted.replace('T', ' ')}+08:00`;
        } catch {
          publishTime = String(timestamp);
        }
      }

      return [publishTime, content];
    });

    rows.sort((a: any[], b: any[]) => String(a[0]).localeCompare(String(b[0])));

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
