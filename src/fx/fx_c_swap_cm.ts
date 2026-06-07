/**
 * AKShare TypeScript - 外汇掉期 C-Swap 定盘曲线
 * 中国外汇交易中心暨全国银行间同业拆借中心-基准-外汇市场-外汇掉期曲线-外汇掉期 C-Swap 定盘曲线
 * https://www.chinamoney.org.cn/chinese/bkcurvfsw
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 外汇掉期 C-Swap 定盘曲线
 * 中国外汇交易中心暨全国银行间同业拆借中心-基准-外汇市场-外汇掉期曲线-外汇掉期 C-Swap 定盘曲线
 * https://www.chinamoney.org.cn/chinese/bkcurvfsw
 * @returns 外汇掉期 C-Swap 定盘曲线数据
 */
export async function fx_c_swap_cm(): Promise<DataFrame> {
  const url = 'https://www.chinamoney.org.cn/r/cms/www/chinamoney/data/fx/fx-c-sw-curv-USD.CNY.json';
  const payload = `t=${Date.now()}`;

  const data = await httpPost<any>(url, payload);

  if (!data?.records) {
    return createDataFrame([], []);
  }

  const columns = ['日期时间', '期限品种', '掉期点(Pips)', '掉期点数据源', '全价汇率'];
  const rows = data.records.map((item: any) => [
    item.curveTime,
    item.tenor,
    Number(item.swapPnt),
    item.dataSource,
    Number(item.swapAllPrc),
  ]);

  return createDataFrame(columns, rows);
}
