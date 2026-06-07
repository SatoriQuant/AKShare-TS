/**
 * AKShare TypeScript - 新浪财经可转债数据接口
 * 新浪财经-债券-可转债
 * https://money.finance.sina.com.cn/bond/info/sz128039.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 解析HTML表格为DataFrame
 */
function parseHtmlTable(html: string): DataFrame {
  // 简单的HTML表格解析
  const rows: string[][] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) {
    return createDataFrame([], []);
  }

  const columns = rows[0];
  const data = rows.slice(1);

  return createDataFrame(columns, data);
}

/**
 * 获取新浪财经可转债详情资料
 * https://money.finance.sina.com.cn/bond/info/sz128039.html
 *
 * @param symbol 带市场标识的转债代码，如 sz128039
 */
export async function bond_cb_profile_sina(symbol: string = 'sz128039'): Promise<DataFrame> {
  const url = `https://money.finance.sina.com.cn/bond/info/${symbol}.html`;

  try {
    const html = await httpGetText(url);

    // 解析表格
    const df = parseHtmlTable(html);

    if (df.data.length === 0) {
      return createDataFrame([], []);
    }

    // 重命名为标准列名
    const columns = ['项目', '值'];
    return createDataFrame(columns, df.data);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取新浪财经可转债债券概况
 * https://money.finance.sina.com.cn/bond/quotes/sh155255.html
 *
 * @param symbol 带市场标识的转债代码，如 sh155255
 */
export async function bond_cb_summary_sina(symbol: string = 'sh155255'): Promise<DataFrame> {
  const url = `https://money.finance.sina.com.cn/bond/quotes/${symbol}.html`;

  try {
    const html = await httpGetText(url);

    // 解析所有表格
    const tables = html.split(/<table/i).slice(1);

    if (tables.length < 11) {
      return createDataFrame([], []);
    }

    // 取第11个表格（索引10）
    const tableHtml = '<table' + tables[10];
    const df = parseHtmlTable(tableHtml);

    if (df.data.length === 0) {
      return createDataFrame([], []);
    }

    // 合并多列数据为两列格式
    const allRows: string[][] = [];
    for (const row of df.data) {
      // 每行可能有多组 key-value 对
      for (let i = 0; i < row.length - 1; i += 2) {
        if (row[i] && row[i + 1]) {
          allRows.push([row[i].trim(), row[i + 1].trim()]);
        }
      }
    }

    const columns = ['项目', '值'];
    return createDataFrame(columns, allRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
