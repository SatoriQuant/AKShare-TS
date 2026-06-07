/**
 * AKShare TypeScript - 基金概况数据接口
 * 天天基金-基金档案-基本概况
 * https://fundf10.eastmoney.com/jbgk_015641.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取基金基本概况 - 东方财富
 * https://fundf10.eastmoney.com/jbgk_015641.html
 *
 * @param symbol 基金代码
 */
export async function fund_overview_em(
  symbol: string = '015641'
): Promise<DataFrame> {
  const url = `https://fundf10.eastmoney.com/jbgk_${symbol}.html`;

  try {
    const html = await httpGetText(url);

    // 解析 HTML 表格
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: string[] = [];
    let tableMatch;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      tables.push(tableMatch[1]);
    }

    if (tables.length === 0) {
      return createDataFrame([], []);
    }

    // 取最后一个表格，按 Key-Value 形式存储
    const lastTable = tables[tables.length - 1];
    const dict: Record<string, string> = {};

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(lastTable)) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }

      // 每行有4个单元格，形成 2 对 key-value
      if (cells.length >= 4) {
        dict[cells[0]] = cells[1];
        dict[cells[2]] = cells[3];
      }
    }

    if (Object.keys(dict).length === 0) {
      return createDataFrame([], []);
    }

    const columns = Object.keys(dict);
    const rows = [columns.map(col => dict[col])];

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
