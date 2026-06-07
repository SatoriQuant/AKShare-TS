/**
 * AKShare TypeScript - 美国宏观经济数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取美国 GDP 数据 - 东方财富
 */
export async function macro_usa_gdp(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_USA_GDP',
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

  const columns = ['日期', 'GDP', 'GDP同比', '人均GDP'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.GDP,
    item.GDP_SAME,
    item.GDP_PER_CAPITA,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取美国 CPI 数据 - 东方财富
 */
export async function macro_usa_cpi(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_USA_CPI',
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

  const columns = ['日期', 'CPI同比', 'CPI环比', '核心CPI同比', '核心CPI环比'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.CPI_SAME,
    item.CPI_SEQUENTIAL,
    item.CORE_CPI_SAME,
    item.CORE_CPI_SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取美国非农就业数据 - 东方财富
 */
export async function macro_usa_non_farm(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_USA_NON_FARM',
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

  const columns = ['日期', '非农就业人数', '失业率', '平均时薪同比'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.NON_FARM,
    item.UNEMPLOYMENT_RATE,
    item.AVERAGE_HOURLY_EARNINGS,
  ]);

  return createDataFrame(columns, rows);
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
