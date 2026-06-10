/**
 * AKShare TypeScript - 同花顺-分红情况
 * https://basic.10jqka.com.cn/new/603444/bonus.html
 */

import { httpGetTextGbk } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 同花顺-分红情况
 * https://basic.10jqka.com.cn/new/603444/bonus.html
 * @param symbol 股票代码
 * @returns 分红情况数据
 */
export async function stock_fhps_detail_ths(symbol: string = '603444'): Promise<DataFrame> {
  try {
    const { load } = await import('cheerio');

    const url = `https://basic.10jqka.com.cn/new/${symbol}/bonus.html`;
    const htmlText = await httpGetTextGbk(url);
    const $ = load(htmlText);

    // Parse the HTML table using pd.read_html equivalent
    const tables = $('table').toArray();
    if (tables.length === 0) {
      return createDataFrame([], []);
    }

    // Find the first table with data (usually the main dividend table)
    let targetTable = tables[0];
    for (const table of tables) {
      const headers: string[] = [];
      $(table).find('thead th').each((_, th) => {
        headers.push($(th).text().trim());
      });
      if (headers.length > 3) {
        targetTable = table;
        break;
      }
    }

    // Extract headers
    const headers: string[] = [];
    $(targetTable).find('thead th').each((_, th) => {
      headers.push($(th).text().trim());
    });

    if (headers.length === 0) {
      return createDataFrame([], []);
    }

    // Extract data rows
    const rows: string[][] = [];
    $(targetTable).find('tbody tr').each((_, tr) => {
      const cells: string[] = [];
      $(tr).find('td').each((_, td) => {
        let text = $(td).text().replace(/\s+/g, ' ').trim();
        // Convert '--' to empty string to match Python behavior
        if (text === '--') text = '';
        cells.push(text);
      });
      if (cells.length >= headers.length) {
        rows.push(cells.slice(0, headers.length));
      }
    });

    if (rows.length === 0) {
      return createDataFrame([], []);
    }

    // Sort by 董事会日期 (matching Python behavior)
    const dateIdx = headers.indexOf('董事会日期');
    if (dateIdx !== -1) {
      rows.sort((a, b) => {
        const dateA = a[dateIdx] || '';
        const dateB = b[dateIdx] || '';
        return dateA.localeCompare(dateB);
      });
    }

    return createDataFrame(headers, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
