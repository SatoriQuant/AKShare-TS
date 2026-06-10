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
 * @param symbol 品种代码或中文名称，默认 "a"
 */
export async function futures_inventory_em(
  symbol: string = 'a'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';

  const codeParams = {
    reportName: 'RPT_FUTU_POSITIONCODE',
    columns: 'TRADE_MARKET_CODE,TRADE_CODE,TRADE_TYPE',
    filter: '(IS_MAINCODE="1")',
    pageNumber: '1',
    pageSize: '500',
    source: 'WEB',
    client: 'WEB',
  };
  const codeData = await httpGet<any>(url, { params: codeParams });
  const codeRows = codeData?.result?.data;

  if (!Array.isArray(codeRows) || codeRows.length === 0) {
    return createDataFrame([], []);
  }

  const symbolDict: Record<string, string> = {};
  for (const item of codeRows) {
    const tradeType = String(item?.TRADE_TYPE ?? '').trim();
    const tradeCode = String(item?.TRADE_CODE ?? '').trim();
    if (tradeType && tradeCode) {
      symbolDict[tradeType] = tradeCode;
    }
  }

  let productId = '';
  const normalizedSymbol = symbol.trim();
  const upperSymbol = normalizedSymbol.toUpperCase();

  if (symbolDict[normalizedSymbol]) {
    productId = symbolDict[normalizedSymbol];
  } else if (symbolDict[upperSymbol]) {
    productId = symbolDict[upperSymbol];
  } else if (Object.values(symbolDict).includes(upperSymbol)) {
    productId = upperSymbol;
  } else if (Object.values(symbolDict).includes(normalizedSymbol)) {
    productId = normalizedSymbol;
  } else if (Object.values(symbolDict).includes(symbol)) {
    productId = symbol;
  } else {
    return createDataFrame([], []);
  }

  const params = {
    reportName: 'RPT_FUTU_STOCKDATA',
    columns: 'SECURITY_CODE,TRADE_DATE,ON_WARRANT_NUM,ADDCHANGE',
    filter: `(SECURITY_CODE="${productId}")(TRADE_DATE>='2020-10-28')`,
    pageNumber: '1',
    pageSize: '500',
    sortTypes: '-1',
    sortColumns: 'TRADE_DATE',
    source: 'WEB',
    client: 'WEB',
  };
  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '库存', '增减'];
  const rows = data.result.data.map((item: any) => {
    const tradeDate = String(item?.TRADE_DATE ?? '');
    const normalizedDate = tradeDate.split(' ')[0] || tradeDate;
    return [
      normalizedDate,
      item?.ON_WARRANT_NUM ?? '',
      item?.ADDCHANGE ?? '',
    ];
  });

  rows.sort((a: any[], b: any[]) => String(a[0]).localeCompare(String(b[0])));

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
