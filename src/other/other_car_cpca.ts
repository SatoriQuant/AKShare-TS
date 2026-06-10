/**
 * AKShare TypeScript - 乘联会汽车市场数据
 * http://data.cpcadata.com
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface CPCADataItem {
  [key: string]: any;
}

interface CPCAChartResponse {
  dataList: CPCADataItem[];
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// 乘联会-统计数据-总体市场
// ---------------------------------------------------------------------------

/**
 * 乘联会-统计数据-总体市场
 * http://data.cpcadata.com/TotalMarket
 *
 * @param symbol "狭义乘用车" | "广义乘用车"
 * @param indicator "产量" | "批发" | "零售" | "出口"
 */
export async function car_market_total_cpca(
  symbol: '狭义乘用车' | '广义乘用车' = '狭义乘用车',
  indicator: '产量' | '批发' | '零售' | '出口' = '产量'
): Promise<DataFrame> {
  const url = 'http://data.cpcadata.com/api/chartlist';
  const data = await httpGet<CPCAChartResponse[]>(url, { params: { charttype: '1' } });

  const dataIdx = symbol === '狭义乘用车' ? 0 : 1;
  const items = data[dataIdx]?.dataList;
  if (!items || !items.length) return createDataFrame([], []);

  const cols = Object.keys(items[0]);
  const currentYearCol = cols[1];
  const previousYearCol = cols[2];
  const months = items.map((item: any) => item.month || item['月份']);

  const indicatorIdx = { '产量': 0, '批发': 1, '零售': 2, '出口': 3 }[indicator];

  const currentValues: any[] = [];
  const previousValues: any[] = [];

  for (const item of items) {
    const prevEntry = item[previousYearCol];
    previousValues.push(Array.isArray(prevEntry) ? prevEntry[indicatorIdx] : prevEntry);
    try {
      const currEntry = item[currentYearCol];
      currentValues.push(Array.isArray(currEntry) ? currEntry[indicatorIdx] : currEntry);
    } catch {
      currentValues.push(null);
    }
  }

  const columns = ['月份', previousYearCol, currentYearCol];
  const rows = months.map((month: any, i: number) => [month, previousValues[i] ?? null, currentValues[i] ?? null]);

  return createDataFrame(columns, rows);
}

// ---------------------------------------------------------------------------
// 乘联会-统计数据-厂商排名（批发）
// ---------------------------------------------------------------------------

function carMarketManRankPifa(
  symbol: '狭义乘用车-单月' | '狭义乘用车-累计' | '广义乘用车-单月' | '广义乘用车-累计'
): Promise<DataFrame> {
  return _carMarketManRankInternal(symbol, 'pifa');
}

// ---------------------------------------------------------------------------
// 乘联会-统计数据-厂商排名（零售）
// ---------------------------------------------------------------------------

function carMarketManRankLingshou(
  symbol: '狭义乘用车-单月' | '狭义乘用车-累计' | '广义乘用车-单月' | '广义乘用车-累计'
): Promise<DataFrame> {
  return _carMarketManRankInternal(symbol, 'lingshou');
}

async function _carMarketManRankInternal(
  symbol: '狭义乘用车-单月' | '狭义乘用车-累计' | '广义乘用车-单月' | '广义乘用车-累计',
  type: 'pifa' | 'lingshou'
): Promise<DataFrame> {
  const apiUrl = type === 'pifa'
    ? 'http://data.cpcadata.com/api/chartlist'
    : 'http://data.cpcadata.com/api/chartlist_2';

  const data = await httpGet<CPCAChartResponse[]>(apiUrl, { params: { charttype: '2' } });

  const symbolIdxMap: Record<string, number> = {
    '狭义乘用车-累计': 0,
    '狭义乘用车-单月': 1,
    '广义乘用车-累计': 2,
    '广义乘用车-单月': 3,
  };
  const dataIdx = symbolIdxMap[symbol] ?? 0;
  const items = data[dataIdx]?.dataList;
  if (!items || !items.length) return createDataFrame([], []);

  const cols = Object.keys(items[0]);
  const currentYearCol = cols[1];
  const previousYearCol = cols[2];

  // For pifa use index 0, for lingshou use index 1 of the inner arrays
  const innerIdx = type === 'pifa' ? 0 : 1;

  const currentValues: any[] = [];
  const previousValues: any[] = [];
  const manufacturers: any[] = [];

  for (const item of items) {
    manufacturers.push(item['厂商'] ?? item.manufacturer ?? '');
    const prevEntry = item[previousYearCol];
    previousValues.push(Array.isArray(prevEntry) ? prevEntry[innerIdx] : prevEntry);
    try {
      const currEntry = item[currentYearCol];
      currentValues.push(Array.isArray(currEntry) ? currEntry[innerIdx] : currEntry);
    } catch {
      currentValues.push(null);
    }
  }

  const columns = ['厂商', previousYearCol, currentYearCol];
  const rows = manufacturers.map((m, i) => [m, previousValues[i] ?? null, currentValues[i] ?? null]);

  return createDataFrame(columns, rows);
}

