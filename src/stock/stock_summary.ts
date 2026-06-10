/**
 * AKShare TypeScript - 股票数据总貌-市场总貌
 * https://www.szse.cn/market/overview/index.html
 * https://www.sse.com.cn/market/stockdata/statistic/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 上海证券交易所-总貌
 */
export async function stock_sse_summary(): Promise<DataFrame> {
  const url = 'http://query.sse.com.cn/commonQuery.do';
  const params = {
    sqlId: 'COMMON_SSE_SJ_GPSJ_GPSJZM_TJSJ_L',
    PRODUCT_NAME: '股票,主板,科创板',
    type: 'inParams',
  };

  const data = await httpGet<any>(url, {
    params,
    headers: {
      Referer: 'http://www.sse.com.cn/',
    },
  });

  if (!data?.result) {
    return createDataFrame([], []);
  }

  const columns = ['项目', '股票', '主板', '科创板'];
  const keys = Object.keys(data.result);
  const rows = keys.map(key => {
    const item = data.result[key];
    return [
      item.PROJECT_NAME || key,
      item.STOCK,
      item.MAIN,
      item.KC,
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 上海证券交易所-数据-成交概况-每日股票情况
 *
 * @param date 交易日，格式 "20241216"
 */
export async function stock_sse_deal_daily(
  date: string = '20241216'
): Promise<DataFrame> {
  const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;

  const url = 'https://query.sse.com.cn/commonQuery.do';
  const params = {
    sqlId: 'COMMON_SSE_SJ_GPSJ_CJGK_MRGK_C',
    PRODUCT_CODE: '01,02,03,11,17',
    type: 'inParams',
    SEARCH_DATE: formattedDate,
  };

  const data = await httpGet<any>(url, {
    params,
    headers: {
      Referer: 'https://www.sse.com.cn/',
    },
  });

  if (!data?.result) {
    return createDataFrame([], []);
  }

  const columns = ['单日情况', '股票', '主板A', '主板B', '科创板', '股票回购'];

  const nameMap: Record<string, string> = {
    MARKET_CAP: '市价总值',
    VOLUME: '成交量',
    PE_RATIO: '平均市盈率',
    TURNOVER: '换手率',
    DEAL_AMOUNT: '成交金额',
    FREE_CAP: '流通市值',
    FREE_TURNOVER: '流通换手率',
    LISTED_NUM: '挂牌数',
  };

  const desiredOrder = [
    '挂牌数', '市价总值', '流通市值', '成交金额',
    '成交量', '平均市盈率', '换手率', '流通换手率',
  ];

  const rows: any[][] = [];
  const keys = Object.keys(data.result);

  for (const key of keys) {
    const item = data.result[key];
    const name = nameMap[key] || key;
    if (name === key && !desiredOrder.includes(name)) continue;

    rows.push([
      name,
      item.STOCK ?? '-',
      item.MAIN_A ?? '-',
      item.MAIN_B ?? '-',
      item.KC ?? '-',
      item.STOCK_BUYBACK ?? '-',
    ]);
  }

  // Sort by desired order
  rows.sort((a, b) => {
    const idxA = desiredOrder.indexOf(a[0]);
    const idxB = desiredOrder.indexOf(b[0]);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  return createDataFrame(columns, rows);
}
