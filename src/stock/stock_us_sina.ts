/**
 * AKShare TypeScript - 新浪财经美股数据接口
 * https://finance.sina.com.cn/stock/usstock/sector.shtml
 */

import { httpGetText, httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  convertColumn,
} from '../utils/dataframe';

/**
 * 新浪财经-美股-股票列表
 * https://finance.sina.com.cn/stock/usstock/sector.shtml
 *
 * @param page 页码，默认 1
 * @param pageSize 每页数量，默认 20
 */
export async function get_us_stock_name(
  page: number = 1,
  pageSize: number = 20
): Promise<DataFrame> {
  const url =
    'https://stock.finance.sina.com.cn/usstock/api/jsonp.php/callback/US_CategoryService.getList';
  const params = {
    page: page.toString(),
    num: pageSize.toString(),
    sort: '',
    asc: '0',
    market: '',
    id: '',
  };

  try {
    const text = await httpGetText(url, { params });

    // Parse JSONP response
    const match = text.match(/\((\{.*\})\)/s);
    if (!match) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(match[1]);
    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = ['name', 'cname', 'symbol'];
    const rows = data.data.map((item: any) => [
      item.name,
      item.cname,
      item.symbol,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-美股实时行情数据
 * https://finance.sina.com.cn/stock/usstock/sector.shtml
 *
 * @param page 页码，默认 1
 * @param pageSize 每页数量，默认 20
 */
export async function stock_us_spot(
  page: number = 1,
  pageSize: number = 20
): Promise<DataFrame> {
  const url =
    'https://stock.finance.sina.com.cn/usstock/api/jsonp.php/callback/US_CategoryService.getList';
  const params = {
    page: page.toString(),
    num: pageSize.toString(),
    sort: '',
    asc: '0',
    market: '',
    id: '',
  };

  try {
    const text = await httpGetText(url, { params });

    // Parse JSONP response
    const match = text.match(/\((\{.*\})\)/s);
    if (!match) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(match[1]);
    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = [
      'symbol', 'name', 'cname', 'price', 'change', 'chg_pct',
      'volume', 'amount', 'open', 'high', 'low', 'prev_close',
    ];

    const rows = data.data.map((item: any) => [
      item.symbol,
      item.name,
      item.cname,
      parseFloat(item.price) || NaN,
      parseFloat(item.change) || NaN,
      parseFloat(item.chg_pct) || NaN,
      parseFloat(item.volume) || NaN,
      parseFloat(item.amount) || NaN,
      parseFloat(item.open) || NaN,
      parseFloat(item.high) || NaN,
      parseFloat(item.low) || NaN,
      parseFloat(item.prev_close) || NaN,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-美股历史行情数据
 * https://finance.sina.com.cn/stock/usstock/sector.shtml
 *
 * @param symbol 股票代码，如 "AAPL"
 * @param startDate 开始日期，格式 "20240101"
 * @param endDate 结束日期，格式 "20241231"
 * @param adjust 复权类型：qfq 前复权, "" 不复权
 */
export async function stock_us_daily(
  symbol: string = 'AAPL',
  startDate?: string,
  endDate?: string,
  adjust: 'qfq' | '' = ''
): Promise<DataFrame> {
  const url = `https://quotes.sina.cn/usstock/api/jsonp.php/callback/US_MinKService.getDailyK`;
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
