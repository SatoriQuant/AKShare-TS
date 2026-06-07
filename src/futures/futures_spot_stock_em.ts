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
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Host: 'data.eastmoney.com',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
  };

  try {
    const html = await httpGetText(url, { headers });

    // Extract the pagedata JSON from the HTML
    const dataStart = html.indexOf('pagedata');
    const dataEnd = html.indexOf('/newstatic/js/common/emdataview.js');
    if (dataStart === -1 || dataEnd === -1) {
      return createDataFrame([], []);
    }

    let jsonStr = html.substring(dataStart, dataEnd);
    jsonStr = jsonStr.replace('pagedata= ', '').replace(';\n        </script>\n        <script src="', '');

    let tempJson: any;
    try {
      tempJson = JSON.parse(jsonStr);
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
      const users = Array.isArray(item.xyyhs)
        ? item.xyyhs.map((u: any) => u.name).join(', ')
        : '-';

      return [
        item.name || '',
        ...dateColumns.map((_, i) => {
          const key = `price${i + 1}`;
          return parseFloat(item[key]) || 0;
        }),
        parseFloat(item.price) || 0,
        parseFloat(item.changeRate) || 0,
        producers,
        users,
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
