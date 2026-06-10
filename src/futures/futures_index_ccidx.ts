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

    // Convert createTime objects to strings
    const dateLineJson = data.data.dateLineJson.map((item: any) => ({
      ...item,
      createTime: item.createTime ? JSON.stringify(item.createTime) : '',
    }));

    // Match Python output: all API fields with original names
    const columns = [
      'preSettlePrice', 'settlePriceNorm', 'dailyIncreaseAndDecreasePercentageClose',
      '结算点位', '日期', 'oneYearAnnualizedReturnPercentage',
      'openingPrice', 'dailyIncreaseAndDecreaseClose', 'lowPrice',
      'threeMonthChangePercentage', 'createTime', 'highPrice',
      'tenYearAnnualizedReturnPercentage', '指数代码', '收盘点位', '涨跌',
      'closingPriceNorm', 'preClosingPrice', 'fiveYearAnnualizedReturnPercentage',
      'yearToDateChangePercentage', 'sixMonthChangePercentage', 'oneMonthChangePercentage',
      '涨跌幅', 'threeYearAnnualizedReturnPercentage',
    ];

    const rows = dateLineJson.map((item: any) => [
      item.preSettlePrice || '',
      item.settlePriceNorm || '',
      item.dailyIncreaseAndDecreasePercentageClose || '',
      item.settlePrice || '',
      item.tradeDate || '',
      item.oneYearAnnualizedReturnPercentage || '',
      item.openingPrice || '',
      item.dailyIncreaseAndDecreaseClose || '',
      item.lowPrice || '',
      item.threeMonthChangePercentage || '',
      item.createTime || '',
      item.highPrice || '',
      item.tenYearAnnualizedReturnPercentage || '',
      item.indexId || '',
      item.closingPrice || '',
      item.dailyIncreaseAndDecrease || '',
      item.closingPriceNorm || '',
      item.preClosingPrice || '',
      item.fiveYearAnnualizedReturnPercentage || '',
      item.yearToDateChangePercentage || '',
      item.sixMonthChangePercentage || '',
      item.oneMonthChangePercentage || '',
      item.dailyIncreaseAndDecreasePercentage || '',
      item.threeYearAnnualizedReturnPercentage || '',
    ]);

    // Sort by date (column index 4)
    rows.sort((a: any[], b: any[]) => String(a[4] || '').localeCompare(String(b[4] || '')));

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
