/**
 * AKShare TypeScript - 经济构成数据接口
 * 数据来源: 金十数据中心
 * 包含全球最大黄金ETF和白银ETF持仓报告
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 金十数据中心ETF持仓通用函数
 */
async function getEtfHoldingData(attrId: string, commodityName: string): Promise<DataFrame> {
  const columns = ['商品', '日期', '总库存', '增持/减持', '总价值'];
  let allRows: any[][] = [];
  let maxDate = '';

  const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'x-app-id': 'rU6QIu7JHe2gOUeR',
    'x-csrf-token': 'x-csrf-token',
    'x-version': '1.0.0',
  };

  while (true) {
    const params: Record<string, any> = {
      max_date: maxDate,
      category: 'etf',
      attr_id: attrId,
      _: Date.now(),
    };

    const data = await httpGet<any>('https://datacenter-api.jin10.com/reports/list_v2', {
      params,
      headers,
    });

    if (!data?.data?.values || data.data.values.length === 0) break;

    const values = data.data.values;
    for (const row of values) {
      allRows.push([commodityName, row[0], row[1], row[2], row[3]]);
    }

    const lastDate = values[values.length - 1][0];
    const d = new Date(lastDate);
    d.setDate(d.getDate() - 1);
    maxDate = d.toISOString().split('T')[0];
  }

  return createDataFrame(columns, allRows);
}

/**
 * 全球最大黄金ETF—SPDR Gold Trust 持仓报告 - 金十数据中心
 */
export async function macro_cons_gold(): Promise<DataFrame> {
  return getEtfHoldingData('1', '黄金');
}

/**
 * 全球最大白银ETF—iShares Silver Trust 持仓报告 - 金十数据中心
 */
export async function macro_cons_silver(): Promise<DataFrame> {
  return getEtfHoldingData('2', '白银');
}
