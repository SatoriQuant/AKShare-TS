/**
 * AKShare TypeScript - 期货交易规则
 * 国泰君安期货-交易日历数据表
 * 东方财富网-期货行情-品种及交易规则
 */

import { httpGetText, httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 国泰君安期货-交易日历数据表
 * https://www.gtjaqh.com/pc/calendar.html
 *
 * @param date 需要指定为交易日，且是近期的日期，格式 YYYYMMDD
 */
export async function futures_rule(date: string = '20231205'): Promise<DataFrame> {
  const url = 'https://www.gtjaqh.com/pc/calendar';
  const params = { date };

  try {
    const html = await httpGetText(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

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

    // The header is in the second row (index 1)
    const columns = allRows[1];
    const rows = allRows.slice(2).map(row => {
      return row.map((cell, idx) => {
        const colName = columns[idx] || '';
        if (colName.includes('交易保证金比例') || colName.includes('涨跌停板幅度')) {
          return parseFloat(cell.replace('%', '')) || 0;
        }
        if (colName.includes('合约乘数') || colName.includes('最小变动价位') || colName.includes('限价单每笔最大下单手数')) {
          return parseFloat(cell) || 0;
        }
        return cell;
      });
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 东方财富网-期货行情-品种及交易规则
 * https://portal.eastmoneyfutures.com/pages/service/jyts.html#jyrl
 */
export async function futures_rule_em(): Promise<DataFrame> {
  const url = 'https://eastmoneyfutures.com/api/ComManage/GetPZJYInfo';

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.Data) {
      return createDataFrame([], []);
    }

    const records = data.Data;
    if (!Array.isArray(records) || records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = Object.keys(records[0]);
    const rows = records.map((item: any) => columns.map(col => item[col]));

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
