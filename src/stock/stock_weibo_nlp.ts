/**
 * AKShare TypeScript - 金十数据中心微博舆情报告数据接口
 * https://datacenter.jin10.com/market
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 金十数据中心-实时监控-微博舆情报告-时间选项
 * https://datacenter.jin10.com/market
 */
export async function stock_js_weibo_nlp_time(): Promise<Record<string, string>> {
  const url = 'https://datacenter-api.jin10.com/weibo/config';
  const params = {
    _: Date.now().toString(),
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        'x-app-id': 'rU6QIu7JHe2gOUeR',
        'x-version': '1.0.0',
        origin: 'https://datacenter.jin10.com',
        referer: 'https://datacenter.jin10.com/market',
      },
    });

    if (!data?.data?.timescale) {
      return {};
    }

    return data.data.timescale;
  } catch (error) {
    return {};
  }
}

/**
 * 金十数据中心-实时监控-微博舆情报告
 * https://datacenter.jin10.com/market
 *
 * @param timePeriod 时间段，可选值：
 *   CNHOUR2 (2小时), CNHOUR6 (6小时), CNHOUR12 (12小时),
 *   CNHOUR24 (1天), CNDAY7 (1周), CNDAY30 (1月)
 */
export async function stock_js_weibo_report(
  timePeriod: 'CNHOUR2' | 'CNHOUR6' | 'CNHOUR12' | 'CNHOUR24' | 'CNDAY7' | 'CNDAY30' = 'CNHOUR12'
): Promise<DataFrame> {
  const url = 'https://datacenter-api.jin10.com/weibo/list';
  const params = {
    timescale: timePeriod,
    _: Date.now().toString(),
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        'x-app-id': 'rU6QIu7JHe2gOUeR',
        'x-version': '1.0.0',
        origin: 'https://datacenter.jin10.com',
        referer: 'https://datacenter.jin10.com/market',
      },
    });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = ['code', 'name', 'rate', 'color'];
    const rows = data.data.map((item: any) => [
      item.code,
      item.name,
      parseFloat(item.rate) || NaN,
      item.color,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
