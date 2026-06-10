/**
 * AKShare TypeScript - 东方财富分时数据
 * https://quote.eastmoney.com/f1.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-分时数据
 *
 * @param symbol 股票代码，如 "000001"
 */
export async function stock_intraday_em(
  symbol: string = '000001'
): Promise<DataFrame> {
  const marketCode = symbol.startsWith('6') ? 1 : 0;
  const url = 'https://push2.eastmoney.com/api/qt/stock/details/get';
  const params = {
    fields1: 'f1,f2,f3,f4',
    fields2: 'f51,f52,f53,f54,f55',
    mpi: '2000',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    pos: '-0',
    secid: `${marketCode}.${symbol}`,
    wbp2u: '|0|0|0|web',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.details) {
    return createDataFrame([], []);
  }

  const sideMap: Record<string, string> = {
    '2': '买盘',
    '1': '卖盘',
    '4': '中性盘',
  };

  const columns = ['时间', '成交价', '手数', '买卖盘性质'];

  const rows = data.data.details.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseInt(parts[2]),
      sideMap[parts[4]] || parts[4],
    ];
  });

  return createDataFrame(columns, rows);
}
