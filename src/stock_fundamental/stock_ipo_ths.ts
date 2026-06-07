/**
 * AKShare TypeScript - 同花顺-新股申购与中签
 * https://data.10jqka.com.cn/ipo/xgsgyzq/
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 同花顺-数据中心-新股申购与中签
 *
 * @param symbol 市场类型: "全部A股", "沪市主板", "深市主板", "创业板", "科创板", "京市主板"
 */
export async function stock_ipo_ths(symbol: string = '全部A股'): Promise<DataFrame> {
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
  const htmlText = await httpGetText(url);

  // Parse HTML table - look for table with id="maintable" or class="m_table"
  const tableMatch = htmlText.match(/<table[^>]*(?:id="maintable"|class="m_table")[^>]*>([\s\S]*?)<\/table>/);
  if (!tableMatch) {
    return createDataFrame([], []);
  }

  const tableContent = tableMatch[1];

  // Extract headers from thead
  const theadMatch = tableContent.match(/<thead>([\s\S]*?)<\/thead>/);
  let headers: string[] = [];
  if (theadMatch) {
    const thMatches = theadMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/g);
    if (thMatches) {
      headers = thMatches.map(th => th.replace(/<[^>]+>/g, '').trim());
    }
  }

  // Extract data from tbody
  const tbodyMatch = tableContent.match(/<tbody>([\s\S]*?)<\/tbody>/);
  const tbodyContent = tbodyMatch ? tbodyMatch[1] : tableContent;

  const trMatches = tbodyContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
  if (!trMatches) {
    return createDataFrame([], []);
  }

  const rows: any[][] = [];
  for (const tr of trMatches) {
    const tdMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
    if (tdMatches) {
      const row = tdMatches.map(td => td.replace(/<[^>]+>/g, '').trim());
      if (row.length > 0) {
        rows.push(row);
      }
    }
  }

  if (headers.length === 0 && rows.length > 0) {
    headers = rows[0].map((_: any, i: number) => `列${i + 1}`);
  }

  return createDataFrame(headers, rows);
}

/**
 * 同花顺-数据中心-新股申购与中签-港股
 * https://data.10jqka.com.cn/ipo/xgsgyzq/
 */
export async function stock_ipo_hk_ths(): Promise<DataFrame> {
  const url = 'https://data.10jqka.com.cn/ipo/xgsgyzq/hkstock/';
  const htmlText = await httpGetText(url);

  // Parse HTML table
  const tableMatch = htmlText.match(/<table[^>]*(?:id="maintable"|class="m_table")[^>]*>([\s\S]*?)<\/table>/);
  if (!tableMatch) {
    return createDataFrame([], []);
  }

  const tableContent = tableMatch[1];

  // Extract headers
  const theadMatch = tableContent.match(/<thead>([\s\S]*?)<\/thead>/);
  let headers: string[] = [];
  if (theadMatch) {
    const thMatches = theadMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/g);
    if (thMatches) {
      headers = thMatches.map(th => th.replace(/<[^>]+>/g, '').trim());
    }
  }

  // Extract data
  const tbodyMatch = tableContent.match(/<tbody>([\s\S]*?)<\/tbody>/);
  const tbodyContent = tbodyMatch ? tbodyMatch[1] : tableContent;

  const trMatches = tbodyContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
  if (!trMatches) {
    return createDataFrame([], []);
  }

  const rows: any[][] = [];
  for (const tr of trMatches) {
    const tdMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
    if (tdMatches) {
      const row = tdMatches.map(td => td.replace(/<[^>]+>/g, '').trim());
      if (row.length > 0) {
        rows.push(row);
      }
    }
  }

  if (headers.length === 0 && rows.length > 0) {
    headers = rows[0].map((_: any, i: number) => `列${i + 1}`);
  }

  return createDataFrame(headers, rows);
}
