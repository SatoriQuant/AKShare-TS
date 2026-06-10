/**
 * AKShare TypeScript - 奇货可查-资金数据接口（网站版）
 *
 * 对应 Python akshare/qhkc_web/qhkc_fund.py
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

/** 奇货可查-净持仓分布 URL */
const QHKC_FUND_BS_URL = 'https://qhkch.com/ajax/fund_bs_pie.php';

/** 奇货可查-总持仓分布 URL */
const QHKC_FUND_POSITION_URL = 'https://qhkch.com/ajax/fund_position_pie.php';

/** 奇货可查-净持仓变化分布 URL */
const QHKC_FUND_POSITION_CHANGE_URL = 'https://qhkch.com/ajax/fund_position_chge_pie.php';

/** 奇货可查-成交额分布 URL */
const QHKC_FUND_DEAL_URL = 'https://qhkch.com/ajax/fund_deal_pie.php';

// ============ 辅助函数 ============

/**
 * 格式化日期: "20190924" -> "2019-09-24"
 */
function formatDate(date: string | number): string {
  const dateStr = String(date);
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

/**
 * 通用的资金数据获取（用于 datas1 + datas2 格式）
 *
 * @param url API URL
 * @param date 日期
 * @returns [symbolDf, longShortDf]
 */
async function fetchFundDataPair(
  url: string,
  date: string
): Promise<[DataFrame, DataFrame]> {
  const formattedDate = date.includes('-') ? date : formatDate(date);
  const payload = { date: formattedDate };

  const dataJson = await httpPost<any>(url, payload);

  // 品种分布 (datas1)
  const symbolData = dataJson.data.datas1.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalValue = symbolData.reduce(
    (sum: number, item: any) => sum + item.value,
    0
  );
  const symbolRecords = symbolData.map((item: any) => [
    item.name,
    item.value,
    item.value / totalValue,
    formattedDate,
  ]);

  // 多空分布 (datas2)
  const longShortData = dataJson.data.datas2.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalLs = longShortData.reduce(
    (sum: number, item: any) => sum + item.value,
    0
  );
  const longShortRecords = longShortData.map((item: any) => [
    item.name,
    item.value,
    item.value / totalLs,
    formattedDate,
  ]);

  const symbolDf = createDataFrame(
    ['name', 'value', 'ratio', 'date'],
    symbolRecords
  );

  const longShortDf = createDataFrame(
    ['name', 'value', 'ratio', 'date'],
    longShortRecords
  );

  return [symbolDf, longShortDf];
}

// ============ 资金数据函数 ============

/**
 * 奇货可查-资金-净持仓分布
 *
 * 可获取数据的时间段为: "2016-10-10" 至 "2019-09-30"
 *
 * @param date 日期，格式 "20190924" 或 "2019-09-24"
 * @returns [symbolDf, longShortDf]
 *
 * @example
 * ```ts
 * const [symbolDf, longShortDf] = await get_qhkc_fund_bs('20190924');
 * // symbolDf 包含各品种净持仓分布
 * // longShortDf 包含多空分布
 * ```
 */
export async function get_qhkc_fund_bs(
  date: string = '20190924'
): Promise<[DataFrame, DataFrame]> {
  return fetchFundDataPair(QHKC_FUND_BS_URL, date);
}

/**
 * 奇货可查-资金-总持仓分布
 *
 * 可获取数据的时间段为: "2016-10-10" 至 "2019-09-30"
 *
 * @param date 日期，格式 "20190924" 或 "2019-09-24"
 * @returns [symbolDf, longShortDf]
 */
export async function get_qhkc_fund_position(
  date: string = '20190924'
): Promise<[DataFrame, DataFrame]> {
  return fetchFundDataPair(QHKC_FUND_POSITION_URL, date);
}

/**
 * 奇货可查-资金-净持仓变化分布
 *
 * 可获取数据的时间段为: "2016-10-10" 至 "2019-09-30"
 *
 * @param date 日期，格式 "20190924" 或 "2019-09-24"
 * @returns [symbolDf, longShortDf]
 */
export async function get_qhkc_fund_position_change(
  date: string = '20190924'
): Promise<[DataFrame, DataFrame]> {
  return fetchFundDataPair(QHKC_FUND_POSITION_CHANGE_URL, date);
}

/**
 * 奇货可查-资金-成交额分布
 *
 * 可获取数据的时间段为: "2016-10-10" 至 "2019-09-30"
 *
 * @param date 日期，格式 "20190924" 或 "2019-09-24"
 * @returns 成交额分布 DataFrame
 */
export async function get_qhkc_fund_money_change(
  date: string = '20190924'
): Promise<DataFrame> {
  const formattedDate = date.includes('-') ? date : formatDate(date);
  const payload = { date: formattedDate };

  const dataJson = await httpPost<any>(QHKC_FUND_DEAL_URL, payload);

  const symbolData = dataJson.data.datas.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalValue = symbolData.reduce(
    (sum: number, item: any) => sum + item.value,
    0
  );

  const columns = ['name', 'value', 'ratio', 'date'];
  const data = symbolData.map((item: any) => [
    item.name,
    item.value,
    item.value / totalValue,
    formattedDate,
  ]);

  return createDataFrame(columns, data);
}
