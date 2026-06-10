/**
 * AKShare TypeScript - 同花顺-数据中心-营业部排名
 * https://data.10jqka.com.cn/market/longhu/
 */

import { httpGet, httpGetText, httpGetTextGbk } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * Parse THS longhu page HTML table
 */
async function parseLhYybPage(url: string): Promise<{ headers: string[]; rows: string[][]; totalPages: number }> {
  const { load } = await import('cheerio');

  const text = await httpGetTextGbk(url);
  const $ = load(text);

  // Get total pages
  const pageInfo = $('span.page_info').text();
  let totalPages = 1;
  if (pageInfo) {
    const parts = pageInfo.split('/');
    if (parts.length >= 2) {
      totalPages = parseInt(parts[1]) || 1;
    }
  }

  // Parse table
  const headers: string[] = [];
  $('table thead th').each((_, th) => {
    headers.push($(th).text().trim());
  });

  const rows: string[][] = [];
  $('table tbody tr').each((_, tr) => {
    const cells: string[] = [];
    $(tr).find('td').each((_, td) => {
      // Clean up text: collapse whitespace, trim
      let text = $(td).text().replace(/\s+/g, ' ').trim();
      cells.push(text);
    });
    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  return { headers, rows, totalPages };
}

/**
 * 同花顺-数据中心-营业部排名-上榜次数最多
 * https://data.10jqka.com.cn/market/longhu/
 * @returns 上榜次数最多数据
 */
export async function stock_lh_yyb_most(): Promise<DataFrame> {
  try {
    const allRows: string[][] = [];
    let headers: string[] = [];

    // First page to get headers and total pages
    const firstUrl = 'https://data.10jqka.com.cn/ifmarket/lhbyyb/type/1/tab/sbcs/field/sbcs/sort/desc/page/1/';
    const firstResult = await parseLhYybPage(firstUrl);
    headers = firstResult.headers;
    allRows.push(...firstResult.rows);

    // Fetch remaining pages
    for (let page = 2; page <= firstResult.totalPages; page++) {
      const pageUrl = `https://data.10jqka.com.cn/ifmarket/lhbyyb/type/1/tab/sbcs/field/sbcs/sort/desc/page/${page}/`;
      const pageResult = await parseLhYybPage(pageUrl);
      allRows.push(...pageResult.rows);
    }

    if (headers.length === 0 || allRows.length === 0) {
      return createDataFrame([], []);
    }

    return createDataFrame(headers, allRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 同花顺-数据中心-营业部排名-资金实力最强
 * https://data.10jqka.com.cn/market/longhu/
 * @returns 资金实力最强数据
 */
export async function stock_lh_yyb_capital(): Promise<DataFrame> {
  try {
    const allRows: string[][] = [];
    let headers: string[] = [];

    const firstUrl = 'https://data.10jqka.com.cn/ifmarket/lhbyyb/type/1/tab/zjsl/field/zgczje/sort/desc/page/1/';
    const firstResult = await parseLhYybPage(firstUrl);
    headers = firstResult.headers;
    allRows.push(...firstResult.rows);

    for (let page = 2; page <= firstResult.totalPages; page++) {
      const pageUrl = `https://data.10jqka.com.cn/ifmarket/lhbyyb/type/1/tab/zjsl/field/zgczje/sort/desc/page/${page}/`;
      const pageResult = await parseLhYybPage(pageUrl);
      allRows.push(...pageResult.rows);
    }

    if (headers.length === 0 || allRows.length === 0) {
      return createDataFrame([], []);
    }

    return createDataFrame(headers, allRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 同花顺-数据中心-营业部排名-抱团操作实力
 * https://data.10jqka.com.cn/market/longhu/
 * @returns 抱团操作实力数据
 */
export async function stock_lh_yyb_control(): Promise<DataFrame> {
  try {
    const allRows: string[][] = [];
    let headers: string[] = [];

    const firstUrl = 'https://data.10jqka.com.cn/ifmarket/lhbyyb/type/1/tab/btcz/field/xsjs/sort/desc/page/1/';
    const firstResult = await parseLhYybPage(firstUrl);
    headers = firstResult.headers;
    allRows.push(...firstResult.rows);

    for (let page = 2; page <= firstResult.totalPages; page++) {
      const pageUrl = `https://data.10jqka.com.cn/ifmarket/lhbyyb/type/1/tab/btcz/field/xsjs/sort/desc/page/${page}/`;
      const pageResult = await parseLhYybPage(pageUrl);
      allRows.push(...pageResult.rows);
    }

    if (headers.length === 0 || allRows.length === 0) {
      return createDataFrame([], []);
    }

    return createDataFrame(headers, allRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
