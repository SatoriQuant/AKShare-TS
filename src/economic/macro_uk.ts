/**
 * AKShare TypeScript - 英国经济数据接口
 * 数据来源: 东方财富
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富英国经济数据通用函数
 */
async function macroUkCore(symbol: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMICVALUE_BRITAIN',
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
 * 英国 Halifax 房价指数月率 - 东方财富
 */
export async function macro_uk_halifax_monthly(): Promise<DataFrame> {
  return macroUkCore('EMG00342256');
}

/**
 * 英国 Halifax 房价指数年率 - 东方财富
 */
export async function macro_uk_halifax_yearly(): Promise<DataFrame> {
  return macroUkCore('EMG00010370');
}

/**
 * 英国贸易帐 - 东方财富
 */
export async function macro_uk_trade(): Promise<DataFrame> {
  return macroUkCore('EMG00158309');
}

/**
 * 英国央行公布利率决议 - 东方财富
 */
export async function macro_uk_bank_rate(): Promise<DataFrame> {
  return macroUkCore('EMG00342253');
}

/**
 * 英国核心消费者物价指数年率 - 东方财富
 */
export async function macro_uk_core_cpi_yearly(): Promise<DataFrame> {
  return macroUkCore('EMG00010279');
}

/**
 * 英国核心消费者物价指数月率 - 东方财富
 */
export async function macro_uk_core_cpi_monthly(): Promise<DataFrame> {
  return macroUkCore('EMG00010291');
}

/**
 * 英国消费者物价指数年率 - 东方财富
 */
export async function macro_uk_cpi_yearly(): Promise<DataFrame> {
  return macroUkCore('EMG00010267');
}

/**
 * 英国消费者物价指数月率 - 东方财富
 */
export async function macro_uk_cpi_monthly(): Promise<DataFrame> {
  return macroUkCore('EMG00010291');
}

/**
 * 英国零售销售月率 - 东方财富
 */
export async function macro_uk_retail_monthly(): Promise<DataFrame> {
  return macroUkCore('EMG00158298');
}

/**
 * 英国零售销售年率 - 东方财富
 */
export async function macro_uk_retail_yearly(): Promise<DataFrame> {
  return macroUkCore('EMG00158297');
}

/**
 * 英国 Rightmove 房价指数年率 - 东方财富
 */
export async function macro_uk_rightmove_yearly(): Promise<DataFrame> {
  return macroUkCore('EMG00341608');
}

/**
 * 英国 Rightmove 房价指数月率 - 东方财富
 */
export async function macro_uk_rightmove_monthly(): Promise<DataFrame> {
  return macroUkCore('EMG00341607');
}

/**
 * 英国 GDP 季率初值 - 东方财富
 */
export async function macro_uk_gdp_quarterly(): Promise<DataFrame> {
  return macroUkCore('EMG00158277');
}

/**
 * 英国 GDP 年率初值 - 东方财富
 */
export async function macro_uk_gdp_yearly(): Promise<DataFrame> {
  return macroUkCore('EMG00158276');
}

/**
 * 英国失业率 - 东方财富
 */
export async function macro_uk_unemployment_rate(): Promise<DataFrame> {
  return macroUkCore('EMG00010348');
}
