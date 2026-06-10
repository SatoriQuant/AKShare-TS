/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-期权风险分析
 * https://data.eastmoney.com/other/riskanal.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-期权风险分析
 * https://data.eastmoney.com/other/riskanal.html
 * @returns 期权风险分析
 */
export async function option_risk_analysis_em(): Promise<DataFrame> {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get';

  // 获取所有页面数据
  const allRows: any[][] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = {
      fid: 'f12',
      po: '1',
      pz: '100',
      pn: String(page),
      np: '1',
      fltt: '2',
      invt: '2',
      ut: 'b2884a393a59ad64002292a3e90d46a5',
      fields: 'f1,f2,f3,f12,f13,f14,f302,f303,f325,f326,f327,f329,f328,f301,f152,f154',
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
          item.f3,   // 涨跌幅
          item.f302, // 杠杆比率
          item.f303, // 实际杠杆比率
          item.f325, // Delta
          item.f326, // Gamma
          item.f327, // Vega
          item.f329, // Rho
          item.f328, // Theta
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
    '期权代码', '期权名称', '最新价', '涨跌幅', '杠杆比率', '实际杠杆比率',
    'Delta', 'Gamma', 'Vega', 'Rho', 'Theta', '到期日'
  ];

  return createDataFrame(columns, allRows);
}
