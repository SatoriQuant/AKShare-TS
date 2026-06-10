/**
 * AKShare TypeScript - 东方财富港股个股人气榜
 * https://guba.eastmoney.com/rank/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-个股人气榜-港股市场
 */
export async function stock_hk_hot_rank_em(): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getAllCurrHkUsList';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    marketType: '000003',
    pageNo: 1,
    pageSize: 100,
  };

  const data = await httpPost<any>(url, payload);
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const rankData = data.data;
  const marks = rankData.map((item: any) => `116.${item.sc.substring(3)}`);

  const quoteUrl = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
  const params = {
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    fltt: '2',
    invt: '2',
    fields: 'f14,f3,f12,f2',
    secids: marks.join(',') + ',?v=08926209912590994',
  };

  const quoteData = await httpGet<any>(quoteUrl, { params });
  if (!quoteData?.data?.diff) {
    return createDataFrame([], []);
  }

  const diff = quoteData.data.diff;
  const columns = ['当前排名', '代码', '股票名称', '最新价', '涨跌幅'];

  const rows = diff.map((item: any, index: number) => [
    Number(rankData[index].rk),
    rankData[index].sc.split('|')[1],
    item.f14,
    item.f2,
    item.f3,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-个股人气榜-港股历史趋势
 *
 * @param symbol 港股代码，如 "00700"
 */
export async function stock_hk_hot_rank_detail_em(
  symbol: string = '00700'
): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getHisHkUsList';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    marketType: '000003',
    srcSecurityCode: `HK|${symbol}`,
  };

  const data = await httpPost<any>(url, payload);
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '排名', '证券代码'];
  const rows = data.data.map((item: any) => [
    item.dateTime,
    item.rank,
    symbol,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-个股人气榜-港股实时变动
 *
 * @param symbol 港股代码，如 "00700"
 */
export async function stock_hk_hot_rank_detail_realtime_em(
  symbol: string = '00700'
): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getCurrentHkUsList';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    marketType: '000003',
    srcSecurityCode: `HK|${symbol}`,
  };

  const data = await httpPost<any>(url, payload);
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '排名'];
  const rows = data.data.map((item: any) => [item.dateTime, item.rank]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-个股人气榜-港股最新排名
 *
 * @param symbol 港股代码，如 "00700"
 */
export async function stock_hk_hot_rank_latest_em(
  symbol: string = '00700'
): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getCurrentHkUsLatest';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    marketType: '000003',
    srcSecurityCode: `HK|${symbol}`,
  };

  const data = await httpPost<any>(url, payload);
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['item', 'value'];
  const rows = Object.entries(data.data).map(([key, value]) => [key, value]);

  return createDataFrame(columns, rows);
}
