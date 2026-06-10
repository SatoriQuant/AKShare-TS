/**
 * AKShare TypeScript - openctp 期货交易费用参照表
 * http://openctp.cn/fees.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * openctp 期货交易费用参照表
 * http://openctp.cn/fees.html
 */
export async function futures_fees_info(): Promise<DataFrame> {
  const url = 'http://openctp.cn/fees.html';

  try {
    const html = await httpGetText(url);

    // Parse update time
    const timeMatch = html.match(/Generated at\s+([\d-]+\s+[\d:]+)/);
    const updateTime = timeMatch ? timeMatch[1] : '';

    // Parse HTML table
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      return createDataFrame([], []);
    }

    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const allRows: string[][] = [];
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }
      if (cells.length > 0) allRows.push(cells);
    }

    if (allRows.length < 2) {
      return createDataFrame([], []);
    }

    const columns = [...allRows[0], '更新时间'];
    const rows = allRows.slice(1).map(row => [...row, updateTime]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
