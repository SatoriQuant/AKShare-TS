/**
 * AKShare TypeScript - 外盘期货数据接口
 */

import { load } from 'cheerio';
import { httpGetText, httpGetTextGbk } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取外盘期货合约详情 - 新浪财经
 */
export async function futures_foreign_detail(symbol: string = 'ZSD'): Promise<DataFrame> {
  const url = `https://finance.sina.com.cn/futures/quotes/${symbol}.shtml`;
  try {
    const html = await httpGetTextGbk(url);
    const $ = load(html);
    const tables = $('table');
    if (tables.length < 7) {
      return createDataFrame([], []);
    }

    const rows: any[][] = [];
    const target = tables.eq(6);

    target.find('tr').each((_, tr) => {
      const cells = $(tr).find('th,td');
      if (cells.length === 0) return;
      const row: string[] = [];
      cells.each((__, cell) => {
        row.push($(cell).text().replace(/\u00a0/g, ' ').trim());
      });
      rows.push(row);
    });

    if (rows.length === 0) {
      return createDataFrame([], []);
    }

    const width = rows.reduce((max, r) => Math.max(max, r.length), 0);
    const columns = Array.from({ length: width }, (_, i) => String(i));
    const normalizedRows = rows.map((r) => {
      if (r.length >= width) return r;
      return [...r, ...Array(width - r.length).fill('')];
    });

    return createDataFrame(columns, normalizedRows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取外盘期货历史行情 - 新浪财经
 */
export async function futures_foreign_hist(
  symbol: string = 'ZSD',
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  const today = new Date();
  const nowTag = `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
  const url =
    `https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_S${nowTag}=/GlobalFuturesService.getGlobalFuturesDailyKLine`;

  try {
    const text = await httpGetText(url, {
      params: {
        symbol,
        _: nowTag,
        source: 'web',
      },
    });

    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) {
      return createDataFrame([], []);
    }

    const raw = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(raw) || raw.length === 0) {
      return createDataFrame([], []);
    }

    const columns = Object.keys(raw[0]);
    const rows = raw.map((item: any) => columns.map((k) => item[k]));
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
