/**
 * AKShare TypeScript - 东方财富网-数据中心-沪深港通-市场概括-分时数据
 * https://data.eastmoney.com/hsgt/hsgtDetail/scgk.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-沪深港通-市场概括-分时数据
 * https://data.eastmoney.com/hsgt/hsgtDetail/scgk.html
 * @param symbol 选择 {"北向资金", "南向资金"}
 * @returns 沪深港通持股-分时数据
 */
export async function stock_hsgt_fund_min_em(symbol: string = '北向资金'): Promise<DataFrame> {
  const url = 'https://push2.eastmoney.com/api/qt/kamtbs.rtmin/get';
  const params = {
    fields1: 'f1,f2,f3,f4',
    fields2: 'f51,f54,f52,f58,f53,f62,f56,f57,f60,f61',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
    _: String(Date.now()),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  if (symbol === '南向资金') {
    const n2sList = data.data.n2s;
    if (!n2sList || n2sList.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '时间', '港股通(沪)', '港股通(深)', '南向资金'];
    const rows = n2sList.map((item: string) => {
      const parts = item.split(',');
      return [
        data.data.n2sDate,
        parts[0],
        parseFloat(parts[1]) || null,
        parseFloat(parts[3]) || null,
        parseFloat(parts[5]) || null,
      ];
    });

    return createDataFrame(columns, rows);
  } else {
    const s2nList = data.data.s2n;
    if (!s2nList || s2nList.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '时间', '沪股通', '深股通', '北向资金'];
    const rows = s2nList.map((item: string) => {
      const parts = item.split(',');
      return [
        data.data.s2nDate,
        parts[0],
        parseFloat(parts[1]) || null,
        parseFloat(parts[3]) || null,
        parseFloat(parts[5]) || null,
      ];
    });

    return createDataFrame(columns, rows);
  }
}
