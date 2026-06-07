/**
 * AKShare TypeScript - 99 期货-数据-期现-现货走势
 * https://www.99qh.com/data/spotTrend
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  sortBy,
} from '../utils/dataframe';

/**
 * 获取品种和 ID 对应表（内部函数）
 * https://www.99qh.com/data/spotTrend
 */
async function getItemOfSpotPriceQh(): Promise<Record<string, any>[]> {
  const url = 'https://www.99qh.com/data/spotTrend';
  const html = await httpGet<string>(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  // 从 __NEXT_DATA__ script 标签中提取 JSON 数据
  const match = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error('无法获取品种数据');
  }

  const dataJson = JSON.parse(match[1]);
  const bigList: any[] = [];
  for (const item of dataJson.props.pageProps.data.varietyListData) {
    bigList.push(...item.productList);
  }
  return bigList;
}

/**
 * 获取 token（内部函数）
 * https://centerapi.fx168api.com/app/common/v.js
 */
async function getTokenOfSpotPriceQh(): Promise<string> {
  const url = 'https://centerapi.fx168api.com/app/common/v.js';
  const response = await fetch(url, {
    headers: {
      'Origin': 'https://www.99qh.com',
      'Referer': 'https://www.99qh.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  const pcc = response.headers.get('_pcc');
  if (!pcc) {
    throw new Error('无法获取 token');
  }
  return pcc;
}

/**
 * 99 期货-数据-期现-交易所与品种对照表
 * https://www.99qh.com/data/spotTrend
 */
export async function spot_price_table_qh(): Promise<DataFrame> {
  const items = await getItemOfSpotPriceQh();

  const columns = ['交易所名称', '品种名称'];
  const rows = items.map((item: any) => [
    item.qhExchangeName,
    item.name,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 99 期货-数据-期现-现货走势
 * https://www.99qh.com/data/spotTrend
 *
 * @param symbol 品种名称，默认 "螺纹钢"
 */
export async function spot_price_qh(symbol: string = '螺纹钢'): Promise<DataFrame> {
  const items = await getItemOfSpotPriceQh();
  const symbolMap: Record<string, string> = {};
  for (const item of items) {
    symbolMap[item.name] = item.productId;
  }

  const productId = symbolMap[symbol];
  if (!productId) {
    throw new Error(`品种 "${symbol}" 不存在，请通过 spot_price_table_qh() 获取品种列表`);
  }

  const token = await getTokenOfSpotPriceQh();

  const url = 'https://centerapi.fx168api.com/app/qh/api/spot/trend';
  const params = {
    productId: productId,
    pageNo: '1',
    pageSize: '50000',
    startDate: '',
    endDate: '2050-01-01',
    appCategory: 'web',
  };

  const data = await httpGet<any>(url, {
    params,
    headers: {
      '_pcc': token,
      'Origin': 'https://www.99qh.com',
      'Referer': 'https://www.99qh.com',
    },
  });

  if (!data?.data?.list) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '期货收盘价', '现货价格'];
  const rows = data.data.list.map((item: any) => [
    item.date,
    Number(item.fp),
    Number(item.sp),
  ]);

  let df = createDataFrame(columns, rows);
  df = sortBy(df, '日期', true);
  return df;
}
