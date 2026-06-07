/**
 * AKShare TypeScript - 同花顺-数据中心-技术选股
 * https://data.10jqka.com.cn/rank/cxg/
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 同花顺-数据中心-技术选股-创新高
 * https://data.10jqka.com.cn/rank/cxg/
 * @param symbol 选择 {"创月新高", "半年新高", "一年新高", "历史新高"}
 * @returns 创新高数据
 */
export async function stock_rank_cxg_ths(symbol: string = '创月新高'): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '代码', '名称', '最新价', '涨跌幅', '换手率', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-创新低
 * https://data.10jqka.com.cn/rank/cxd/
 * @param symbol 选择 {"创月新低", "半年新低", "一年新低", "历史新低"}
 * @returns 创新低数据
 */
export async function stock_rank_cxd_ths(symbol: string = '创月新低'): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '代码', '名称', '最新价', '涨跌幅', '换手率', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-连续上涨
 * https://data.10jqka.com.cn/rank/lxsz/
 * @returns 连续上涨数据
 */
export async function stock_rank_lxsz_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '代码', '名称', '最新价', '涨跌幅', '换手率', '连涨天数', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-连续下跌
 * https://data.10jqka.com.cn/rank/lxxd/
 * @returns 连续下跌数据
 */
export async function stock_rank_lxxd_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '代码', '名称', '最新价', '涨跌幅', '换手率', '连涨天数', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-量价齐升
 * https://data.10jqka.com.cn/rank/ljqs/
 * @returns 量价齐升数据
 */
export async function stock_rank_ljqs_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '代码', '名称', '最新价', '涨跌幅', '换手率', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-量价齐跌
 * https://data.10jqka.com.cn/rank/ljqd/
 * @returns 量价齐跌数据
 */
export async function stock_rank_ljqd_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '代码', '名称', '最新价', '涨跌幅', '换手率', '所属行业'];
  return createDataFrame(columns, []);
}
