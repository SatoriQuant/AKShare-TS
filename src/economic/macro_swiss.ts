/**
 * AKShare TypeScript - 瑞士经济数据接口
 * 数据来源: 东方财富
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富瑞士经济数据通用函数
 */
async function macroSwissCore(symbol: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMICVALUE_CH',
    columns: 'ALL',
    filter: `(INDICATOR_ID="${symbol}")`,
    pageNumber: '1',
    pageSize: '5000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '前值', '现值', '发布日期'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE_CH,
    item.PRE_VALUE,
    item.VALUE,
    item.PUBLISH_DATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 瑞士 SVME 采购经理人指数 - 东方财富
 */
export async function macro_swiss_svme(): Promise<DataFrame> {
  return macroSwissCore('EMG00341602');
}

/**
 * 瑞士贸易帐 - 东方财富
 */
export async function macro_swiss_trade(): Promise<DataFrame> {
  return macroSwissCore('EMG00341603');
}

/**
 * 瑞士消费者物价指数年率 - 东方财富
 */
export async function macro_swiss_cpi_yearly(): Promise<DataFrame> {
  return macroSwissCore('EMG00341604');
}

/**
 * 瑞士 GDP 季率 - 东方财富
 */
export async function macro_swiss_gdp_quarterly(): Promise<DataFrame> {
  return macroSwissCore('EMG00341600');
}

/**
 * 瑞士 GDP 年率 - 东方财富
 */
export async function macro_swiss_gdp_yearly(): Promise<DataFrame> {
  return macroSwissCore('EMG00341601');
}

/**
 * 瑞士央行公布利率决议 - 东方财富
 */
export async function macro_swiss_bank_rate(): Promise<DataFrame> {
  return macroSwissCore('EMG00341606');
}
