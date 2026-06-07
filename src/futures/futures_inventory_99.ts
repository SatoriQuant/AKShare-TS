/**
 * AKShare TypeScript - 99期货仓单数据
 * https://www.99qh.com
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 99期货-仓单数据
 * @param symbol 品种代码，如 "铜"
 */
export async function futures_inventory_99qh(symbol: string): Promise<DataFrame> {
  const url = `https://www.99qh.com/Store/StoreData/getInventory`;
  const params = {
    variety: symbol,
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: 'https://www.99qh.com/Store/StoreData',
      },
    });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '库存', '增减', '仓单', '仓单增减'];
    const rows = data.data.map((item: any) => [
      item.date,
      item.inventory,
      item.change,
      item.warrant,
      item.warrantChange,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
