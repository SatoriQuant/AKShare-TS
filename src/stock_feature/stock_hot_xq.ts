/**
 * AKShare TypeScript - 雪球-沪深股市-热度排行榜
 * https://xueqiu.com/hq
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 雪球-沪深股市-热度排行榜-关注排行榜
 * https://xueqiu.com/hq
 * @param symbol 选择 {"本周新增", "最热门"}
 * @returns 关注排行榜数据
 */
export async function stock_hot_follow_xq(symbol: string = '最热门'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '本周新增': 'follow7d',
    '最热门': 'follow',
  };

  const url = 'https://xueqiu.com/service/v5/stock/screener/screen';
  const params = {
    category: 'CN',
    size: '200',
    order: 'desc',
    order_by: symbolMap[symbol],
    only_count: '0',
    page: '1',
  };

  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': 'xueqiu.com',
    'Pragma': 'no-cache',
    'Referer': 'https://xueqiu.com/hq',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.data?.list || data.data.list.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['股票代码', '股票简称', '关注', '最新价'];
  const rows = data.data.list.map((item: any) => [
    item.symbol,
    item.name,
    item[symbolMap[symbol]],
    item.current,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 雪球-沪深股市-热度排行榜-讨论排行榜
 * https://xueqiu.com/hq
 * @param symbol 选择 {"本周新增", "最热门"}
 * @returns 讨论排行榜数据
 */
export async function stock_hot_tweet_xq(symbol: string = '最热门'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '本周新增': 'tweet7d',
    '最热门': 'tweet',
  };

  const url = 'https://xueqiu.com/service/v5/stock/screener/screen';
  const params = {
    category: 'CN',
    size: '200',
    order: 'desc',
    order_by: symbolMap[symbol],
    only_count: '0',
    page: '1',
  };

  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': 'xueqiu.com',
    'Pragma': 'no-cache',
    'Referer': 'https://xueqiu.com/hq',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.data?.list || data.data.list.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['股票代码', '股票简称', '讨论', '最新价'];
  const rows = data.data.list.map((item: any) => [
    item.symbol,
    item.name,
    item[symbolMap[symbol]],
    item.current,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 雪球-沪深股市-热度排行榜-分享交易排行榜
 * https://xueqiu.com/hq
 * @param symbol 选择 {"本周新增", "最热门"}
 * @returns 分享交易排行榜数据
 */
export async function stock_hot_deal_xq(symbol: string = '最热门'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '本周新增': 'deal7d',
    '最热门': 'deal',
  };

  const url = 'https://xueqiu.com/service/v5/stock/screener/screen';
  const params = {
    category: 'CN',
    size: '10000',
    order: 'desc',
    order_by: symbolMap[symbol],
    only_count: '0',
    page: '1',
  };

  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': 'xueqiu.com',
    'Pragma': 'no-cache',
    'Referer': 'https://xueqiu.com/hq',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.data?.list || data.data.list.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['股票代码', '股票简称', '交易', '最新价'];
  const rows = data.data.list.map((item: any) => [
    item.symbol,
    item.name,
    item[symbolMap[symbol]],
    item.current,
  ]);

  return createDataFrame(columns, rows);
}
