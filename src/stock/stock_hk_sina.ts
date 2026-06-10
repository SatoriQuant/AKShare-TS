/**
 * AKShare TypeScript - 新浪财经港股数据接口
 * https://stock.finance.sina.com.cn/hkstock/quotes/00700.html
 */

import { httpGetText, httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { decodeSinaData } from '../utils/jsDecode';

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

  const columns = [
    '日期时间', '代码', '中文名称', '英文名称', '交易类型',
    '最新价', '涨跌额', '涨跌幅', '昨收', '今开',
    '最高', '最低', '成交量', '成交额', '买一', '卖一',
  ];

  const rows: any[][] = [];
  const toNum = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  try {
    for (let p = page; p < 100; p++) {
      const params = {
        page: String(p),
        num: String(pageSize),
        sort: 'symbol',
        asc: '1',
        node: 'qbgg_hk',
        _s_r_a: 'init',
      };
      const text = await httpGetText(url, { params });
      const data = JSON.parse(text);

      if (!Array.isArray(data) || data.length === 0) {
        break;
      }

      for (const item of data) {
        rows.push([
          item.ticktime ?? '',
          item.symbol ?? '',
          item.name ?? '',
          item.engname ?? '',
          item.tradetype ?? '',
          toNum(item.lasttrade),
          toNum(item.pricechange),
          toNum(item.changepercent),
          toNum(item.prevclose),
          toNum(item.open),
          toNum(item.high),
          toNum(item.low),
          toNum(item.volume),
          toNum(item.amount),
          toNum(item.buy),
          toNum(item.sell),
        ]);
      }
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-港股-个股的历史行情数据
 * https://stock.finance.sina.com.cn/hkstock/quotes/02912.html
 *
 * Uses Sina's klc2_kl.js endpoint with JS decoding (same as Python AKShare).
 *
 * @param symbol 港股代码，如 "00700"
 * @param adjust 复权类型：qfq 前复权, hfq 后复权, "" 不复权
 */
export async function stock_hk_daily(
  symbol: string = '00700',
  adjust: 'qfq' | 'hfq' | '' = ''
): Promise<DataFrame> {
  try {
    // Step 1: Get unadjusted historical data from Sina's encoded endpoint
    const histUrl = `https://finance.sina.com.cn/stock/hkstock/${symbol}/klc2_kl.js`;
    const histText = await httpGetText(histUrl, {
      headers: {
        Referer: `https://stock.finance.sina.com.cn/hkstock/quotes/${symbol}.html`,
      },
    });

    // Extract the encoded string: var xx = "encoded_data";
    const encodedMatch = histText.split('=');
    if (encodedMatch.length < 2) {
      return createDataFrame([], []);
    }
    const encodedStr = encodedMatch[1].split(';')[0].replace(/"/g, '');

    // Decode using the hk_js_decode algorithm
    const decoded = decodeSinaData(encodedStr);
    if (!decoded || decoded.length === 0) {
      return createDataFrame([], []);
    }

    // Build base DataFrame from decoded data
    // Each item has: { date: Date, open, high, low, close, volume, amount }
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
        String(item.amount ?? ''),
      ];
    });

    if (adjust === '') {
      const columns = ['date', 'open', 'high', 'low', 'close', 'volume', 'amount'];
      return createDataFrame(columns, rows);
    }

    // For qfq/hfq adjustment, get the factor data
    if (adjust === 'hfq') {
      const hfqUrl = `https://finance.sina.com.cn/stock/hkstock/${symbol}/hfq.js`;
      const hfqText = await httpGetText(hfqUrl, {
        headers: {
          Referer: `https://stock.finance.sina.com.cn/hkstock/quotes/${symbol}.html`,
        },
      });

      try {
        // Parse hfq factor data: var xxx = {data: [[date, factor, cash], ...]}
        const hfqDataMatch = hfqText.split('=');
        if (hfqDataMatch.length >= 2) {
          const hfqDataStr = hfqDataMatch[1].split('\n')[0];
          const hfqData = eval('(' + hfqDataStr + ')');
          if (hfqData?.data && hfqData.data.length > 1) {
            const factorRows = hfqData.data;
            // Apply hfq adjustment: price * factor + cash
            const factorMap = new Map<string, { factor: number; cash: number }>();
            for (const fr of factorRows) {
              const fDate = fr[0] instanceof Date ? fr[0].toISOString().split('T')[0] : String(fr[0]);
              factorMap.set(fDate, { factor: Number(fr[1]), cash: Number(fr[2] || 0) });
            }

            // Forward-fill the factor
            let lastFactor = { factor: 1, cash: 0 };
            rows = rows.map(row => {
              const dateStr = String(row[0]);
              if (factorMap.has(dateStr)) {
                lastFactor = factorMap.get(dateStr)!;
              }
              const open = parseFloat(String(row[1])) * lastFactor.factor + lastFactor.cash;
              const high = parseFloat(String(row[2])) * lastFactor.factor + lastFactor.cash;
              const low = parseFloat(String(row[3])) * lastFactor.factor + lastFactor.cash;
              const close = parseFloat(String(row[4])) * lastFactor.factor + lastFactor.cash;
              return [
                dateStr,
                String(Math.round(open * 10000) / 10000),
                String(Math.round(high * 10000) / 10000),
                String(Math.round(low * 10000) / 10000),
                String(Math.round(close * 10000) / 10000),
                String(row[5]),
                String(row[6]),
              ];
            });
          }
        }
      } catch {
        // If hfq factor fails, return unadjusted
      }
    }

    if (adjust === 'qfq') {
      const qfqUrl = `https://finance.sina.com.cn/stock/hkstock/${symbol}/qfq.js`;
      const qfqText = await httpGetText(qfqUrl, {
        headers: {
          Referer: `https://stock.finance.sina.com.cn/hkstock/quotes/${symbol}.html`,
        },
      });

      try {
        const qfqDataMatch = qfqText.split('=');
        if (qfqDataMatch.length >= 2) {
          const qfqDataStr = qfqDataMatch[1].split('\n')[0];
          const qfqData = eval('(' + qfqDataStr + ')');
          if (qfqData?.data && qfqData.data.length > 1) {
            const factorRows = qfqData.data;
            const factorMap = new Map<string, number>();
            for (const fr of factorRows) {
              const fDate = fr[0] instanceof Date ? fr[0].toISOString().split('T')[0] : String(fr[0]);
              factorMap.set(fDate, Number(fr[1]));
            }

            let lastFactor = 1;
            rows = rows.map(row => {
              const dateStr = String(row[0]);
              if (factorMap.has(dateStr)) {
                lastFactor = factorMap.get(dateStr)!;
              }
              const open = parseFloat(String(row[1])) * lastFactor;
              const high = parseFloat(String(row[2])) * lastFactor;
              const low = parseFloat(String(row[3])) * lastFactor;
              const close = parseFloat(String(row[4])) * lastFactor;
              return [
                dateStr,
                String(Math.round(open * 10000) / 10000),
                String(Math.round(high * 10000) / 10000),
                String(Math.round(low * 10000) / 10000),
                String(Math.round(close * 10000) / 10000),
                String(row[5]),
                String(row[6]),
              ];
            });
          }
        }
      } catch {
        // If qfq factor fails, return unadjusted
      }
    }

    const columns = ['date', 'open', 'high', 'low', 'close', 'volume', 'amount'];
    return createDataFrame(columns, rows);
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
