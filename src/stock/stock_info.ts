/**
 * AKShare TypeScript - 股票基本信息接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取股票基本信息 - 东方财富
 *
 * @param symbol 股票代码，如 "000001"
 */
export async function stock_individual_info_em(
  symbol: string
): Promise<Record<string, any>> {
  const market = symbol.startsWith('6') ? '1' : '0';

  const url = 'https://push2.eastmoney.com/api/qt/stock/get';
  const params = {
    secid: `${market}.${symbol}`,
    fields: 'f57,f58,f59,f162,f167,f116,f117,f173,f177,f127,f115,f164,f168,f169,f170,f171,f172,f177,f531',
    ut: 'fa5fd1943c7b386f172d6893dbbd1d0c',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return {};
  }

  const d = data.data;
  return {
    code: d.f57,
    name: d.f58,
    industry: d.f127,
    area: d.f164,
    pe: d.f162 / 100,
    pb: d.f167 / 100,
    totalValue: d.f116,
    circulatingValue: d.f117,
    market: d.f173 === 1 ? '上海' : '深圳',
    listDate: d.f177,
    roe: d.f172 / 100,
    revenue: d.f115,
    eps: d.f168 / 100,
    bvps: d.f169 / 100,
  };
}

/**
 * 获取A股股票列表 - 东方财富
 */
export async function stock_info_a_code_name(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '10000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23',
    fields: 'f12,f14',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = ['code', 'name'];
  const rows = data.data.diff.map((item: any) => [item.f12, item.f14]);

  return createDataFrame(columns, rows);
}

/**
 * 获取股票板块信息
 *
 * @param symbol 股票代码
 */
export async function stock_individual_basic_em(
  symbol: string
): Promise<Record<string, any>> {
  const market = symbol.startsWith('6') ? '1' : '0';

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_F10_BASIC_ORGINFO',
    columns: 'SECUCODE,SECURITY_NAME_ABBR,ORG_CODE,SECURITY_CODE,ORG_NAME,REG_CAPITAL,FOUND_DATE,CHAIRMAN,SECRETARY,MAIN_BUSINESS,ORG_WEB,REG_ADDRESS,BELONG_INDUSTRY',
    filter: `(SECURITY_CODE="${symbol}")`,
    pageNumber: '1',
    pageSize: '1',
    sortTypes: '-1',
    sortColumns: 'MARKET_CAP',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data?.[0]) {
    return {};
  }

  const d = data.result.data[0];
  return {
    code: d.SECURITY_CODE,
    name: d.SECURITY_NAME_ABBR,
    orgName: d.ORG_NAME,
    regCapital: d.REG_CAPITAL,
    foundDate: d.FOUND_DATE,
    chairman: d.CHAIRMAN,
    secretary: d.SECRETARY,
    mainBusiness: d.MAIN_BUSINESS,
    orgWeb: d.ORG_WEB,
    regAddress: d.REG_ADDRESS,
    belongIndustry: d.BELONG_INDUSTRY,
  };
}

/**
 * 获取沪深京A股实时行情 - 东方财富
 */
export async function stock_zh_a_gdhs_em(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '10000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f124,f107',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '换手率', '市盈率-动态', '市净率', '总市值', '流通市值'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 代码
    item.f14,  // 名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f7,   // 振幅
    item.f8,   // 换手率
    item.f9,   // 市盈率-动态
    item.f23,  // 市净率
    item.f20,  // 总市值
    item.f21,  // 流通市值
  ]);

  return createDataFrame(columns, rows);
}
