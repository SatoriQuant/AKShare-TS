/**
 * AKShare TypeScript - 东方财富同行比较数据接口
 * https://emweb.securities.eastmoney.com/pc_hsf10/pages/index.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-行情中心-同行比较-成长性比较
 *
 * @param symbol 股票代码，如 "SZ000895"
 */
export async function stock_zh_growth_comparison_em(
  symbol: string = 'SZ000895'
): Promise<DataFrame> {
  const secucode = `${symbol.substring(2)}.${symbol.substring(0, 2)}`;
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_PCF10_INDUSTRY_GROWTH',
    columns: 'ALL',
    quoteColumns: '',
    filter: `(SECUCODE="${secucode}")`,
    pageNumber: '',
    pageSize: '',
    sortTypes: '1',
    sortColumns: 'PAIMING',
    source: 'HSF10',
    client: 'PC',
    v: '02747607708067783',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '简称',
    '基本每股收益增长率-3年复合', '基本每股收益增长率-24A',
    '基本每股收益增长率-TTM', '基本每股收益增长率-25E',
    '基本每股收益增长率-26E', '基本每股收益增长率-27E',
    '营业收入增长率-3年复合', '营业收入增长率-24A',
    '营业收入增长率-TTM', '营业收入增长率-25E',
    '营业收入增长率-26E', '营业收入增长率-27E',
    '净利润增长率-3年复合', '净利润增长率-24A',
    '净利润增长率-TTM', '净利润增长率-25E',
    '净利润增长率-26E', '净利润增长率-27E',
    '基本每股收益增长率-3年复合排名',
  ];

  const rows = data.result.data.map((item: any) => [
    item.CORRE_SECURITY_CODE,
    item.CORRE_SECURITY_NAME,
    item.MGSY_3Y, item.MGSYTB, item.MGSYTTM,
    item.MGSY_1E, item.MGSY_2E, item.MGSY_3E,
    item.YYSR_3Y, item.YYSRTB, item.YYSRTTM,
    item.YYSR_1E, item.YYSR_2E, item.YYSR_3E,
    item.JLR_3Y, item.JLRTB, item.JLRTTM,
    item.JLR_1E, item.JLR_2E, item.JLR_3E,
    item.MGSY_3Y_PAIMING != null ? String(item.MGSY_3Y_PAIMING) : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-行情中心-同行比较-估值比较
 *
 * @param symbol 股票代码，如 "SZ000895"
 */
export async function stock_zh_valuation_comparison_em(
  symbol: string = 'SZ000895'
): Promise<DataFrame> {
  const secucode = `${symbol.substring(2)}.${symbol.substring(0, 2)}`;
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_PCF10_INDUSTRY_CVALUE',
    columns: 'ALL',
    quoteColumns: '',
    filter: `(SECUCODE="${secucode}")`,
    pageNumber: '',
    pageSize: '',
    sortTypes: '1',
    sortColumns: 'PAIMING',
    source: 'HSF10',
    client: 'PC',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '排名', '代码', '简称', 'PEG',
    '市盈率-TTM', '市盈率-25E', '市盈率-26E', '市盈率-27E',
    '市销率-24A', '市销率-TTM', '市销率-25E', '市销率-26E', '市销率-27E',
    '市净率-24A', '市净率-MRQ',
    '市现率1-24A', '市现率1-TTM', '市现率2-24A', '市现率2-TTM',
    'EV/EBITDA-24A',
  ];

  const rawRows = data.result.data.map((item: any) => [
    item.PAIMING,
    item.CORRE_SECURITY_CODE,
    item.CORRE_SECURITY_NAME,
    item.PEG,
    item.PE_TTM, item.PE_1Y, item.PE_2Y, item.PE_3Y,
    item.PS, item.PS_TTM, item.PS_1Y, item.PS_2Y, item.PS_3Y,
    item.PB, item.PB_MRQ,
    item.PCE, item.PCE_TTM, item.PCF, item.PCF_TTM,
    item.QYBS,
  ]);

  // Move the first row (summary) to position 0 with rank info
  const totalCount = data.result.data[0]?.TOTAL_COUNT;
  const rows = [...rawRows];
  if (totalCount && rows.length > 0) {
    rows[0] = [...rows[0]];
    rows[0][0] = `${rows[0][0]}/${totalCount}`;
  }

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-行情中心-同行比较-杜邦分析比较
 *
 * @param symbol 股票代码，如 "SZ000895"
 */
export async function stock_zh_dupont_comparison_em(
  symbol: string = 'SZ000895'
): Promise<DataFrame> {
  const secucode = `${symbol.substring(2)}.${symbol.substring(0, 2)}`;
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_PCF10_INDUSTRY_DBFX',
    columns: 'ALL',
    quoteColumns: '',
    filter: `(SECUCODE="${secucode}")`,
    pageNumber: '',
    pageSize: '',
    sortTypes: '1',
    sortColumns: 'PAIMING',
    source: 'HSF10',
    client: 'PC',
    v: '05086361194054821',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '简称',
    'ROE-3年平均', 'ROE-22A', 'ROE-23A', 'ROE-24A',
    '净利率-3年平均', '净利率-22A', '净利率-23A', '净利率-24A',
    '总资产周转率-3年平均', '总资产周转率-22A', '总资产周转率-23A', '总资产周转率-24A',
    '权益乘数-3年平均', '权益乘数-22A', '权益乘数-23A', '权益乘数-24A',
    'ROE-3年平均排名',
  ];

  const rows = data.result.data.map((item: any) => [
    item.CORRE_SECURITY_CODE,
    item.CORRE_SECURITY_NAME,
    item.ROE_AVG, item.ROEPJ_L3, item.ROEPJ_L2, item.ROEPJ_L1,
    item.XSJLL_AVG, item.XSJLL_L3, item.XSJLL_L2, item.XSJLL_L1,
    item.TOAZZL_AVG, item.TOAZZL_L3, item.TOAZZL_L2, item.TOAZZL_L1,
    item.QYCS_AVG, item.QYCS_L3, item.QYCS_L2, item.QYCS_L1,
    item.ROE_3Y_PAIMING != null ? String(item.ROE_3Y_PAIMING) : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-行情中心-同行比较-公司规模
 *
 * @param symbol 股票代码，如 "SZ000895"
 */
export async function stock_zh_scale_comparison_em(
  symbol: string = 'SZ000895'
): Promise<DataFrame> {
  const secucode = `${symbol.substring(2)}.${symbol.substring(0, 2)}`;
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_PCF10_INDUSTRY_MARKET',
    columns: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,ORG_CODE,CORRE_SECUCODE,CORRE_SECURITY_CODE,CORRE_SECURITY_NAME,CORRE_ORG_CODE,TOTAL_CAP,FREECAP,TOTAL_OPERATEINCOME,NETPROFIT,REPORT_TYPE,TOTAL_CAP_RANK,FREECAP_RANK,TOTAL_OPERATEINCOME_RANK,NETPROFIT_RANK',
    quoteColumns: '',
    filter: `(SECUCODE="${secucode}")(CORRE_SECUCODE="${secucode}")`,
    pageNumber: '1',
    pageSize: '5',
    sortTypes: '-1',
    sortColumns: 'TOTAL_CAP',
    source: 'HSF10',
    client: 'PC',
    v: '005391946600478148',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '简称', '总市值', '总市值排名', '流通市值', '流通市值排名',
    '营业收入', '营业收入排名', '净利润', '净利润排名',
  ];

  const rows = data.result.data.map((item: any) => [
    item.CORRE_SECURITY_CODE,
    item.CORRE_SECURITY_NAME,
    item.TOTAL_CAP,
    item.TOTAL_CAP_RANK,
    item.FREECAP,
    item.FREECAP_RANK,
    item.TOTAL_OPERATEINCOME,
    item.TOTAL_OPERATEINCOME_RANK,
    item.NETPROFIT,
    item.NETPROFIT_RANK,
  ]);

  return createDataFrame(columns, rows);
}
