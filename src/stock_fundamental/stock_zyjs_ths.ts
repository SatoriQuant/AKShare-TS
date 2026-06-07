/**
 * AKShare TypeScript - 同花顺-主营介绍
 * https://basic.10jqka.com.cn/new/000066/operate.html
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 同花顺-主营介绍
 *
 * @param symbol 股票代码，如 "000066"
 */
export async function stock_zyjs_ths(symbol: string = '000066'): Promise<DataFrame> {
  const url = `https://basic.10jqka.com.cn/new/${symbol}/operate.html`;
  const htmlText = await httpGetText(url);

  // Parse HTML to extract the main_intro_list
  // Look for <ul class="main_intro_list">...</ul>
  const listMatch = htmlText.match(/<ul[^>]*class="main_intro_list"[^>]*>([\s\S]*?)<\/ul>/);
  if (!listMatch) {
    return createDataFrame([], []);
  }

  const ulContent = listMatch[1];
  const liMatches = ulContent.match(/<li[^>]*>([\s\S]*?)<\/li>/g);

  if (!liMatches || liMatches.length === 0) {
    return createDataFrame([], []);
  }

  const columnsList: string[] = [];
  const valueList: string[] = [];

  for (const li of liMatches) {
    const text = li.replace(/<[^>]+>/g, '').trim();
    const parts = text.split('：'); // Chinese colon
    if (parts.length >= 2) {
      columnsList.push(parts[0].trim());
      valueList.push(parts.slice(1).join('：').replace(/[\t\n]/g, '').trim());
    }
  }

  const columns = ['股票代码', ...columnsList];
  const rows = [[symbol, ...valueList]];

  return createDataFrame(columns, rows);
}
