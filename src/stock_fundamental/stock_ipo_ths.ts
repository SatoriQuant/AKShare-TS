/**
 * AKShare TypeScript - 同花顺-新股申购与中签
 * https://data.10jqka.com.cn/ipo/xgsgyzq/
 */

import { httpGetText, httpGetTextGbk } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 同花顺-数据中心-新股申购与中签
 * https://data.10jqka.com.cn/ipo/xgsgyzq/
 *
 * Uses cheerio for HTML parsing (same as Python AKShare with BeautifulSoup).
 *
 * @param symbol 市场类型: "全部A股", "沪市主板", "深市主板", "创业板", "科创板", "京市主板"
 */
export async function stock_ipo_ths(symbol: string = '全部A股'): Promise<DataFrame> {
  try {
    const { load } = await import('cheerio');

    const symbolMap: Record<string, string> = {
      '全部A股': 'all',
      '沪市主板': 'hszb',
      '深市主板': 'sszb',
      '创业板': 'cyb',
      '科创板': 'kcbsg',
      '京市主板': 'bjzb',
    };

    if (!(symbol in symbolMap)) {
      throw new Error(`Invalid symbol: ${symbol}. Please choose from ${Object.keys(symbolMap).join(', ')}`);
    }

    const url = `https://data.10jqka.com.cn/ipo/xgsgyzq/${symbolMap[symbol]}/`;
    const htmlText = await httpGetTextGbk(url);
    const $ = load(htmlText);

    // Find the main table
    const table = $('table#maintable').length > 0 ? $('table#maintable') : $('table.m_table');
    if (table.length === 0) {
      return createDataFrame([], []);
    }

    // Extract headers - only take first set (18 columns)
    const allHeaders: string[] = [];
    table.find('thead th').each((_, th) => {
      allHeaders.push($(th).text().trim());
    });
    // The HTML may have duplicate header rows; take only the first 18
    const headers = allHeaders.slice(0, 18);

    // Extract data rows
    const rows: string[][] = [];
    const tbody = table.find('tbody').length > 0 ? table.find('tbody') : table;
    tbody.find('tr').each((_, tr) => {
      const cells: string[] = [];
      $(tr).find('td').each((_, td) => {
        // Clean up text: collapse whitespace, trim
        let text = $(td).text().replace(/\s+/g, ' ').trim();
        cells.push(text);
      });
      if (cells.length >= 18) {
        rows.push(cells.slice(0, 18));
      }
    });

    if (headers.length === 0 && rows.length > 0) {
      const generatedHeaders = rows[0].map((_, i) => `列${i + 1}`);
      return createDataFrame(generatedHeaders, rows);
    }

    return createDataFrame(headers, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 同花顺-数据中心-新股申购与中签-港股
 * https://data.10jqka.com.cn/ipo/xgsgyzq/
 */
export async function stock_ipo_hk_ths(): Promise<DataFrame> {
  try {
    const { load } = await import('cheerio');

    const url = 'https://data.10jqka.com.cn/ipo/xgsgyzq/hkstock/';
    const htmlText = await httpGetTextGbk(url);
    const $ = load(htmlText);

    const table = $('table#maintable').length > 0 ? $('table#maintable') : $('table.m_table');
    if (table.length === 0) {
      return createDataFrame([], []);
    }

    // Extract headers - only take first set (18 columns)
    const allHeaders: string[] = [];
    table.find('thead th').each((_, th) => {
      allHeaders.push($(th).text().trim());
    });
    const headers = allHeaders.slice(0, 18);

    const rows: string[][] = [];
    const tbody = table.find('tbody').length > 0 ? table.find('tbody') : table;
    tbody.find('tr').each((_, tr) => {
      const cells: string[] = [];
      $(tr).find('td').each((_, td) => {
        // Clean up text: collapse whitespace, trim
        let text = $(td).text().replace(/\s+/g, ' ').trim();
        cells.push(text);
      });
      if (cells.length >= 18) {
        rows.push(cells.slice(0, 18));
      }
    });

    if (headers.length === 0 && rows.length > 0) {
      const generatedHeaders = rows[0].map((_, i) => `列${i + 1}`);
      return createDataFrame(generatedHeaders, rows);
    }

    return createDataFrame(headers, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
