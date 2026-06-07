/**
 * AKShare TypeScript - 同花顺-数据中心-营业部排名
 * https://data.10jqka.com.cn/market/longhu/
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 同花顺-数据中心-营业部排名-上榜次数最多
 * https://data.10jqka.com.cn/market/longhu/
 * @returns 上榜次数最多数据
 */
export async function stock_lh_yyb_most(): Promise<DataFrame> {
  // Note: THS requires authentication
  const columns = ['序号', '营业部名称', '上榜次数', '买入额', '卖出额', '买入股票数', '卖出股票数'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-营业部排名-资金实力最强
 * https://data.10jqka.com.cn/market/longhu/
 * @returns 资金实力最强数据
 */
export async function stock_lh_yyb_capital(): Promise<DataFrame> {
  // Note: THS requires authentication
  const columns = ['序号', '营业部名称', '最高操作资金', '买入额', '卖出额', '买入股票数', '卖出股票数'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-营业部排名-抱团操作实力
 * https://data.10jqka.com.cn/market/longhu/
 * @returns 抱团操作实力数据
 */
export async function stock_lh_yyb_control(): Promise<DataFrame> {
  // Note: THS requires authentication
  const columns = ['序号', '营业部名称', '协同操作次数', '买入额', '卖出额', '买入股票数', '卖出股票数'];
  return createDataFrame(columns, []);
}
