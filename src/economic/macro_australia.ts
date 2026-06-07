/**
 * AKShare TypeScript - 澳大利亚经济数据接口
 * 数据来源: 东方财富
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富澳大利亚经济数据通用函数
 */
async function macroAustraliaCore(symbol: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMICVALUE_AUSTRALIA',
    columns: 'ALL',
    filter: `(INDICATOR_ID="${symbol}")`,
    pageNumber: '1',
    pageSize: '2000',
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
 * 澳大利亚零售销售月率 - 东方财富
 */
export async function macro_australia_retail_rate_monthly(): Promise<DataFrame> {
  return macroAustraliaCore('EMG00152903');
}

/**
 * 澳大利亚贸易帐 - 东方财富
 */
export async function macro_australia_trade(): Promise<DataFrame> {
  return macroAustraliaCore('EMG00152793');
}

/**
 * 澳大利亚失业率 - 东方财富
 */
export async function macro_australia_unemployment_rate(): Promise<DataFrame> {
  return macroAustraliaCore('EMG00101141');
}

/**
 * 澳大利亚生产者物价指数季率 - 东方财富
 */
export async function macro_australia_ppi_quarterly(): Promise<DataFrame> {
  return macroAustraliaCore('EMG00152722');
}

/**
 * 澳大利亚消费者物价指数季率 - 东方财富
 */
export async function macro_australia_cpi_quarterly(): Promise<DataFrame> {
  return macroAustraliaCore('EMG00101104');
}

/**
 * 澳大利亚消费者物价指数年率 - 东方财富
 */
export async function macro_australia_cpi_yearly(): Promise<DataFrame> {
  return macroAustraliaCore('EMG00101093');
}

/**
 * 澳大利亚央行公布利率决议 - 东方财富
 */
export async function macro_australia_bank_rate(): Promise<DataFrame> {
  return macroAustraliaCore('EMG00342255');
}
