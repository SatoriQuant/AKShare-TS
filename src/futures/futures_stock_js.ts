/**
 * AKShare TypeScript - 金十财经-上海期货交易所库存周报
 * https://datacenter.jin10.com/reportType/dc_shfe_weekly_stock
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 金十财经-上海期货交易所指定交割仓库库存周报
 * https://datacenter.jin10.com/reportType/dc_shfe_weekly_stock
 *
 * @param date 交易日，格式 YYYYMMDD；库存周报只在每周的最后一个交易日公布数据
 */
export async function futures_stock_shfe_js(date: string = '20240419'): Promise<DataFrame> {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'x-app-id': 'rU6QIu7JHe2gOUeR',
    'x-csrf-token': 'x-csrf-token',
    'x-version': '1.0.0',
  };

  const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  const url = 'https://datacenter-api.jin10.com/reports/list';
  const params = {
    category: 'stock',
    date: formattedDate,
    attr_id: '1',
  };

  try {
    const data = await httpGet<any>(url, { params, headers });

    if (!data?.data?.keys || !data?.data?.values) {
      return createDataFrame([], []);
    }

    const columnsList = data.data.keys.map((item: any) => item.name);
    const rows = data.data.values;

    const numericColumns = columnsList.slice(1);
    const processedRows = rows.map((row: any[]) => {
      return row.map((cell: any, idx: number) => {
        if (idx === 0) return cell;
        return parseFloat(cell) || 0;
      });
    });

    return createDataFrame(columnsList, processedRows);
  } catch {
    return createDataFrame([], []);
  }
}
