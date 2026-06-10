/**
 * AKShare TypeScript - 东方财富网-数据中心-现货与股票
 * https://data.eastmoney.com/ifdata/xhgp.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

type SpotStockSector = '能源' | '化工' | '塑料' | '纺织' | '有色' | '钢铁' | '建材' | '农副';

/**
 * 东方财富网-数据中心-现货与股票
 * https://data.eastmoney.com/ifdata/xhgp.html
 *
 * @param symbol 板块：能源, 化工, 塑料, 纺织, 有色, 钢铁, 建材, 农副
 */
export async function futures_spot_stock(
  symbol: SpotStockSector = '能源'
): Promise<DataFrame> {
  const sectorMap: Record<string, number> = {
    '能源': 0, '化工': 1, '塑料': 2, '纺织': 3,
    '有色': 4, '钢铁': 5, '建材': 6, '农副': 7,
  };

  const url = 'https://data.eastmoney.com/ifdata/xhgp.html';
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
  };

  try {
    const html = await httpGetText(url, { headers });

    // Extract the pagedata JSON from the HTML
    const match = html.match(/pagedata\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
    if (!match) {
      return createDataFrame([], []);
    }

    let tempJson: any;
    try {
      tempJson = JSON.parse(match[1]);
    } catch {
      return createDataFrame([], []);
    }

    const dateList: string[] = Object.values(tempJson.dates || {});
    const datas = tempJson.datas;
    const sectorIndex = sectorMap[symbol];

    if (!datas || !datas[sectorIndex]) {
      return createDataFrame([], []);
    }

    const sectorData = datas[sectorIndex];
    const listData = sectorData.list || [];

    // Build column names from dates
    const dateColumns = dateList.slice(0, 5);
    const columns = [
      '商品名称', ...dateColumns, '最新价格', '近半年涨跌幅', '生产商', '下游用户',
    ];

    const rows = listData.map((item: any) => {
      const producers = Array.isArray(item.scss)
        ? item.scss.map((p: any) => p.name).join(', ')
        : '-';
      const users = Array.isArray(item.xyyhs) && item.xyyhs.length > 0
        ? item.xyyhs.map((u: any) => u.name).join(', ')
        : '-';

      return [
        item.name || '',
        item.v1 || '',
        item.v2 || '',
        item.v3 || '',
        item.v4 || '',
        item.v5 || '',
        item.price || '',
        item.zdf || '',
        producers,
        users,
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
