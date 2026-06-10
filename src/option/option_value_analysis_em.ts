/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-期权价值分析
 * https://data.eastmoney.com/other/valueAnal.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-期权价值分析
 * https://data.eastmoney.com/other/valueAnal.html
 * @returns 期权价值分析
 */
export async function option_value_analysis_em(): Promise<DataFrame> {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get';

  // 获取所有页面数据
  const allRows: any[][] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = {
      fid: 'f301',
      po: '1',
      pz: '100',
      pn: String(page),
      np: '1',
      fltt: '2',
      invt: '2',
      ut: 'b2884a393a59ad64002292a3e90d46a5',
      fields: 'f1,f2,f3,f12,f13,f14,f298,f299,f249,f300,f330,f331,f332,f333,f334,f335,f336,f301,f152',
      fs: 'm:10',
    };

    try {
      const data = await httpGet<any>(url, { params });

      if (!data?.data?.diff || data.data.diff.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of data.data.diff) {
        allRows.push([
          item.f12,  // 期权代码
          item.f14,  // 期权名称
          item.f2,   // 最新价
          item.f298, // 时间价值
          item.f299, // 内在价值
          item.f249, // 隐含波动率
          item.f300, // 理论价格
          item.f334, // 标的名称
          item.f335, // 标的最新价
          item.f336, // 标的近一年波动率
          item.f301, // 到期日
        ]);
      }

      if (data.data.diff.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    } catch {
      hasMore = false;
    }
  }

  if (allRows.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '期权代码', '期权名称', '最新价', '时间价值', '内在价值', '隐含波动率',
    '理论价格', '标的名称', '标的最新价', '标的近一年波动率', '到期日'
  ];

  return createDataFrame(columns, allRows);
}
