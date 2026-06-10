/**
 * AKShare TypeScript - 乐咕乐股-创新高、新低的股票数量
 * https://www.legulegu.com/stockdata/high-low-statistics
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 乐咕乐股-创新高、新低的股票数量
 * https://www.legulegu.com/stockdata/high-low-statistics
 * @param symbol 指数类型，可选 {"all", "sz50", "hs300", "zz500"}
 * @returns 创新高、新低的股票数量数据
 */
export async function stock_a_high_low_statistics(
  symbol: string = 'all'
): Promise<DataFrame> {
  const url = `https://www.legulegu.com/stockdata/member-ship/get-high-low-statistics/${symbol}`;

  const data = await httpGet<any[]>(url);

  if (!data || data.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['date', 'close', 'high20', 'low20', 'high60', 'low60', 'high120', 'low120'];
  const rows = data.map((item: any) => [
    item.date ? new Date(item.date).toISOString().split('T')[0] : null,
    item.close,
    item.high20,
    item.low20,
    item.high60,
    item.low60,
    item.high120,
    item.low120,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}
