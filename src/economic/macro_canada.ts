/**
 * AKShare TypeScript - 加拿大经济数据接口
 * 数据来源: 东方财富
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富加拿大经济数据通用函数
 */
async function macroCanadaCore(symbol: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMICVALUE_CA',
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
 * 加拿大新屋开工 - 东方财富
 */
export async function macro_canada_new_house_rate(): Promise<DataFrame> {
  return macroCanadaCore('EMG00342247');
}

/**
 * 加拿大失业率 - 东方财富
 */
export async function macro_canada_unemployment_rate(): Promise<DataFrame> {
  return macroCanadaCore('EMG00157746');
}

/**
 * 加拿大贸易帐 - 东方财富
 */
export async function macro_canada_trade(): Promise<DataFrame> {
  return macroCanadaCore('EMG00102022');
}

/**
 * 加拿大零售销售月率 - 东方财富
 */
export async function macro_canada_retail_rate_monthly(): Promise<DataFrame> {
  return macroCanadaCore('EMG01337094');
}

/**
 * 加拿大央行公布利率决议 - 东方财富
 */
export async function macro_canada_bank_rate(): Promise<DataFrame> {
  return macroCanadaCore('EMG00342248');
}

/**
 * 加拿大核心消费者物价指数年率 - 东方财富
 */
export async function macro_canada_core_cpi_yearly(): Promise<DataFrame> {
  return macroCanadaCore('EMG00102030');
}

/**
 * 加拿大核心消费者物价指数月率 - 东方财富
 */
export async function macro_canada_core_cpi_monthly(): Promise<DataFrame> {
  return macroCanadaCore('EMG00102044');
}

/**
 * 加拿大消费者物价指数年率 - 东方财富
 */
export async function macro_canada_cpi_yearly(): Promise<DataFrame> {
  return macroCanadaCore('EMG00102029');
}

/**
 * 加拿大消费者物价指数月率 - 东方财富
 */
export async function macro_canada_cpi_monthly(): Promise<DataFrame> {
  return macroCanadaCore('EMG00158719');
}

/**
 * 加拿大 GDP 月率 - 东方财富
 */
export async function macro_canada_gdp_monthly(): Promise<DataFrame> {
  return macroCanadaCore('EMG00159259');
}
