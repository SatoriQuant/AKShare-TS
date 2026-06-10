/**
 * AKShare TypeScript - 美国宏观经济数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取美国非农就业数据 - 金十数据中心
 * Python: macro_usa_non_farm 使用 jin10 API，返回列: 商品, 日期, 今值, 预测值, 前值
 */
async function jin10BaseFunc(symbol: string, attrId: string): Promise<DataFrame> {
  const columns = ['商品', '日期', '今值', '预测值', '前值'];
  let allRows: any[][] = [];
  let maxDate = '';

  const headers = {
    'x-app-id': 'rU6QIu7JHe2gOUeR',
    'x-csrf-token': 'x-csrf-token',
    'x-version': '1.0.0',
  };

  while (true) {
    const params: Record<string, any> = {
      max_date: maxDate,
      category: 'ec',
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
      allRows.push([symbol, row[0], row[1], row[2], row[3]]);
    }

    const lastDate = values[values.length - 1][0];
    const d = new Date(lastDate);
    d.setDate(d.getDate() - 1);
    maxDate = d.toISOString().split('T')[0];
  }

  return createDataFrame(columns, allRows);
}

export async function macro_usa_non_farm(): Promise<DataFrame> {
  return jin10BaseFunc('美国非农就业人数', '33');
}

/**
 * 获取美国联邦基金利率 - 东方财富
 */
export async function macro_usa_interest_rate(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_USA_INTEREST_RATE',
    columns: 'ALL',
    pageNumber: '1',
    pageSize: '1000',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '利率', '利率上限', '利率下限'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.INTEREST_RATE,
    item.INTEREST_RATE_CEILING,
    item.INTEREST_RATE_FLOOR,
  ]);

  return createDataFrame(columns, rows);
}
