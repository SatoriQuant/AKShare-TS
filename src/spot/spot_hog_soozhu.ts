/**
 * AKShare TypeScript - 搜猪-生猪大数据
 * https://www.soozhu.com/price/data/center/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import { createDataFrame, DataFrame, sortBy } from '../utils/dataframe';

/**
 * 获取 CSRF Token（从页面 HTML 中提取）
 */
async function getSoozhuCsrfToken(): Promise<string> {
  const url = 'https://www.soozhu.com/price/data/center/';
  const html = await httpGet<string>(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  // 从 HTML 中提取 csrfmiddlewaretoken
  const match = html.match(/name=["']csrfmiddlewaretoken["']\s+value=["']([^"']+)["']/);
  if (!match) {
    throw new Error('无法获取 CSRF Token');
  }
  return match[1];
}

/**
 * 搜猪-生猪大数据-各省均价实时排行榜
 * https://www.soozhu.com/price/data/center/
 */
export async function spot_hog_soozhu(): Promise<DataFrame> {
  const url = 'https://www.soozhu.com/price/data/center/';
  const token = await getSoozhuCsrfToken();

  const formData = new URLSearchParams();
  formData.append('act', 'mapdata');
  formData.append('csrfmiddlewaretoken', token);

  const data = await httpPost<any>(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.soozhu.com/price/data/center/',
    },
  });

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
  const url = 'https://www.soozhu.com/price/data/center/';
  const token = await getSoozhuCsrfToken();

  const formData = new URLSearchParams();
  formData.append('act', 'yeartrend');
  formData.append('csrfmiddlewaretoken', token);

  const data = await httpPost<any>(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.soozhu.com/price/data/center/',
    },
  });

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
  const url = 'https://www.soozhu.com/price/data/center/';
  const token = await getSoozhuCsrfToken();

  const formData = new URLSearchParams();
  formData.append('act', 'pricetrend');
  formData.append('indid', '');
  formData.append('csrfmiddlewaretoken', token);

  const data = await httpPost<any>(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.soozhu.com/price/data/center/',
    },
  });

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
  const url = 'https://www.soozhu.com/price/data/center/';
  const token = await getSoozhuCsrfToken();

  const formData = new URLSearchParams();
  formData.append('act', 'pricetrend');
  formData.append('indid', '4');
  formData.append('csrfmiddlewaretoken', token);

  const data = await httpPost<any>(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.soozhu.com/price/data/center/',
    },
  });

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
  const url = 'https://www.soozhu.com/price/data/center/';
  const token = await getSoozhuCsrfToken();

  const formData = new URLSearchParams();
  formData.append('act', 'pricetrend');
  formData.append('indid', '6');
  formData.append('csrfmiddlewaretoken', token);

  const data = await httpPost<any>(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.soozhu.com/price/data/center/',
    },
  });

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
  const url = 'https://www.soozhu.com/price/data/center/';
  const token = await getSoozhuCsrfToken();

  const formData = new URLSearchParams();
  formData.append('act', 'pricetrend');
  formData.append('indid', '8');
  formData.append('csrfmiddlewaretoken', token);

  const data = await httpPost<any>(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.soozhu.com/price/data/center/',
    },
  });

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
  const url = 'https://www.soozhu.com/price/data/center/';
  const token = await getSoozhuCsrfToken();

  const formData = new URLSearchParams();
  formData.append('act', 'pricetrend');
  formData.append('indid', '9');
  formData.append('csrfmiddlewaretoken', token);

  const data = await httpPost<any>(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.soozhu.com/price/data/center/',
    },
  });

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
  const url = 'https://www.soozhu.com/price/data/center/';
  const token = await getSoozhuCsrfToken();

  const formData = new URLSearchParams();
  formData.append('act', 'pricetrend');
  formData.append('indid', '11');
  formData.append('csrfmiddlewaretoken', token);

  const data = await httpPost<any>(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.soozhu.com/price/data/center/',
    },
  });

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
