/**
 * AKShare TypeScript - 德国经济数据接口
 * 数据来源: 东方财富
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富德国经济数据通用函数
 */
async function macroGermanyCore(symbol: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMICVALUE_GER',
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
 * 德国 IFO 商业景气指数 - 东方财富
 */
export async function macro_germany_ifo(): Promise<DataFrame> {
  return macroGermanyCore('EMG00179154');
}

/**
 * 德国消费者物价指数月率终值 - 东方财富
 */
export async function macro_germany_cpi_monthly(): Promise<DataFrame> {
  return macroGermanyCore('EMG00009758');
}

/**
 * 德国消费者物价指数年率终值 - 东方财富
 */
export async function macro_germany_cpi_yearly(): Promise<DataFrame> {
  return macroGermanyCore('EMG00009756');
}

/**
 * 德国贸易帐(季调后) - 东方财富
 */
export async function macro_germany_trade_adjusted(): Promise<DataFrame> {
  return macroGermanyCore('EMG00009753');
}

/**
 * 德国 GDP - 东方财富
 */
export async function macro_germany_gdp(): Promise<DataFrame> {
  return macroGermanyCore('EMG00009720');
}

/**
 * 德国实际零售销售月率 - 东方财富
 */
export async function macro_germany_retail_sale_monthly(): Promise<DataFrame> {
  return macroGermanyCore('EMG01333186');
}

/**
 * 德国实际零售销售年率 - 东方财富
 */
export async function macro_germany_retail_sale_yearly(): Promise<DataFrame> {
  return macroGermanyCore('EMG01333192');
}

/**
 * 德国 ZEW 经济景气指数 - 东方财富
 */
export async function macro_germany_zew(): Promise<DataFrame> {
  return macroGermanyCore('EMG00172577');
}
