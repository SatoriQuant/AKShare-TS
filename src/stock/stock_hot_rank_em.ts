/**
 * AKShare TypeScript - 东方财富个股人气榜
 * https://guba.eastmoney.com/rank/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-个股人气榜-人气榜
 */
export async function stock_hot_rank_em(): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getAllCurrentList';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    marketType: '',
    pageNo: 1,
    pageSize: 100,
  };

  const data = await httpPost<any>(url, payload);
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const rankData = data.data;
  const marks = rankData.map((item: any) =>
    item.sc.includes('SZ') ? `0.${item.sc.substring(2)}` : `1.${item.sc.substring(2)}`
  );

  const secids = marks.join(',') + ',?v=08926209912590994';
  const params = {
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    fltt: '2',
    invt: '2',
    fields: 'f14,f3,f12,f2',
    secids,
  };

  const quoteUrl = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
  const quoteData = await httpGet<any>(quoteUrl, { params });

  if (!quoteData?.data?.diff) {
    return createDataFrame([], []);
  }

  const diff = quoteData.data.diff;
  const columns = ['当前排名', '代码', '股票名称', '最新价', '涨跌额', '涨跌幅'];

  const rows = diff.map((item: any, index: number) => {
    const price = item.f2;
    const changePercent = item.f3;
    const changeAmount = typeof price === 'number' && typeof changePercent === 'number'
      ? price * changePercent / 100
      : NaN;
    return [
      Number(rankData[index].rk),
      rankData[index].sc,
      item.f14,
      price,
      changeAmount,
      changePercent,
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-个股人气榜-历史趋势及粉丝特征
 *
 * @param symbol 带市场表示的证券代码，如 "SZ000665"
 */
export async function stock_hot_rank_detail_em(
  symbol: string = 'SZ000665'
): Promise<DataFrame> {
  const urlRank = 'https://emappdata.eastmoney.com/stockrank/getHisList';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    marketType: '',
    srcSecurityCode: symbol,
    yearType: '5',
  };

  const rankData = await httpPost<any>(urlRank, payload);
  if (!rankData?.data) {
    return createDataFrame([], []);
  }

  const urlFollow = 'https://emappdata.eastmoney.com/stockrank/getHisProfileList';
  const followData = await httpPost<any>(urlFollow, payload);

  const columns = ['时间', '排名', '证券代码', '新晋粉丝', '铁杆粉丝'];
  const rows = rankData.data.map((item: any, index: number) => {
    const followItem = followData?.data?.[index];
    return [
      item.dateTime,
      item.rank,
      symbol,
      followItem ? parseFloat(followItem.newUidRate) / 100 : NaN,
      followItem ? parseFloat(followItem.oldUidRate) / 100 : NaN,
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-个股人气榜-实时变动
 *
 * @param symbol 带市场表示的证券代码，如 "SZ000665"
 */
export async function stock_hot_rank_detail_realtime_em(
  symbol: string = 'SZ000665'
): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getCurrentList';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    marketType: '',
    srcSecurityCode: symbol,
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
 * 东方财富-个股人气榜-热门关键词
 *
 * @param symbol 带市场表示的证券代码，如 "SZ000665"
 */
export async function stock_hot_keyword_em(
  symbol: string = 'SZ000665'
): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getHotStockRankList';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    srcSecurityCode: symbol,
  };

  const data = await httpPost<any>(url, payload);
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '股票代码', '概念名称', '概念代码', '热度'];
  const rows = data.data.map((item: any) => [
    item.dateTime,
    item.sc,
    item.stockName,
    item.stockCode,
    item.hot,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-个股人气榜-最新排名
 *
 * @param symbol 带市场表示的证券代码，如 "SZ000665"
 */
export async function stock_hot_rank_latest_em(
  symbol: string = 'SZ000665'
): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getCurrentLatest';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    marketType: '',
    srcSecurityCode: symbol,
  };

  const data = await httpPost<any>(url, payload);
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['item', 'value'];
  const rows = Object.entries(data.data).map(([key, value]) => [key, value]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-个股人气榜-相关股票
 *
 * @param symbol 带市场表示的证券代码，如 "SZ000665"
 */
export async function stock_hot_rank_relate_em(
  symbol: string = 'SZ000665'
): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getFollowStockRankList';
  const payload = {
    appId: 'appId01',
    globalId: '786e4c21-70dc-435a-93bb-38',
    srcSecurityCode: symbol,
  };

  const data = await httpPost<any>(url, payload);
  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '股票代码', '相关股票代码', '涨跌幅'];
  const rows = data.data.map((item: any) => [
    item.dateTime,
    item.sc,
    item.followSc,
    typeof item.changeRate === 'string'
      ? parseFloat(item.changeRate.replace('%', ''))
      : item.changeRate,
  ]);

  return createDataFrame(columns, rows);
}
