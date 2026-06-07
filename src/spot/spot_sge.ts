/**
 * AKShare TypeScript - 上海黄金交易所-数据资讯
 * https://www.sge.com.cn/sjzx/mrhq
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 上海黄金交易所-数据资讯-行情走势-品种表
 * https://www.sge.com.cn/sjzx/mrhq
 */
export async function spot_symbol_table_sge(): Promise<DataFrame> {
  const symbolList = [
    'Au99.99',
    'Au99.95',
    'Au100g',
    'Pt99.95',
    'Ag(T+D)',
    'Au(T+D)',
    'mAu(T+D)',
    'Au(T+N1)',
    'Au(T+N2)',
    'Ag99.99',
    'iAu99.99',
    'Au99.5',
    'iAu100g',
    'iAu99.5',
    'PGC30g',
    'NYAuTN06',
    'NYAuTN12',
  ];

  const columns = ['序号', '品种'];
  const rows = symbolList.map((symbol, index) => [index + 1, symbol]);

  return createDataFrame(columns, rows);
}

/**
 * 上海黄金交易所-实时行情数据
 * https://www.sge.com.cn/
 * https://www.sge.com.cn/graph/quotations
 *
 * @param symbol 品种名称，可通过 spot_symbol_table_sge() 获取品种表
 */
export async function spot_quotations_sge(symbol: string = 'Au99.99'): Promise<DataFrame> {
  const url = 'https://www.sge.com.cn/graph/quotations';
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Host': 'www.sge.com.cn',
    'Origin': 'https://www.sge.com.cn',
    'Pragma': 'no-cache',
    'Referer': 'https://www.sge.com.cn/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const formData = new URLSearchParams();
  formData.append('instid', symbol);

  const data = await httpGet<any>(url, {
    params: { instid: symbol },
    headers,
  });

  if (!data?.heyue || !data?.times || !data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['品种', '时间', '现价', '更新时间'];
  const rows: any[][] = [];
  const updateTime = data.delaystr?.[0]?.split(' ')[1] || '';

  for (let i = 0; i < data.heyue.length; i++) {
    const timeStr = data.times[i];
    // 过滤掉大于等于更新时间的数据
    if (updateTime && timeStr >= updateTime) {
      continue;
    }
    rows.push([
      data.heyue[i],
      timeStr,
      Number(data.data[i]),
      data.delaystr?.[0] || '',
    ]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 上海黄金交易所-数据资讯-行情走势-历史数据
 * https://www.sge.com.cn/sjzx/mrhq
 *
 * @param symbol 品种名称，可通过 spot_symbol_table_sge() 获取品种表
 */
export async function spot_hist_sge(symbol: string = 'Au99.99'): Promise<DataFrame> {
  const url = 'https://www.sge.com.cn/graph/Dailyhq';
  const headers = {
    'Accept': 'text/html, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Host': 'www.sge.com.cn',
    'Origin': 'https://www.sge.com.cn',
    'Pragma': 'no-cache',
    'Referer': 'https://www.sge.com.cn/sjzx/mrhq',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const formData = new URLSearchParams();
  formData.append('instid', symbol);

  const data = await httpPost<any>(url, formData.toString(), { headers });

  if (!data?.time) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '开盘价', '收盘价', '最低价', '最高价'];
  const rows = data.time.map((item: any[]) => [
    item[0],
    Number(item[1]),
    Number(item[2]),
    Number(item[3]),
    Number(item[4]),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 上海黄金交易所-数据资讯-上海金基准价-历史数据
 * https://www.sge.com.cn/sjzx/jzj
 */
export async function spot_golden_benchmark_sge(): Promise<DataFrame> {
  const url = 'https://www.sge.com.cn/graph/DayilyJzj';
  const headers = {
    'Accept': 'text/html, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Host': 'www.sge.com.cn',
    'Origin': 'https://www.sge.com.cn',
    'Pragma': 'no-cache',
    'Referer': 'https://www.sge.com.cn/sjzx/mrhq',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const data = await httpPost<any>(url, '', { headers });

  if (!data?.wp || !data?.zp) {
    return createDataFrame([], []);
  }

  const columns = ['交易时间', '早盘价', '晚盘价'];
  const rows: any[][] = [];

  // wp = 晚盘价, zp = 早盘价，以 wp 为基准对齐
  for (let i = 0; i < data.wp.length; i++) {
    const tradeTime = new Date(data.wp[i][0]).toISOString().split('T')[0];
    const eveningPrice = Number(data.wp[i][1]);
    const morningPrice = data.zp[i] ? Number(data.zp[i][1]) : NaN;
    rows.push([tradeTime, morningPrice, eveningPrice]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 上海黄金交易所-数据资讯-上海银基准价-历史数据
 * https://www.sge.com.cn/sjzx/mrhq
 */
export async function spot_silver_benchmark_sge(): Promise<DataFrame> {
  const url = 'https://www.sge.com.cn/graph/DayilyShsilverJzj';
  const headers = {
    'Accept': 'text/html, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Host': 'www.sge.com.cn',
    'Origin': 'https://www.sge.com.cn',
    'Pragma': 'no-cache',
    'Referer': 'https://www.sge.com.cn/sjzx/mrhq',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const data = await httpPost<any>(url, '', { headers });

  if (!data?.wp || !data?.zp) {
    return createDataFrame([], []);
  }

  const columns = ['交易时间', '早盘价', '晚盘价'];
  const rows: any[][] = [];

  for (let i = 0; i < data.wp.length; i++) {
    const tradeTime = new Date(data.wp[i][0]).toISOString().split('T')[0];
    const eveningPrice = Number(data.wp[i][1]);
    const morningPrice = data.zp[i] ? Number(data.zp[i][1]) : NaN;
    rows.push([tradeTime, morningPrice, eveningPrice]);
  }

  return createDataFrame(columns, rows);
}
