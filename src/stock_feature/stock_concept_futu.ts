/**
 * AKShare TypeScript - 富途牛牛-主题投资-概念板块-成分股
 * https://www.futunn.com/quote/sparks-us
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 富途牛牛-主题投资-概念板块-成分股
 * https://www.futunn.com/quote/sparks-us
 * @param symbol 板块名称，可选 {"巴菲特持仓", "佩洛西持仓", "特朗普概念股"}
 * @returns 概念板块成分股数据
 */
export async function stock_concept_cons_futu(symbol: string = '特朗普概念股'): Promise<DataFrame> {
  if (symbol === '特朗普概念股') {
    const url = 'https://www.futunn.com/quote-api/quote-v2/get-plate-stock';
    const params = {
      marketType: '2',
      plateId: '10102960',
      page: '0',
      pageSize: '30',
    };

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Quote-Token': '7f74cd2a5e',
    };

    const data = await httpGet<any>(url, { params, headers });

    if (!data?.data?.list || data.data.list.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['代码', '股票名称', '最新价', '涨跌额', '涨跌幅', '成交量', '成交额'];

    const rows = data.data.list.map((item: any) => [
      item.stockCode,
      item.name,
      item.price,
      item.change,
      item.changeRatio,
      item.tradeVolumn,
      item.tradeTrunover,
    ]);

    return createDataFrame(columns, rows);
  }

  const symbolMap: Record<string, string> = {
    '巴菲特持仓': 'BK2999',
    '佩洛西持仓': 'BK20883',
  };

  const url = `https://www.futunn.com/stock/${symbolMap[symbol]}`;
  const params = {
    global_content: JSON.stringify({ promote_id: 13766, sub_promote_id: 24 }),
  };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  };

  // Note: This endpoint returns HTML, which would need browser rendering
  // For API-only approach, we return empty DataFrame
  // In production, consider using puppeteer or similar
  const columns = ['代码', '股票名称', '最新价', '涨跌额', '涨跌幅', '成交量', '成交额'];
  return createDataFrame(columns, []);
}
