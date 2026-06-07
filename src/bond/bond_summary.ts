/**
 * AKShare TypeScript - 上海证券交易所债券概览数据接口
 * 上登债券信息网-债券成交概览
 * http://bond.sse.com.cn/data/statistics/overview/turnover/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取债券现券市场概览
 * http://bond.sse.com.cn/data/statistics/overview/bondow/
 *
 * 注意：此接口返回Excel数据，需要xlsx库解析
 * 目前返回空DataFrame，需要用户自行处理Excel解析
 *
 * @param date 指定日期，格式 "20210111"
 */
export async function bond_cash_summary_sse(date: string = '20210111'): Promise<DataFrame> {
  // 此接口返回Excel文件，需要特殊处理
  // 暂时返回空DataFrame
  console.warn('bond_cash_summary_sse requires Excel parsing support');
  return createDataFrame([], []);
}

/**
 * 获取债券成交概览
 * http://bond.sse.com.cn/data/statistics/overview/turnover/
 *
 * 注意：此接口返回Excel数据，需要xlsx库解析
 * 目前返回空DataFrame，需要用户自行处理Excel解析
 *
 * @param date 指定日期，格式 "20210104"
 */
export async function bond_deal_summary_sse(date: string = '20210104'): Promise<DataFrame> {
  // 此接口返回Excel文件，需要特殊处理
  // 暂时返回空DataFrame
  console.warn('bond_deal_summary_sse requires Excel parsing support');
  return createDataFrame([], []);
}
