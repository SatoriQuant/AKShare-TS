/**
 * AKShare TypeScript - 日本经济数据接口
 * 数据来源: 东方财富
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富日本经济数据通用函数
 */
async function macroJapanCore(symbol: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMICVALUE_JPAN',
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
 * 日本央行公布利率决议 - 东方财富
 */
export async function macro_japan_bank_rate(): Promise<DataFrame> {
  return macroJapanCore('EMG00342252');
}

/**
 * 日本全国消费者物价指数年率 - 东方财富
 */
export async function macro_japan_cpi_yearly(): Promise<DataFrame> {
  return macroJapanCore('EMG00005004');
}

/**
 * 日本全国核心消费者物价指数年率 - 东方财富
 */
export async function macro_japan_core_cpi_yearly(): Promise<DataFrame> {
  return macroJapanCore('EMG00158099');
}

/**
 * 日本失业率 - 东方财富
 */
export async function macro_japan_unemployment_rate(): Promise<DataFrame> {
  return macroJapanCore('EMG00005047');
}

/**
 * 日本领先指标终值 - 东方财富
 */
export async function macro_japan_head_indicator(): Promise<DataFrame> {
  return macroJapanCore('EMG00005117');
}
