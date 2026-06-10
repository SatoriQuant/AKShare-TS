/**
 * AKShare TypeScript - 东方财富个股人气榜飙升榜
 * https://guba.eastmoney.com/rank/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-个股人气榜-飙升榜
 */
export async function stock_hot_up_em(): Promise<DataFrame> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getAllHisRcList';
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
  const quoteUrl = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
  const params = {
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    fltt: '2',
    invt: '2',
    fields: 'f14,f3,f12,f2',
    secids,
  };

  const quoteData = await httpGet<any>(quoteUrl, { params });
  if (!quoteData?.data?.diff) {
    return createDataFrame([], []);
  }

  const diff = quoteData.data.diff;
  const columns = ['排名较昨日变动', '当前排名', '代码', '股票名称', '最新价', '涨跌额', '涨跌幅'];

  const rows = diff.map((item: any, index: number) => {
    const price = item.f2;
    const changePercent = item.f3;
    const changeAmount = typeof price === 'number' && typeof changePercent === 'number'
      ? price * changePercent / 100
      : NaN;
    return [
      Number(rankData[index].hrc),
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
