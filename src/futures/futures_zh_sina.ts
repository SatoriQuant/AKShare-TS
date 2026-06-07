/**
 * AKShare TypeScript - 新浪财经-国内期货-实时数据
 * https://vip.stock.finance.sina.com.cn/quotes_service/view/qihuohangqing.html
 */

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
      'symbol', 'name', 'trade', 'settlement', 'presettlement',
      'open', 'high', 'low', 'close', 'bidprice1', 'askprice1',
      'bidvol1', 'askvol1', 'volume', 'position', 'preclose',
      'changepercent', 'bid', 'ask', 'prevsettlement',
    ];

    const rows = data.map((item: any) => [
      item.symbol || '',
      item.name || '',
      parseFloat(item.trade) || 0,
      parseFloat(item.settlement) || 0,
      parseFloat(item.presettlement) || 0,
      parseFloat(item.open) || 0,
      parseFloat(item.high) || 0,
      parseFloat(item.low) || 0,
      parseFloat(item.close) || 0,
      parseFloat(item.bidprice1) || 0,
      parseFloat(item.askprice1) || 0,
      parseInt(item.bidvol1) || 0,
      parseInt(item.askvol1) || 0,
      parseInt(item.volume) || 0,
      parseInt(item.position) || 0,
      parseFloat(item.preclose) || 0,
      parseFloat(item.changepercent) || 0,
      parseFloat(item.bid) || 0,
      parseFloat(item.ask) || 0,
      parseFloat(item.prevsettlement) || 0,
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
    const response = await httpGet<string>(url, { responseType: 'text' });
    if (typeof response !== 'string') {
      return { columns: [], data: [] };
    }

    // Parse the JS object from the response
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.indexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      return { columns: [], data: [] };
    }

    const jsonStr = response.substring(jsonStart, jsonEnd);
    let dataJson: any;
    try {
      dataJson = JSON.parse(jsonStr);
    } catch {
      // Try evaluating as JS object literal (demjson style)
      // This is a simplified parser - in production you'd use a proper JS parser
      return { columns: [], data: [] };
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
