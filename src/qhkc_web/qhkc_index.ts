/**
 * AKShare TypeScript - 奇货可查-指数数据接口（网站版）
 *
 * 对应 Python akshare/qhkc_web/qhkc_index.py
 * 奇货可查网站: https://qhkch.com
 *
 * 注：期货价格为收盘价; 现货价格来自网络;
 * 基差=现货价格-期货价格; 基差率=(现货价格-期货价格)/现货价格 * 100%
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// ============ API URL 常量 ============

/** 奇货可查-指数详情 URL */
const QHKC_INDEX_URL = 'https://www.qhkch.com/ajax/index_show.php';

/** 奇货可查-大资金动向 URL */
const QHKC_INDEX_TREND_URL = 'https://qhkch.com/ajax/indexes_trend.php';

/** 奇货可查-盈亏详情 URL */
const QHKC_INDEX_PROFIT_LOSS_URL = 'https://qhkch.com/ajax/indexes_profit_loss.php';

// ============ 辅助函数 ============

/**
 * 获取官方指数列表，返回 name -> id 映射
 */
async function getOfficialIndexMap(): Promise<Record<string, string>> {
  const url = 'https://qhkch.com/ajax/official_indexes.php';
  const dataJson = await httpPost<any>(url);
  const nameIdDict: Record<string, string> = {};
  for (const item of dataJson.data) {
    nameIdDict[item.name] = item.id;
  }
  return nameIdDict;
}

// ============ 指数数据函数 ============

/**
 * 奇货可查-指数-指数详情
 *
 * 获得奇货可查的指数数据:
 * '奇货黑链', '奇货商品', '奇货谷物', '奇货贵金属', '奇货饲料',
 * '奇货软商品', '奇货化工', '奇货有色', '奇货股指', '奇货铁合金', '奇货油脂'
 *
 * @param name 指数名称，默认 "奇货商品"
 * @returns 指数详情 DataFrame
 *
 * @example
 * ```ts
 * const df = await get_qhkc_index('奇货谷物');
 * // columns: date, price, volume, open_interest, margin, profit, long_short_ratio
 * ```
 */
export async function get_qhkc_index(
  name: string = '奇货商品'
): Promise<DataFrame> {
  const nameIdDict = await getOfficialIndexMap();
  const payloadId = { id: nameIdDict[name] };

  const dataJson = await httpPost<any>(QHKC_INDEX_URL, payloadId);

  const date = dataJson.data.date;
  const price = dataJson.data.price;
  const volume = dataJson.data.volume;
  const openInterest = dataJson.data.openint;
  const totalValue = dataJson.data.total_value;
  const profit = dataJson.data.profit;
  const longShortRatio = dataJson.data.line;

  const columns = [
    'date', 'price', 'volume', 'open_interest', 'margin', 'profit', 'long_short_ratio',
  ];

  // 每个字段都是数组，按索引组合成行
  const rowCount = date.length;
  const data: any[][] = [];
  for (let i = 0; i < rowCount; i++) {
    data.push([
      date[i],
      price[i],
      volume[i],
      openInterest[i],
      totalValue[i],
      profit[i],
      longShortRatio[i],
    ]);
  }

  return createDataFrame(columns, data);
}

/**
 * 奇货可查-指数-大资金动向
 *
 * 获得奇货可查的指数数据:
 * '奇货黑链', '奇货商品', '奇货谷物', '奇货贵金属', '奇货饲料',
 * '奇货软商品', '奇货化工', '奇货有色', '奇货股指', '奇货铁合金', '奇货油脂'
 *
 * @param name 指数名称，默认 "奇货商品"
 * @returns 大资金动向 DataFrame
 *
 * @example
 * ```ts
 * const df = await get_qhkc_index_trend('奇货贵金属');
 * // columns: broker, grade, money, open_order, variety
 * ```
 */
export async function get_qhkc_index_trend(
  name: string = '奇货商品'
): Promise<DataFrame> {
  const nameIdDict = await getOfficialIndexMap();
  const payloadId = {
    page: 1,
    limit: 10,
    index: nameIdDict[name],
    date: '',
  };

  const dataJson = await httpPost<any>(QHKC_INDEX_TREND_URL, payloadId);

  const columns = ['broker', 'grade', 'money', 'open_order', 'variety'];
  const data = dataJson.data.map((item: any) => [
    item.broker,
    item.grade,
    item.money,
    item.order_money,
    item.variety,
  ]);

  return createDataFrame(columns, data);
}

/**
 * 奇货可查-指数-盈亏详情
 *
 * 获得奇货可查的指数数据:
 * '奇货黑链', '奇货商品', '奇货谷物', '奇货贵金属', '奇货饲料',
 * '奇货软商品', '奇货化工', '奇货有色', '奇货股指', '奇货铁合金', '奇货油脂'
 *
 * @param name 指数名称，默认 "奇货商品"
 * @param startDate 开始日期（可选）
 * @param endDate 结束日期（可选），格式 "20190716"
 * @returns 盈亏详情 DataFrame
 *
 * @example
 * ```ts
 * const df = await get_qhkc_index_profit_loss('奇货贵金属', '', '20250410');
 * // columns: indexes, value, trans_date
 * ```
 */
export async function get_qhkc_index_profit_loss(
  name: string = '奇货商品',
  startDate: string = '',
  endDate: string = ''
): Promise<DataFrame> {
  const nameIdDict = await getOfficialIndexMap();
  const payloadId = {
    index: nameIdDict[name],
    date1: startDate,
    date2: endDate,
  };

  const dataJson = await httpPost<any>(QHKC_INDEX_PROFIT_LOSS_URL, payloadId);

  const indexes = dataJson.data.indexes;
  const values = dataJson.data.value;
  const transDate = dataJson.data.trans_date;

  const columns = ['indexes', 'value', 'trans_date'];
  const data = indexes.map((idx: string, i: number) => [
    idx,
    values[i],
    transDate,
  ]);

  return createDataFrame(columns, data);
}
