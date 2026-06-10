/**
 * AKShare TypeScript - 外汇市场行情接口
 * 中国外汇交易中心暨全国银行间同业拆借中心-市场数据-市场行情-外汇市场行情
 * http://www.chinamoney.com.cn/chinese/mkdatapfx/
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/** 中国外汇交易中心请求头 */
const SHORT_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.91 Safari/537.36',
};

/** 人民币外汇即期报价 URL */
const FX_SPOT_URL = 'http://www.chinamoney.com.cn/r/cms/www/chinamoney/data/fx/rfx-sp-quot.json';

/** 人民币外汇远掉报价 URL */
const FX_SWAP_URL = 'http://www.chinamoney.com.cn/r/cms/www/chinamoney/data/fx/rfx-sw-quot.json';

/** 外币对即期报价 URL */
const FX_PAIR_URL = 'http://www.chinamoney.com.cn/r/cms/www/chinamoney/data/fx/cpair-quot.json';

/**
 * 人民币外汇即期报价
 * 中国外汇交易中心暨全国银行间同业拆借中心-市场数据-市场行情-外汇市场行情-人民币外汇即期报价
 * http://www.chinamoney.com.cn/chinese/mkdatapfx/
 * @returns 人民币外汇即期报价
 */
export async function fx_spot_quote(): Promise<DataFrame> {
  const payload = `t=${Date.now()}`;

  const data = await httpPost<any>(FX_SPOT_URL, payload, {
    headers: SHORT_HEADERS,
  });

  if (!data?.records) {
    return createDataFrame([], []);
  }

  const columns = ['货币对', '买报价', '卖报价'];
  const rows = data.records.map((item: any) => [
    item.ccyPair,
    Number(item.bidPrc),
    Number(item.askPrc),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 人民币外汇远掉报价
 * 中国外汇交易中心暨全国银行间同业拆借中心-市场数据-市场行情-债券市场行情-人民币外汇远掉报价
 * https://www.chinamoney.com.cn/chinese/index.html
 * @returns 人民币外汇远掉报价
 */
export async function fx_swap_quote(): Promise<DataFrame> {
  const payload = `t=${Date.now()}`;

  const data = await httpPost<any>(FX_SWAP_URL, payload, {
    headers: SHORT_HEADERS,
  });

  if (!data?.records) {
    return createDataFrame([], []);
  }

  const columns = ['货币对', '1周', '1月', '3月', '6月', '9月', '1年'];
  const rows = data.records.map((item: any) => [
    item.ccyPair,
    item.label_1W,
    item.label_1M,
    item.label_3M,
    item.label_6M,
    item.label_9M,
    item.label_1Y,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 外币对即期报价
 * 中国外汇交易中心暨全国银行间同业拆借中心-市场数据-市场行情-债券市场行情-外币对即期报价
 * http://www.chinamoney.com.cn/chinese/mkdatapfx/
 * @returns 外币对即期报价
 */
export async function fx_pair_quote(): Promise<DataFrame> {
  const payload = `t=${Date.now()}`;

  const data = await httpPost<any>(FX_PAIR_URL, payload, {
    headers: SHORT_HEADERS,
  });

  if (!data?.records) {
    return createDataFrame([], []);
  }

  const columns = ['货币对', '买报价', '卖报价'];
  const rows = data.records.map((item: any) => [
    item.ccyPair,
    Number(item.bidPrc),
    Number(item.askPrc),
  ]);

  return createDataFrame(columns, rows);
}
