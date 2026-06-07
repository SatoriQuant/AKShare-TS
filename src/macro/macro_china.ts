/**
 * AKShare TypeScript - 中国宏观经济数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取中国 GDP 数据 - 东方财富
 */
export async function macro_china_gdp(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_GDP',
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

  const columns = ['日期', '国内生产总值', '第一产业', '第二产业', '第三产业', '同比增长'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.NOMINAL_GDP,
    item.PRIMARY_INDUSTRY,
    item.SECONDARY_INDUSTRY,
    item.TERTIARY_INDUSTRY,
    item.GDP_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国 CPI 数据 - 东方财富
 */
export async function macro_china_cpi(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_CPI',
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

  const columns = ['日期', '全国同比', '全国环比', '城市同比', '城市环比', '农村同比', '农村环比'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.NATIONAL_SAME,
    item.NATIONAL_SEQUENTIAL,
    item.CITY_SAME,
    item.CITY_SEQUENTIAL,
    item.RURAL_SAME,
    item.RURAL_SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国 PPI 数据 - 东方财富
 */
export async function macro_china_ppi(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_PPI',
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

  const columns = ['日期', '同比', '环比'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.SAME,
    item.SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国 PMI 数据 - 东方财富
 */
export async function macro_china_pmi(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_PMI',
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

  const columns = ['日期', '制造业PMI', '非制造业PMI', '综合PMI'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.MANUFACTURING_PMI,
    item.NON_MANUFACTURING_PMI,
    item.COMPOSITE_PMI,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国货币供应量 - 东方财富
 */
export async function macro_china_supply_of_money(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_CURRENCY_SUPPLY',
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

  const columns = ['日期', 'M0', 'M1', 'M2', 'M0同比', 'M1同比', 'M2同比'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.M0,
    item.M1,
    item.M2,
    item.M0_SAME,
    item.M1_SAME,
    item.M2_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国社会融资规模 - 东方财富
 */
export async function macro_china_shrzgm(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_FINANCING',
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

  const columns = ['日期', '社会融资规模', '新增人民币贷款', '新增外币贷款', '委托贷款', '信托贷款', '未贴现银行承兑汇票', '企业债券', '非金融企业境内股票融资'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.TOTAL,
    item.RMB_LOANS,
    item.FOREX_LOANS,
    item.TRUST_LOANS,
    item.ENTRUST_LOANS,
    item.BANK_ACCEPTANCE,
    item.CORP_BONDS,
    item.STOCK_FINANCING,
  ]);

  return createDataFrame(columns, rows);
}
