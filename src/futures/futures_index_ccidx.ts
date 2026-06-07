/**
 * AKShare TypeScript - 中证商品指数
 * http://www.ccidx.com/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

type CcidxSymbol = '中证商品期货指数' | '中证商品期货价格指数';

/**
 * 中证商品指数-商品指数-日频率
 * http://www.ccidx.com/index.html
 *
 * @param symbol 指数名称：中证商品期货指数 或 中证商品期货价格指数
 */
export async function futures_index_ccidx(
  symbol: CcidxSymbol = '中证商品期货指数'
): Promise<DataFrame> {
  const indexMap: Record<string, string> = {
    '中证商品期货指数': '100001.CCI',
    '中证商品期货价格指数': '000001.CCI',
  };

  const url = 'http://www.ccidx.com/CCI-ZZZS/index/getDateLine';
  const params = { indexId: indexMap[symbol] || indexMap['中证商品期货指数'] };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data?.dateLineJson || data.data.dateLineJson.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '指数代码', '收盘点位', '结算点位', '涨跌', '涨跌幅'];

    const rows = data.data.dateLineJson.map((item: any) => [
      item.tradeDate || '',
      item.indexId || '',
      parseFloat(item.closingPrice) || 0,
      parseFloat(item.settlePrice) || 0,
      parseFloat(item.dailyIncreaseAndDecrease) || 0,
      parseFloat(item.dailyIncreaseAndDecreasePercentage) || 0,
    ]);

    // Sort by date
    rows.sort((a: any[], b: any[]) => (a[0] || '').localeCompare(b[0] || ''));

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
