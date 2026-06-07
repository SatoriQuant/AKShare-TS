/**
 * AKShare TypeScript - 东方财富-财经早餐和全球财经快讯
 * https://stock.eastmoney.com/a/czpnc.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-财经早餐
 * https://stock.eastmoney.com/a/czpnc.html
 * @returns 财经早餐数据
 */
export async function stock_info_cjzc_em(): Promise<DataFrame> {
  const url = 'https://np-listapi.eastmoney.com/comm/web/getNewsByColumns';

  let allData: any[] = [];

  for (let page = 1; page <= 2; page++) {
    const params = {
      client: 'web',
      biz: 'web_news_col',
      column: '1207',
      order: '1',
      needInteractData: '0',
      page_index: String(page),
      page_size: '200',
      req_trace: String(Date.now()),
      fields: 'code,showTime,title,mediaName,summary,image,url,uniqueUrl,Np_dst',
    };

    const data = await httpGet<any>(url, { params });

    if (data?.data?.list) {
      allData = allData.concat(data.data.list);
    }
  }

  if (allData.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['标题', '摘要', '发布时间', '链接'];
  const rows = allData.map((item: any) => [
    item.title,
    item.summary,
    item.showTime,
    item.uniqueUrl,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-全球财经快讯
 * https://kuaixun.eastmoney.com/7_24.html
 * @returns 全球财经快讯数据
 */
export async function stock_info_global_em(): Promise<DataFrame> {
  const url = 'https://np-weblist.eastmoney.com/comm/web/getFastNewsList';
  const params = {
    client: 'web',
    biz: 'web_724',
    fastColumn: '102',
    sortEnd: '',
    pageSize: '200',
    req_trace: String(Date.now()),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.fastNewsList || data.data.fastNewsList.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['标题', '摘要', '发布时间', '链接'];
  const rows = data.data.fastNewsList.map((item: any) => [
    item.title,
    item.summary,
    item.showTime,
    `https://finance.eastmoney.com/a/${item.code}.html`,
  ]);

  return createDataFrame(columns, rows);
}
