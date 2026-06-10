/**
 * AKShare TypeScript - 同花顺-主营介绍
 * https://basic.10jqka.com.cn/000066/operate.html
 */

import axios from 'axios';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 同花顺-主营介绍
 *
 * @param symbol 股票代码，如 "000066"
 */
export async function stock_zyjs_ths(symbol: string = '000066'): Promise<DataFrame> {
  const url = `http://basic.10jqka.com.cn/${symbol}/operate.html`;

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    const rawBuffer = Buffer.from(response.data as any);
    let htmlText = '';
    try {
      htmlText = new TextDecoder('gbk').decode(rawBuffer);
    } catch {
      htmlText = rawBuffer.toString('utf8');
    }

    // Parse HTML to extract the main_intro_list
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
  } catch {
    return createDataFrame([], []);
  }
}
