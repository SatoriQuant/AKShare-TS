/**
 * AKShare TypeScript - 东方财富港股公司概况
 * https://emweb.securities.eastmoney.com/PC_HKF10/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-港股-证券资料
 *
 * @param symbol 港股代码，如 "03900"
 */
export async function stock_hk_security_profile_em(
  symbol: string = '03900'
): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_HKF10_INFO_SECURITYINFO',
    columns: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,SECURITY_TYPE,LISTING_DATE,ISIN_CODE,BOARD,TRADE_UNIT,TRADE_MARKET,GANGGUTONGBIAODISHEN,GANGGUTONGBIAODIHU,PAR_VALUE,ISSUE_PRICE,ISSUE_NUM,YEAR_SETTLE_DAY',
    quoteColumns: '',
    filter: `(SECUCODE="${symbol}.HK")`,
    pageNumber: '1',
    pageSize: '200',
    sortTypes: '',
    sortColumns: '',
    source: 'F10',
    client: 'PC',
    v: '04748497219912483',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '证券代码', '证券简称', '上市日期', '证券类型', '发行价', '发行量(股)',
    '每手股数', '每股面值', '交易所', '板块', '年结日',
    'ISIN（国际证券识别编码）', '是否沪港通标的', '是否深港通标的',
  ];

  const rows = data.result.data.map((item: any) => [
    item.SECUCODE,
    item.SECURITY_NAME_ABBR,
    item.LISTING_DATE,
    item.SECURITY_TYPE,
    item.ISSUE_PRICE,
    item.ISSUE_NUM,
    item.TRADE_UNIT,
    item.PAR_VALUE,
    item.TRADE_MARKET,
    item.BOARD,
    item.YEAR_SETTLE_DAY,
    item.ISIN_CODE,
    item.GANGGUTONGBIAODIHU,
    item.GANGGUTONGBIAODISHEN,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-港股-公司资料
 *
 * @param symbol 港股代码，如 "03900"
 */
export async function stock_hk_company_profile_em(
  symbol: string = '03900'
): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_HKF10_INFO_ORGPROFILE',
    columns: 'SECUCODE,SECURITY_CODE,ORG_NAME,ORG_EN_ABBR,BELONG_INDUSTRY,FOUND_DATE,CHAIRMAN,SECRETARY,ACCOUNT_FIRM,REG_ADDRESS,ADDRESS,YEAR_SETTLE_DAY,EMP_NUM,ORG_TEL,ORG_FAX,ORG_EMAIL,ORG_WEB,ORG_PROFILE,REG_PLACE',
    quoteColumns: '',
    filter: `(SECUCODE="${symbol}.HK")`,
    pageNumber: '1',
    pageSize: '200',
    sortTypes: '',
    sortColumns: '',
    source: 'F10',
    client: 'PC',
    v: '04748497219912483',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '公司名称', '英文名称', '注册地', '注册地址', '公司成立日期', '所属行业',
    '董事长', '公司秘书', '员工人数', '办公地址', '公司网址', 'E-MAIL',
    '年结日', '联系电话', '核数师', '传真', '公司介绍',
  ];

  const rows = data.result.data.map((item: any) => [
    item.ORG_NAME,
    item.ORG_EN_ABBR,
    item.REG_PLACE,
    item.REG_ADDRESS,
    item.FOUND_DATE,
    item.BELONG_INDUSTRY,
    item.CHAIRMAN,
    item.SECRETARY,
    item.EMP_NUM,
    item.ADDRESS,
    item.ORG_WEB,
    item.ORG_EMAIL,
    item.YEAR_SETTLE_DAY,
    item.ORG_TEL,
    item.ACCOUNT_FIRM,
    item.ORG_FAX,
    item.ORG_PROFILE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-港股-核心必读-最新指标
 *
 * @param symbol 港股代码，如 "03900"
 */
export async function stock_hk_financial_indicator_em(
  symbol: string = '03900'
): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_CUSTOM_HKF10_FN_MAININDICATORMAX',
    columns: 'ORG_CODE,SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,SECURITY_INNER_CODE,REPORT_DATE,BASIC_EPS,PER_NETCASH_OPERATE,BPS,BPS_NEDILUTED,COMMON_ACS,PER_SHARES,ISSUED_COMMON_SHARES,HK_COMMON_SHARES,TOTAL_MARKET_CAP,HKSK_MARKET_CAP,OPERATE_INCOME,OPERATE_INCOME_SQ,OPERATE_INCOME_QOQ,OPERATE_INCOME_QOQ_SQ,HOLDER_PROFIT,HOLDER_PROFIT_SQ,HOLDER_PROFIT_QOQ,HOLDER_PROFIT_QOQ_SQ,PE_TTM,PE_TTM_SQ,PB_TTM,PB_TTM_SQ,NET_PROFIT_RATIO,NET_PROFIT_RATIO_SQ,ROE_AVG,ROE_AVG_SQ,ROA,ROA_SQ,DIVIDEND_TTM,DIVIDEND_LFY,DIVI_RATIO,DIVIDEND_RATE,IS_CNY_CODE',
    quoteColumns: '',
    filter: `(SECUCODE="${symbol}.HK")`,
    pageNumber: '1',
    pageSize: '200',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'F10',
    client: 'PC',
    v: '07945646099062258',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '基本每股收益(元)', '每股净资产(元)', '法定股本(股)', '每手股',
    '每股股息TTM(港元)', '派息比率(%)', '已发行股本(股)', '已发行股本-H股(股)',
    '每股经营现金流(元)', '股息率TTM(%)', '总市值(港元)', '港股市值(港元)',
    '营业总收入', '营业总收入滚动环比增长(%)', '销售净利率(%)',
    '净利润', '净利润滚动环比增长(%)', '股东权益回报率(%)',
    '市盈率', '市净率', '总资产回报率(%)',
  ];

  const rows = data.result.data.map((item: any) => [
    item.BASIC_EPS, item.BPS, item.COMMON_ACS, item.PER_SHARES,
    item.DIVIDEND_TTM, item.DIVI_RATIO, item.ISSUED_COMMON_SHARES,
    item.HK_COMMON_SHARES, item.PER_NETCASH_OPERATE, item.DIVIDEND_RATE,
    item.TOTAL_MARKET_CAP, item.HKSK_MARKET_CAP,
    item.OPERATE_INCOME, item.OPERATE_INCOME_QOQ, item.NET_PROFIT_RATIO,
    item.HOLDER_PROFIT, item.HOLDER_PROFIT_QOQ, item.ROE_AVG,
    item.PE_TTM, item.PB_TTM, item.ROA,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-港股-核心必读-分红派息
 *
 * @param symbol 港股代码，如 "03900"
 */
export async function stock_hk_dividend_payout_em(
  symbol: string = '03900'
): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_HKF10_MAIN_DIVBASIC',
    columns: 'SECURITY_CODE,UPDATE_DATE,REPORT_TYPE,EX_DIVIDEND_DATE,DIVIDEND_DATE,TRANSFER_END_DATE,YEAR,PLAN_EXPLAIN,IS_BFP',
    quoteColumns: '',
    filter: `(SECURITY_CODE="${symbol}")(IS_BFP="0")`,
    pageNumber: '1',
    pageSize: '200',
    sortTypes: '-1,-1',
    sortColumns: 'NOTICE_DATE,EX_DIVIDEND_DATE',
    source: 'F10',
    client: 'PC',
    v: '035584639294227527',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '最新公告日期', '财政年度', '分红方案', '分配类型', '除净日', '截至过户日', '发放日',
  ];

  const rows = data.result.data.map((item: any) => [
    item.UPDATE_DATE,
    item.YEAR,
    item.PLAN_EXPLAIN,
    item.REPORT_TYPE,
    item.EX_DIVIDEND_DATE,
    item.TRANSFER_END_DATE,
    item.DIVIDEND_DATE,
  ]);

  return createDataFrame(columns, rows);
}
