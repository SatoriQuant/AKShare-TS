/**
 * AKShare TypeScript - 新浪财经日内分时数据接口
 * https://vip.stock.finance.sina.com.cn/quotes_service/view/cn_bill.php
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-日内分时数据
 * https://vip.stock.finance.sina.com.cn/quotes_service/view/cn_bill.php?symbol=sz000001
 *
 * @param symbol 股票代码，如 "sz000001"
 * @param date 交易日，格式 "20240321"
 * @param page 页码，默认 1
 * @param pageSize 每页数量，默认 60
 */
export async function stock_intraday_sina(
  symbol: string = 'sz000001',
  date: string = '20240321',
  page: number = 1,
  pageSize: number = 60
): Promise<DataFrame> {
  const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

  const url =
    'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_Bill.GetBillList';
  const params = {
    symbol: symbol,
    num: pageSize.toString(),
    page: page.toString(),
    sort: 'ticktime',
    asc: '0',
    volume: '0',
    amount: '0',
    type: '0',
    day: formattedDate,
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: `https://vip.stock.finance.sina.com.cn/quotes_service/view/cn_bill.php?symbol=${symbol}`,
      },
    });

    if (!Array.isArray(data) || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['时间', '价格', '成交量', '成交额', '涨跌幅', '涨跌额'];
    const rows = data.map((item: any) => [
      item.ticktime,
      parseFloat(item.price) || NaN,
      parseInt(item.volume) || NaN,
      parseFloat(item.amount) || NaN,
      parseFloat(item.prev_price) || NaN,
      parseFloat(item.kind) || NaN,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
