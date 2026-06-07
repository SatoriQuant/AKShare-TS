/**
 * AKShare TypeScript - 彭博亿万富豪指数
 * https://www.bloomberg.com/billionaires/
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 从 HTML 表格中解析数据
 */
function parseSimpleTable(html: string): string[][] {
  const rows: string[][] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1];
    const cells: string[] = [];
    const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(trContent)) !== null) {
      const text = cellMatch[1].replace(/<[^>]+>/g, '').trim();
      cells.push(text);
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }
  return rows;
}

/**
 * Bloomberg Billionaires Index - 历史数据
 * https://stats.areppim.com/stats/links_billionairexlists.htm
 *
 * @param year 年份，如 "2021", "2019", "2018" 等
 * @returns 彭博亿万富豪指数历史数据
 */
export async function index_bloomberg_billionaires_hist(
  year: string = '2021'
): Promise<DataFrame> {
  const yearSuffix = year.slice(-2);
  const url = `https://stats.areppim.com/listes/list_billionairesx${yearSuffix}xwor.htm`;

  const html = await httpGetText(url);
  const rows = parseSimpleTable(html);

  if (rows.length < 2) {
    return createDataFrame([], []);
  }

  // 找到包含 "Rank" 的表头行
  let headerRowIndex = rows.findIndex(row => row.some(cell => cell.includes('Rank')));
  if (headerRowIndex === -1) {
    headerRowIndex = 1;
  }

  const headerRow = rows[headerRowIndex];
  const dataRows = rows.slice(headerRowIndex + 1);

  // 过滤掉非数据行（第一列不是数字的行）
  const filteredRows = dataRows.filter(row => row.length > 0 && /^\d+$/.test(row[0]));

  // 标准化列名
  const columnMapping: Record<string, string> = {
    'Rank': 'rank',
    'Name': 'name',
    'Age': 'age',
    'Citizenship': 'country',
    'Country': 'country',
    'Net Worth(bil US$)': 'total_net_worth',
    'Total net worth$Billion': 'total_net_worth',
    '$ Last change': 'last_change',
    '$ YTD change': 'ytd_change',
    'Industry': 'industry',
  };

  const normalizedColumns = headerRow.map(col => columnMapping[col.trim()] || col.trim());

  return createDataFrame(normalizedColumns, filteredRows);
}

/**
 * Bloomberg Billionaires Index - 当前数据
 * https://www.bloomberg.com/billionaires/
 *
 * @returns 彭博亿万富豪指数
 */
export async function index_bloomberg_billionaires(): Promise<DataFrame> {
  const url = 'https://www.bloomberg.com/billionaires';

  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Referer': 'https://www.bloomberg.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  };

  const html = await httpGetText(url, { headers });

  // 解析 table-chart 中的 table-row
  const rows: string[][] = [];
  const rowRegex = /<div[^>]*class="table-row"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
  let rowMatch;

  // 简化解析：提取所有文本内容并按双空格分割
  const tableChartRegex = /<div[^>]*class="table-chart"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i;
  const tableMatch = tableChartRegex.exec(html);

  if (tableMatch) {
    const tableContent = tableMatch[1];
    const rowRegexInner = /class="table-row"[^>]*>([\s\S]*?)(?=class="table-row"|$)/gi;
    let match;
    while ((match = rowRegexInner.exec(tableContent)) !== null) {
      const text = match[1].replace(/<[^>]+>/g, '').trim();
      const parts = text.split(/\s{2,}/).filter(s => s !== '');
      if (parts.length >= 5) {
        rows.push(parts);
      }
    }
  }

  const columns = ['rank', 'name', 'total_net_worth', 'last_change', 'YTD_change', 'country', 'industry'];

  return createDataFrame(columns, rows);
}
