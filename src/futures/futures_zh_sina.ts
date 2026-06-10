/**
 * AKShare TypeScript - 新浪财经-国内期货-实时数据
 * https://vip.stock.finance.sina.com.cn/quotes_service/view/qihuohangqing.html
 */

import axios from 'axios';
import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-期货品种当前时刻所有可交易的合约实时数据
 * https://vip.stock.finance.sina.com.cn/quotes_service/view/qihuohangqing.html
 *
 * @param symbol 品种名称，如 "PTA", "rb", "CU" 等
 */
export async function futures_zh_realtime(symbol: string = 'PTA'): Promise<DataFrame> {
  // 先获取品种代码映射
  const markData = await getSymbolMark();
  const symbolMarkMap: Record<string, string> = {};
  for (const row of markData.data) {
    symbolMarkMap[row[1]] = row[2]; // symbol -> mark
  }

  const mark = symbolMarkMap[symbol] || symbol.toLowerCase() + '_qh';

  const url =
    'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQFuturesData';
  const params = {
    page: '1',
    sort: 'position',
    asc: '0',
    node: mark,
    base: 'futures',
  };

  try {
    const data = await httpGet<any[]>(url, { params });

    if (!data || !Array.isArray(data) || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      'symbol', 'exchange', 'name', 'trade', 'settlement', 'presettlement',
      'open', 'high', 'low', 'close', 'bidprice1', 'askprice1',
      'bidvol1', 'askvol1', 'volume', 'position', 'ticktime', 'tradedate',
      'preclose', 'changepercent', 'bid', 'ask', 'prevsettlement',
    ];

    const rows = data.map((item: any) => [
      item.symbol || '',
      item.exchange || '',
      item.name || '',
      item.trade || '',
      item.settlement || '',
      item.presettlement || '',
      item.open || '',
      item.high || '',
      item.low || '',
      item.close || '',
      item.bidprice1 || '',
      item.askprice1 || '',
      item.bidvol1 || '',
      item.askvol1 || '',
      item.volume || '',
      item.position || '',
      item.ticktime || '',
      item.tradedate || '',
      item.preclose || '',
      item.changepercent || '',
      item.bid || '',
      item.ask || '',
      item.prevsettlement || '',
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取期货品种和代码映射
 */
async function getSymbolMark(): Promise<{ columns: string[]; data: string[][] }> {
  const url =
    'https://vip.stock.finance.sina.com.cn/quotes_service/view/js/qihuohangqing.js';

  try {
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'text/javascript,*/*;q=0.8',
      },
    });

    const rawBuffer = Buffer.from(response.data as any);
    let rawText = '';
    try {
      rawText = new TextDecoder('gbk').decode(rawBuffer);
    } catch {
      rawText = rawBuffer.toString('utf8');
    }

    if (!rawText) {
      return { columns: [], data: [] };
    }

    // Parse the JS object from the response
    const jsonStart = rawText.indexOf('{');
    const objectEnd = rawText.indexOf('};', jsonStart);
    const jsonEnd = (objectEnd >= 0 ? objectEnd + 1 : rawText.indexOf('}', jsonStart) + 1);
    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      return { columns: [], data: [] };
    }

    const objectLiteral = rawText.substring(jsonStart, jsonEnd);
    const jsonStr = objectLiteral
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/'/g, '"')
      .replace(/,\s*([}\]])/g, '$1');

    let dataJson: any;
    try {
      dataJson = JSON.parse(jsonStr);
    } catch {
      try {
        // 新浪该接口返回的是 JS 对象字面量，兜底按 JS 语法解析
        dataJson = Function(`"use strict"; return (${objectLiteral});`)();
      } catch {
        return { columns: [], data: [] };
      }
    }

    const exchanges = ['czce', 'dce', 'shfe', 'cffex', 'gfex'];
    const allRows: string[][] = [];

    for (const exchange of exchanges) {
      const exchangeData = dataJson[exchange];
      if (!exchangeData || !Array.isArray(exchangeData)) continue;

      const exchangeName = exchangeData[0];
      for (let i = 1; i < exchangeData.length; i++) {
        const item = exchangeData[i];
        if (Array.isArray(item) && item.length >= 3) {
          allRows.push([exchangeName, item[0], item[1], item[2]]);
        }
      }
    }

    return {
      columns: ['exchange', 'symbol', 'mark', 'code'],
      data: allRows,
    };
  } catch {
    return { columns: [], data: [] };
  }
}

/**
 * 期货品种和代码映射表
 */
export async function futures_symbol_mark(): Promise<DataFrame> {
  const result = await getSymbolMark();
  return createDataFrame(
    ['exchange', 'symbol', 'mark'],
    result.data.map(row => [row[0], row[1], row[2]])
  );
}
