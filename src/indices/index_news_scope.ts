/**
 * AKShare TypeScript - 数库-A股新闻情绪指数
 * https://www.chinascope.com/reasearch.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 数库-A股新闻情绪指数
 * https://www.chinascope.com/reasearch.html
 */
export async function index_news_sentiment_scope(): Promise<DataFrame> {
  const url = 'https://www.chinascope.com/inews/senti/index';
  const params = { period: 'YEAR' };

  const data = await httpGet<any>(url, { params });

  if (!Array.isArray(data)) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '市场情绪指数', '沪深300指数'];

  const rows = data.map((item: any) => [
    item.tradeDate,
    parseFloat(item.maIndex1),
    parseFloat(item.marketClose),
  ]);

  return createDataFrame(columns, rows);
}
