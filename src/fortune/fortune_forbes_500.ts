/**
 * AKShare TypeScript - 福布斯中国-榜单
 * https://www.forbeschina.com/lists
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 从 HTML 表格中解析数据
 */
function parseHtmlTable(html: string): DataFrame {
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

  if (rows.length === 0) {
    return createDataFrame([], []);
  }

  const columns = rows[0];
  const data = rows.slice(1);
  return createDataFrame(columns, data);
}

/**
 * 福布斯中国-榜单
 * https://www.forbeschina.com/lists
 *
 * @param symbol 榜单名称，如 "2021福布斯中国创投人100"
 * @returns 具体指标的榜单数据
 */
export async function forbes_rank(
  symbol: string = '2021福布斯中国创投人100'
): Promise<DataFrame> {
  const url = 'https://www.forbeschina.com/lists';
  const html = await httpGetText(url);

  // 解析所有 col-sm-4 div 中的链接
  const nameUrlDict: Record<string, string> = {};

  // 匹配 col-sm-4 区块中的所有链接
  const colRegex = /<div[^>]*class="col-sm-4"[^>]*>([\s\S]*?)<\/div>/gi;
  let colMatch;
  while ((colMatch = colRegex.exec(html)) !== null) {
    const colContent = colMatch[1];
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(colContent)) !== null) {
      const href = linkMatch[1];
      const name = linkMatch[2].replace(/<[^>]+>/g, '').trim();
      const fullUrl = href.startsWith('http') ? href : `https://www.forbeschina.com${href}`;
      nameUrlDict[name] = fullUrl;
    }
  }

  const targetUrl = nameUrlDict[symbol];
  if (!targetUrl) {
    throw new Error(`未找到榜单: ${symbol}，请检查名称是否正确`);
  }

  const listHtml = await httpGetText(targetUrl);
  return parseHtmlTable(listHtml);
}
