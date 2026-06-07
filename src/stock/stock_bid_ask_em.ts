/**
 * AKShare TypeScript - 东方财富行情报价
 * https://quote.eastmoney.com/sz000001.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-行情报价
 *
 * @param symbol 股票代码，如 "000001"
 */
export async function stock_bid_ask_em(
  symbol: string = '000001'
): Promise<DataFrame> {
  const marketCode = symbol.startsWith('6') ? 1 : 0;

  const url = 'https://push2.eastmoney.com/api/qt/stock/get';
  const params = {
    fltt: '2',
    invt: '2',
    fields: 'f31,f32,f33,f34,f35,f36,f37,f38,f39,f40,f19,f20,f17,f18,f15,f16,f13,f14,f11,f12,f43,f71,f170,f169,f47,f48,f168,f50,f44,f45,f46,f60,f51,f52,f49,f161',
    secid: `${marketCode}.${symbol}`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const d = data.data;
  const columns = ['item', 'value'];
  const rows = [
    ['卖五', d.f31],
    ['卖五量', d.f32 * 100],
    ['卖四', d.f33],
    ['卖四量', d.f34 * 100],
    ['卖三', d.f35],
    ['卖三量', d.f36 * 100],
    ['卖二', d.f37],
    ['卖二量', d.f38 * 100],
    ['卖一', d.f39],
    ['卖一量', d.f40 * 100],
    ['买一', d.f19],
    ['买一量', d.f20 * 100],
    ['买二', d.f17],
    ['买二量', d.f18 * 100],
    ['买三', d.f15],
    ['买三量', d.f16 * 100],
    ['买四', d.f13],
    ['买四量', d.f14 * 100],
    ['买五', d.f11],
    ['买五量', d.f12 * 100],
    ['最新', d.f43],
    ['均价', d.f71],
    ['涨幅', d.f170],
    ['涨跌', d.f169],
    ['总手', d.f47],
    ['金额', d.f48],
    ['换手', d.f168],
    ['量比', d.f50],
    ['最高', d.f44],
    ['最低', d.f45],
    ['今开', d.f46],
    ['昨收', d.f60],
    ['涨停', d.f51],
    ['跌停', d.f52],
    ['外盘', d.f49],
    ['内盘', d.f161],
  ];

  return createDataFrame(columns, rows);
}
