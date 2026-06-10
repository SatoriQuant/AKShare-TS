/**
 * AKShare TypeScript - 新浪财经美股数据接口
 * https://finance.sina.com.cn/stock/usstock/sector.shtml
 */

import { httpGetText, httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { decodeSinaData } from '../utils/jsDecode';

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
 * Uses Sina's staticdata endpoint with JS decoding (same as Python AKShare).
 *
 * @param symbol 股票代码，如 "AAPL"
 * @param adjust 复权类型：qfq 前复权, "" 不复权
 */
export async function stock_us_daily(
  symbol: string = 'AAPL',
  adjust: 'qfq' | '' = ''
): Promise<DataFrame> {
  try {
    // Step 1: Get unadjusted data from Sina's staticdata endpoint
    const url = `https://finance.sina.com.cn/staticdata/us/${symbol}`;
    const text = await httpGetText(url);

    // Extract encoded string: var xx = "encoded_data";
    const encodedMatch = text.split('=');
    if (encodedMatch.length < 2) {
      return createDataFrame([], []);
    }
    const encodedStr = encodedMatch[1].split(';')[0].replace(/"/g, '');

    // Decode using the same JS decoder
    const decoded = decodeSinaData(encodedStr);
    if (!decoded || decoded.length === 0) {
      return createDataFrame([], []);
    }

    // Build base data - decoded items have: { date, open, high, low, close, volume }
    // Note: Sina US data doesn't have "amount" field, we'll use volume
    let rows: any[][] = decoded.map((item: any) => {
      const dateStr = item.date instanceof Date
        ? item.date.toISOString().split('T')[0]
        : String(item.date);
      return [
        dateStr,
        String(item.open ?? ''),
        String(item.high ?? ''),
        String(item.low ?? ''),
        String(item.close ?? ''),
        String(item.volume ?? ''),
      ];
    });

    if (adjust === '') {
      const columns = ['date', 'open', 'high', 'low', 'close', 'volume'];
      return createDataFrame(columns, rows);
    }

    // For qfq adjustment, get the factor data
    if (adjust === 'qfq') {
      const qfqUrl = `https://finance.sina.com.cn/us_stock/company/reinstatement/${symbol}_qfq.js`;
      const qfqText = await httpGetText(qfqUrl);

      try {
        const qfqDataMatch = qfqText.split('=');
        if (qfqDataMatch.length >= 2) {
          const qfqDataStr = qfqDataMatch[1].split('\n')[0];
          const qfqData = eval('(' + qfqDataStr + ')');
          if (qfqData?.data && qfqData.data.length > 0) {
            const factorRows = qfqData.data;
            // Each row: [date, adjust_value, qfq_factor]
            const factorMap = new Map<string, { adjust: number; factor: number }>();
            for (const fr of factorRows) {
              const fDate = fr.d instanceof Date ? fr.d.toISOString().split('T')[0] : String(fr.d);
              factorMap.set(fDate, {
                adjust: Number(fr.c ?? fr[1] ?? 0),
                factor: Number(fr.f ?? fr[2] ?? 1),
              });
            }

            let lastFactor = { adjust: 0, factor: 1 };
            rows = rows.map(row => {
              const dateStr = String(row[0]);
              if (factorMap.has(dateStr)) {
                lastFactor = factorMap.get(dateStr)!;
              }
              const open = parseFloat(String(row[1])) * lastFactor.factor + lastFactor.adjust;
              const high = parseFloat(String(row[2])) * lastFactor.factor + lastFactor.adjust;
              const low = parseFloat(String(row[3])) * lastFactor.factor + lastFactor.adjust;
              const close = parseFloat(String(row[4])) * lastFactor.factor + lastFactor.adjust;
              return [
                dateStr,
                String(Math.round(open * 10000) / 10000),
                String(Math.round(high * 10000) / 10000),
                String(Math.round(low * 10000) / 10000),
                String(Math.round(close * 10000) / 10000),
                String(row[5]),
              ];
            });
          }
        }
      } catch {
        // If qfq factor fails, return unadjusted
      }
    }

    const columns = ['date', 'open', 'high', 'low', 'close', 'volume'];
    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