/**
 * 乘联会-统计数据-厂商排名
 * http://data.cpcadata.com/ManRank
 *
 * @param symbol "狭义乘用车-单月" | "狭义乘用车-累计" | "广义乘用车-单月" | "广义乘用车-累计"
 * @param indicator "批发" | "零售"
 */
export async function car_market_man_rank_cpca(
  symbol: '狭义乘用车-单月' | '狭义乘用车-累计' | '广义乘用车-单月' | '广义乘用车-累计' = '狭义乘用车-单月',
  indicator: '批发' | '零售' = '批发'
): Promise<DataFrame> {
  if (indicator === '批发') {
    return carMarketManRankPifa(symbol);
  }
  return carMarketManRankLingshou(symbol);
}

// ---------------------------------------------------------------------------
// 乘联会-统计数据-车型大类（批发）
// ---------------------------------------------------------------------------

async function carMarketCateCpcaInternal(
  symbol: '轿车' | 'MPV' | 'SUV' | '占比',
  type: 'pifa' | 'lingshou'
): Promise<DataFrame> {
  const url = 'http://data.cpcadata.com/api/chartlist';
  const data = await httpGet<CPCAChartResponse[]>(url, { params: { charttype: '3' } });

  const symbolIdxMap: Record<string, number> = {
    'MPV': 0,
    'SUV': 1,
    '轿车': 2,
    '占比': 3,
  };
  const dataIdx = symbolIdxMap[symbol] ?? 0;
  const items = data[dataIdx]?.dataList;
  if (!items || !items.length) return createDataFrame([], []);

  const cols = Object.keys(items[0]);

  // 占比 (ratio) has a different structure
  if (symbol === '占比') {
    const mpvCol = cols[1];
    const suvCol = cols[2];
    const jiaocheCol = cols[3];
    const months = items.map((item: any) => item['月份'] ?? item.month);

    const innerIdx = type === 'pifa' ? 2 : 3;

    const mpvValues: any[] = [];
    const suvValues: any[] = [];
    const jiaocheValues: any[] = [];

    for (const item of items) {
      mpvValues.push(Array.isArray(item[mpvCol]) ? item[mpvCol][innerIdx] : item[mpvCol]);
      suvValues.push(Array.isArray(item[suvCol]) ? item[suvCol][innerIdx] : item[suvCol]);
      jiaocheValues.push(Array.isArray(item[jiaocheCol]) ? item[jiaocheCol][innerIdx] : item[jiaocheCol]);
    }

    const columns = ['月份', mpvCol, suvCol, jiaocheCol];
    const rows = months.map((m: any, i: number) => [m, mpvValues[i], suvValues[i], jiaocheValues[i]]);
    return createDataFrame(columns, rows);
  }

  // Regular categories (MPV, SUV, 轿车)
  const col1 = cols[1];
  const col2 = cols[2];
  const months = items.map((item: any) => item.month ?? item['月份']);

  const innerIdx1 = type === 'pifa' ? 1 : 2;
  const innerIdx2 = type === 'pifa' ? 1 : 2;

  const values1: any[] = [];
  const values2: any[] = [];

  for (const item of items) {
    values1.push(Array.isArray(item[col1]) ? item[col1][innerIdx1] : item[col1]);
    values2.push(Array.isArray(item[col2]) ? item[col2][innerIdx2] : item[col2]);
  }

  // For 轿车, swap column order to match Python behavior
  const columns = symbol === '轿车'
    ? ['月份', col1, col2]
    : ['月份', col2, col1];

  const rows = months.map((m: any, i: number) => {
    if (symbol === '轿车') {
      return [m, values1[i], values2[i]];
    }
    return [m, values2[i], values1[i]];
  });

  return createDataFrame(columns, rows);
}

/**
 * 乘联会-统计数据-车型大类
 * http://data.cpcadata.com/CategoryMarket
 *
 * @param symbol "轿车" | "MPV" | "SUV" | "占比"
 * @param indicator "批发" | "零售"
 */
export async function car_market_cate_cpca(
  symbol: '轿车' | 'MPV' | 'SUV' | '占比' = '轿车',
  indicator: '批发' | '零售' = '批发'
): Promise<DataFrame> {
  return carMarketCateCpcaInternal(symbol, indicator === '批发' ? 'pifa' : 'lingshou');
}

