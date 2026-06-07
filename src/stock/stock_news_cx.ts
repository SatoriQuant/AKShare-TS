/**
 * AKShare TypeScript - 财新网财新数据通
 * https://cxdata.caixin.com/pc/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 财新网-财新数据通
 */
export async function stock_news_main_cx(): Promise<DataFrame> {
  const url = 'https://cxdata.caixin.com/api/dataplus/sjtPc/news';
  const params = {
    pageNum: '1',
    pageSize: '100',
    showLabels: 'true',
  };

  const data = await httpGet<any>(url, {
    params,
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
      referer: 'https://cxdata.caixin.com/index/newsTab?tab=latest',
    },
  });

  if (!data?.data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['tag', 'summary', 'url'];
  const rows = data.data.data
    .filter((item: any) => item.tag && item.summary && item.url)
    .map((item: any) => [item.tag, item.summary, item.url]);

  return createDataFrame(columns, rows);
}
