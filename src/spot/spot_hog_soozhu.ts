/**
 * AKShare TypeScript - 搜猪-生猪大数据
 * https://www.soozhu.com/price/data/center/
 */

import { createDataFrame, DataFrame, sortBy } from '../utils/dataframe';
import axios from 'axios';

const SOOZHU_URL = 'https://www.soozhu.com/price/data/center/';

function extractCookieHeader(setCookie?: string[]): string {
  if (!setCookie || setCookie.length === 0) {
    return '';
  }
  return setCookie
    .map((item) => item.split(';')[0]?.trim())
    .filter((item) => !!item)
    .join('; ');
}

async function postSoozhuData(payload: Record<string, string>): Promise<any> {
  const client = axios.create({
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    validateStatus: (status) => status >= 200 && status < 500,
  });

  const getResp = await client.get<string>(SOOZHU_URL, { responseType: 'text' });
  if (getResp.status >= 400) {
    throw new Error(`获取页面失败: ${getResp.status}`);
  }

  const html = getResp.data || '';
  const tokenMatch = html.match(/name=["']csrfmiddlewaretoken["']\s+value=["']([^"']+)["']/);
  if (!tokenMatch?.[1]) {
    throw new Error('无法获取 CSRF Token');
  }
  const token = tokenMatch[1];

  const cookie = extractCookieHeader(getResp.headers['set-cookie']);
  const formData = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) {
    formData.append(k, v);
  }
  formData.append('csrfmiddlewaretoken', token);

  const postResp = await client.post<any>(SOOZHU_URL, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Referer': SOOZHU_URL,
      'Origin': 'https://www.soozhu.com',
      'X-Requested-With': 'XMLHttpRequest',
      ...(cookie ? { 'Cookie': cookie } : {}),
    },
    responseType: 'json',
  });

  if (postResp.status >= 400) {
    throw new Error(`请求失败: ${postResp.status}`);
  }
  return postResp.data;
}

/**
 * 搜猪-生猪大数据-各省均价实时排行榜
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_hog_soozhu(): Promise<DataFrame> {
  const data = await postSoozhuData({ act: 'mapdata' });

  if (!data?.vlist) {
    return createDataFrame([], []);
  }

  const columns = ['省份', '价格', '涨跌幅'];
  const rows = data.vlist.map((item: any) => [
    item.name,
    Number(item.value[0]),
    Math.round(Number(item.value[1]) * 100) / 100,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 搜猪-生猪大数据-今年以来全国出栏均价走势
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_hog_year_trend_soozhu(): Promise<DataFrame> {
  const data = await postSoozhuData({ act: 'yeartrend' });

  if (!data?.nationlist) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '价格'];
  const rows = data.nationlist.map((item: any) => [
    item[0],
    Number(item[1]),
  ]);

  let df = createDataFrame(columns, rows);
  df = sortBy(df, '日期', true);
  return df;
}

/**
 * 搜猪-生猪大数据-全国瘦肉型肉猪
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_hog_lean_price_soozhu(): Promise<DataFrame> {
  const data = await postSoozhuData({ act: 'pricetrend', indid: '' });

  if (!data?.datalist) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '价格'];
  const rows = data.datalist.map((item: any) => [
    item[0],
    Number(item[1]),
  ]);

  let df = createDataFrame(columns, rows);
  df = sortBy(df, '日期', true);
  return df;
}

/**
 * 搜猪-生猪大数据-全国三元仔猪
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_hog_three_way_soozhu(): Promise<DataFrame> {
  const data = await postSoozhuData({ act: 'pricetrend', indid: '4' });

  if (!data?.datalist) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '价格'];
  const rows = data.datalist.map((item: any) => [
    item[0],
    Number(item[1]),
  ]);

  let df = createDataFrame(columns, rows);
  df = sortBy(df, '日期', true);
  return df;
}

/**
 * 搜猪-生猪大数据-全国后备二元母猪
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_hog_crossbred_soozhu(): Promise<DataFrame> {
  const data = await postSoozhuData({ act: 'pricetrend', indid: '6' });

  if (!data?.datalist) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '价格'];
  const rows = data.datalist.map((item: any) => [
    item[0],
    Number(item[1]),
  ]);

  let df = createDataFrame(columns, rows);
  df = sortBy(df, '日期', true);
  return df;
}

/**
 * 搜猪-生猪大数据-全国玉米价格走势
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_corn_price_soozhu(): Promise<DataFrame> {
  const data = await postSoozhuData({ act: 'pricetrend', indid: '8' });

  if (!data?.datalist) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '价格'];
  const rows = data.datalist.map((item: any) => [
    item[0],
    Number(item[1]),
  ]);

  let df = createDataFrame(columns, rows);
  df = sortBy(df, '日期', true);
  return df;
}

/**
 * 搜猪-生猪大数据-全国豆粕价格走势
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_soybean_price_soozhu(): Promise<DataFrame> {
  const data = await postSoozhuData({ act: 'pricetrend', indid: '9' });

  if (!data?.datalist) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '价格'];
  const rows = data.datalist.map((item: any) => [
    item[0],
    Number(item[1]),
  ]);

  let df = createDataFrame(columns, rows);
  df = sortBy(df, '日期', true);
  return df;
}

/**
 * 搜猪-生猪大数据-全国育肥猪合料（含自配料）半月走势
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_mixed_feed_soozhu(): Promise<DataFrame> {
  const data = await postSoozhuData({ act: 'pricetrend', indid: '11' });

  if (!data?.datalist) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '价格'];
  const rows = data.datalist.map((item: any) => [
    item[0],
    Number(item[1]),
  ]);

  let df = createDataFrame(columns, rows);
  df = sortBy(df, '日期', true);
  return df;
}