// ---------------------------------------------------------------------------
// 乘联会-统计数据-国别细分市场
// ---------------------------------------------------------------------------

/**
 * 乘联会-统计数据-国别细分市场
 * http://data.cpcadata.com/CountryMarket
 */
export async function car_market_country_cpca(): Promise<DataFrame> {
  const url = 'http://data.cpcadata.com/api/chartlist';
  const data = await httpGet<CPCAChartResponse[]>(url, { params: { charttype: '4' } });

  const items = data[0]?.dataList;
  if (!items || !items.length) return createDataFrame([], []);

  const cols = Object.keys(items[0]);
  const columns = cols.filter(c => c !== 'month' && c !== '月份');
  const months = items.map((item: any) => item.month ?? item['月份']);

  const rows = items.map((item: any) => {
    const row: any[] = [item.month ?? item['月份']];
    for (const col of columns) {
      const val = item[col];
      row.push(Array.isArray(val) ? val[2] : (typeof val === 'number' ? val : Number(val) || null));
    }
    return row;
  });

  return createDataFrame(['月份', ...columns], rows);
}

// ---------------------------------------------------------------------------
// 乘联会-统计数据-级别细分市场
// ---------------------------------------------------------------------------

/**
 * 乘联会-统计数据-级别细分市场
 * http://data.cpcadata.com/SegmentMarket
 *
 * @param symbol "轿车" | "MPV" | "SUV"
 */
export async function car_market_segment_cpca(
  symbol: '轿车' | 'MPV' | 'SUV' = '轿车'
): Promise<DataFrame> {
  const url = 'http://data.cpcadata.com/api/chartlist';
  const data = await httpGet<CPCAChartResponse[]>(url, { params: { charttype: '5' } });

  const symbolIdxMap: Record<string, number> = {
    'MPV': 0,
    'SUV': 1,
    '轿车': 2,
  };
  const dataIdx = symbolIdxMap[symbol] ?? 2;
  const items = data[dataIdx]?.dataList;
  if (!items || !items.length) return createDataFrame([], []);

  const cols = Object.keys(items[0]);
  const dataColumns = cols.filter(c => c !== 'month' && c !== '月份');
  const months = items.map((item: any) => item.month ?? item['月份']);

  const rows = items.map((item: any, i: number) => {
    const row: any[] = [months[i]];
    for (const col of dataColumns) {
      const val = item[col];
      row.push(Array.isArray(val) ? val[2] : (typeof val === 'number' ? val : Number(val) || null));
    }
    return row;
  });

  return createDataFrame(['月份', ...dataColumns], rows);
}

// ---------------------------------------------------------------------------
// 乘联会-统计数据-新能源细分市场
// ---------------------------------------------------------------------------

/**
 * 乘联会-统计数据-新能源细分市场
 * https://data.cpcadata.com/FuelMarket
 *
 * @param symbol "整体市场" | "销量占比-PHEV-BEV" | "销量占比-ICE-NEV"
 */
export async function car_market_fuel_cpca(
  symbol: '整体市场' | '销量占比-PHEV-BEV' | '销量占比-ICE-NEV' = '整体市场'
): Promise<DataFrame> {
  const url = 'http://data.cpcadata.com/api/chartlist';
  const data = await httpGet<CPCAChartResponse[]>(url, { params: { charttype: '6' } });

  const symbolIdxMap: Record<string, number> = {
    '整体市场': 0,
    '销量占比-PHEV-BEV': 1,
    '销量占比-ICE-NEV': 2,
  };
  const dataIdx = symbolIdxMap[symbol] ?? 0;
  const items = data[dataIdx]?.dataList;
  if (!items || !items.length) return createDataFrame([], []);

  const cols = Object.keys(items[0]);
  const currentYearCol = cols[1];
  const previousYearCol = cols[2];
  const months = items.map((item: any) => item.month ?? item['月份']);

  const innerIdx = 2; // Index 2 in inner arrays for fuel data

  const currentValues: any[] = [];
  const previousValues: any[] = [];

  for (const item of items) {
    const prevEntry = item[previousYearCol];
    previousValues.push(Array.isArray(prevEntry) ? prevEntry[innerIdx] : prevEntry);
    try {
      const currEntry = item[currentYearCol];
      currentValues.push(Array.isArray(currEntry) ? currEntry[innerIdx] : currEntry);
    } catch {
      currentValues.push(null);
    }
  }

  const columns = ['月份', previousYearCol, currentYearCol];
  const rows = months.map((m: any, i: number) => [m, previousValues[i] ?? null, currentValues[i] ?? null]);

  return createDataFrame(columns, rows);
}
