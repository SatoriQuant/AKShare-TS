/**
 * AKShare TypeScript - 新浪财经港股数据接口
 * https://stock.finance.sina.com.cn/hkstock/quotes/00700.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  convertColumn,
} from '../utils/dataframe';

/**
 * 新浪财经-港股所有港股的实时行情数据
 * https://vip.stock.finance.sina.com.cn/mkt/#qbgg_hk
 *
 * @param page 页码，默认 1
 * @param pageSize 每页数量，默认 60
 */
export async function stock_hk_spot(
  page: number = 1,
  pageSize: number = 60
): Promise<DataFrame> {
  const url =
    'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHKStockData';
  const params = {
    page: page.toString(),
    num: pageSize.toString(),
    sort: 'symbol',
    asc: '1',
    node: 'qbgg_hk',
    _s_r_a: 'init',
  };

  try {
    const text = await httpGetText(url, { params });
    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '中文名称', '英文名称', '交易类型',
      '最新价', '涨跌额', '涨跌幅', '昨收', '今开',
      '最高', '最低', '成交量', '成交额', '买一', '卖一',
    ];

    const rows = data.map((item: any) => [
      item.symbol,
      item.name,
      item.engname,
      item.type,
      parseFloat(item.trade) || NaN,
      parseFloat(item.pricechange) || NaN,
      parseFloat(item.changepercent) || NaN,
      parseFloat(item.settlement) || NaN,
      parseFloat(item.open) || NaN,
      parseFloat(item.high) || NaN,
      parseFloat(item.low) || NaN,
      parseInt(item.volume) || NaN,
      parseFloat(item.amount) || NaN,
      parseFloat(item.buy) || NaN,
      parseFloat(item.sell) || NaN,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-港股-个股的历史行情数据
 * https://stock.finance.sina.com.cn/hkstock/quotes/02912.html
 *
 * @param symbol 港股代码，如 "00700"
 * @param adjust 复权类型：qfq 前复权, hfq 后复权, "" 不复权
 */
export async function stock_hk_daily(
  symbol: string = '00700',
  adjust: 'qfq' | 'hfq' | '' = ''
): Promise<DataFrame> {
  // Use the Sina K-line API for Hong Kong stocks
  const url = `https://quotes.sina.cn/hkstock/api/jsonp.php/callback/HK_StockService.getHKStockDailyKLine`;
  const params = {
    symbol: symbol,
    scale: '240',
    datalen: '10000',
  };

  try {
    const text = await httpGetText(url, { params });

    // Parse JSONP response
    const match = text.match(/\((\[.*\])\)/s);
    if (!match) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(match[1]);

    const columns = ['日期', '开盘', '最高', '最低', '收盘', '成交量'];
    let rows = data.map((item: any) => [
      item.date,
      parseFloat(item.open),
      parseFloat(item.high),
      parseFloat(item.low),
      parseFloat(item.close),
      parseInt(item.volume),
    ]);

    let df = createDataFrame(columns, rows);

    // Convert types
    df = convertColumn(df, '日期', 'date');
    for (const col of ['开盘', '最高', '最低', '收盘', '成交量']) {
      df = convertColumn(df, col, 'number');
    }

    return df;
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-港股-分钟级行情数据
 * https://stock.finance.sina.com.cn/hkstock/quotes/00700.html
 *
 * @param symbol 港股代码，如 "00700"
 * @param period 周期：1, 5, 15, 30, 60 分钟
 */
export async function stock_hk_minute(
  symbol: string = '00700',
  period: 1 | 5 | 15 | 30 | 60 = 5
): Promise<DataFrame> {
  const url =
    'https://quotes.sina.cn/hkstock/api/jsonp.php/callback/HK_StockService.getHKStockMinKLine';
  const params = {
    symbol: symbol,
    scale: period.toString(),
    datalen: '1000',
  };

  try {
    const text = await httpGetText(url, { params });

    // Parse JSONP response
    const match = text.match(/\((\[.*\])\)/s);
    if (!match) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(match[1]);

    const columns = ['日期', '开盘', '最高', '最低', '收盘', '成交量'];
    const rows = data.map((item: any) => [
      item.day,
      parseFloat(item.open),
      parseFloat(item.high),
      parseFloat(item.low),
      parseFloat(item.close),
      parseInt(item.volume),
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
