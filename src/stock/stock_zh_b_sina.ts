/**
 * AKShare TypeScript - 新浪财经B股数据接口
 * https://finance.sina.com.cn/realstock/company/sh900901/nc.shtml
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  convertColumn,
} from '../utils/dataframe';

/**
 * 新浪财经-B股实时行情数据
 * https://vip.stock.finance.sina.com.cn/mkt/#hs_b
 *
 * @param page 页码，默认 1
 * @param pageSize 每页数量，默认 80
 */
export async function stock_zh_b_spot(
  page: number = 1,
  pageSize: number = 80
): Promise<DataFrame> {
  const url =
    'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData';
  const params = {
    page: page.toString(),
    num: pageSize.toString(),
    sort: 'symbol',
    asc: '1',
    node: 'hs_b',
    symbol: '',
    _s_r_a: 'page',
  };

  try {
    const text = await httpGetText(url, { params });
    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '名称', '最新价', '涨跌额', '涨跌幅',
      '买入', '卖出', '昨收', '今开', '最高', '最低',
      '成交量', '成交额',
    ];

    const rows = data.map((item: any) => [
      item.symbol,
      item.name,
      parseFloat(item.trade) || NaN,
      parseFloat(item.pricechange) || NaN,
      parseFloat(item.changepercent) || NaN,
      parseFloat(item.buy) || NaN,
      parseFloat(item.sell) || NaN,
      parseFloat(item.settlement) || NaN,
      parseFloat(item.open) || NaN,
      parseFloat(item.high) || NaN,
      parseFloat(item.low) || NaN,
      parseInt(item.volume) || NaN,
      parseFloat(item.amount) || NaN,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-B股历史行情数据
 * https://finance.sina.com.cn/realstock/company/sh900901/nc.shtml
 *
 * @param symbol 股票代码，如 "sh900901"
 * @param startDate 开始日期，格式 "20200101"
 * @param endDate 结束日期，格式 "20241231"
 * @param adjust 复权类型：qfq 前复权, hfq 后复权, "" 不复权
 */
export async function stock_zh_b_daily(
  symbol: string = 'sh900901',
  startDate?: string,
  endDate?: string,
  adjust: 'qfq' | 'hfq' | '' = ''
): Promise<DataFrame> {
  const url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_data=/CN_MarketDataService.getKLineData`;

  const params = {
    symbol: symbol,
    scale: '240',
    ma: 'no',
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
      item.day,
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

    // Filter by date range
    if (startDate || endDate) {
      const start = startDate ? new Date(
        `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`
      ) : null;
      const end = endDate ? new Date(
        `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`
      ) : null;

      df = {
        ...df,
        data: df.data.filter(row => {
          const date = row[0] as Date;
          if (start && date < start) return false;
          if (end && date > end) return false;
          return true;
        }),
      };
    }

    return df;
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-B股分钟级行情数据
 * https://finance.sina.com.cn/realstock/company/sh900901/nc.shtml
 *
 * @param symbol 股票代码，如 "sh900901"
 * @param period 周期：1, 5, 15, 30, 60 分钟
 */
export async function stock_zh_b_minute(
  symbol: string = 'sh900901',
  period: 1 | 5 | 15 | 30 | 60 = 5
): Promise<DataFrame> {
  const url =
    'https://quotes.sina.cn/cn/api/jsonp_v2.php/=/CN_MarketDataService.getKLineData';

  const params = {
    symbol: symbol,
    scale: period.toString(),
    datalen: '1970',
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
