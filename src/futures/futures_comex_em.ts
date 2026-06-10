/**
 * AKShare TypeScript - 东方财富网-COMEX库存数据
 * https://data.eastmoney.com/pmetal/comex/by.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-期货期权-COMEX库存数据
 * https://data.eastmoney.com/pmetal/comex/by.html
 *
 * @param symbol 品种：黄金 或 白银
 */
export async function futures_comex_inventory(
  symbol: '黄金' | '白银' = '黄金'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '黄金': 'EMI00069026',
    '白银': 'EMI00069027',
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_FUTUOPT_GOLDSIL',
    columns: 'ALL',
    quoteColumns: '',
    source: 'WEB',
    client: 'WEB',
    filter: `(INDICATOR_ID1="${symbolMap[symbol]}")(@STORAGE_TON<>"NULL")`,
  };

  try {
    // First request to get total pages
    const firstData = await httpGet<any>(url, { params });
    if (!firstData?.result?.data) {
      return createDataFrame([], []);
    }

    const totalPages = firstData.result.pages || 1;
    const allItems: any[] = [...firstData.result.data];

    // Fetch remaining pages
    for (let page = 2; page <= totalPages; page++) {
      const pageData = await httpGet<any>(url, {
        params: { ...params, pageNumber: String(page) },
      });
      if (pageData?.result?.data) {
        allItems.push(...pageData.result.data);
      }
    }

    const columns = [
      '序号', '日期', `COMEX${symbol}库存量-吨`, `COMEX${symbol}库存量-盎司`,
    ];

    const rows = allItems.map((item: any, index: number) => [
      index + 1,
      item.REPORT_DATE || '',
      parseFloat(item.STORAGE_TON) || 0,
      parseFloat(item.STORAGE_OUNCE) || 0,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
