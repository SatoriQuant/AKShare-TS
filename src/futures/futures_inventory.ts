/**
 * AKShare TypeScript - 期货库存数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取期货库存数据 - 东方财富
 *
 * @param exchange 交易所：SHFE 上期所, DCE 大商所, CZCE 郑商所
 * @param symbol 品种代码，如 "铜"
 */
export async function futures_inventory_em(
  exchange: 'SHFE' | 'DCE' | 'CZCE' = 'SHFE',
  symbol?: string
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_FUTU_INVENTORY',
    columns: 'ALL',
    filter: symbol
      ? `(EXCHANGE='${exchange}')(VARIETY='${symbol}')`
      : `(EXCHANGE='${exchange}')`,
    pageNumber: '1',
    pageSize: '10000',
    sortTypes: '-1',
    sortColumns: 'TRADE_DATE',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '交易所', '品种', '库存', '增减', '仓单'
  ];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE,
    item.EXCHANGE,
    item.VARIETY,
    item.INVENTORY,
    item.CHANGE,
    item.WARRANT,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取期货仓单数据 - 99期货
 *
 * @param symbol 品种代码，如 "铜"
 */
export async function futures_inventory_99(symbol: string): Promise<DataFrame> {
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
  } catch (error) {
    return createDataFrame([], []);
  }
}
