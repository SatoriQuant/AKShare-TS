/**
 * AKShare TypeScript - 东方财富网-期货行情
 * futures_hist_em, futures_hist_table_em, futures_global_spot_em, futures_global_hist_em
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-期货行情-交易所品种对照表
 * https://quote.eastmoney.com/qihuo/al2505.html
 */
export async function futures_hist_table_em(): Promise<DataFrame> {
  const url = 'https://futsse-static.eastmoney.com/redis';
  const data = await httpGet<any[]>(url, { params: { msgid: 'gnweb' } });

  const allItems: any[] = [];
  for (const item of data) {
    const mktid = item.mktid;
    const innerData = await httpGet<any[]>(url, { params: { msgid: String(mktid) } });
    for (let num = 1; num <= innerData.length; num++) {
      const pageData = await httpGet<any[]>(url, { params: { msgid: `${mktid}_${num}` } });
      allItems.push(...pageData);
    }
  }

  const columns = ['市场简称', '合约中文代码', '合约代码'];
  const rows = allItems.map((item: any) => [
    item.mktname,
    item.name,
    item.code,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取交易所品种映射
 */
async function getExchangeSymbolMap(): Promise<{
  cContractMkt: Record<string, number>;
  cContractToEContract: Record<string, string>;
  eSymbolMkt: Record<string, number>;
  cSymbolMkt: Record<string, number>;
}> {
  const url = 'https://futsse-static.eastmoney.com/redis';
  const data = await httpGet<any[]>(url, { params: { msgid: 'gnweb' } });

  const allItems: any[] = [];
  for (const item of data) {
    const mktid = item.mktid;
    const innerData = await httpGet<any[]>(url, { params: { msgid: String(mktid) } });
    for (let num = 1; num <= innerData.length; num++) {
      const pageData = await httpGet<any[]>(url, { params: { msgid: `${mktid}_${num}` } });
      allItems.push(...pageData);
    }
  }

  const cContractMkt: Record<string, number> = {};
  const cContractToEContract: Record<string, string> = {};
  const eSymbolMkt: Record<string, number> = {};
  const cSymbolMkt: Record<string, number> = {};

  for (const item of allItems) {
    cContractMkt[item.name] = item.mktid;
    cContractToEContract[item.name] = item.code;
    eSymbolMkt[item.vcode] = item.mktid;
    cSymbolMkt[item.vname] = item.mktid;
  }

  return { cContractMkt, cContractToEContract, eSymbolMkt, cSymbolMkt };
}

/**
 * 东方财富网-期货行情-历史行情数据
 * https://qhweb.eastmoney.com/quote
 *
 * @param symbol 期货代码，如 "热卷主连"
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function futures_hist_em(
  symbol: string = '热卷主连',
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate: string = '19900101',
  endDate: string = '20500101'
): Promise<DataFrame> {
  const periodDict: Record<string, string> = {
    daily: '101',
    weekly: '102',
    monthly: '103',
  };

  const { cContractMkt, cContractToEContract, eSymbolMkt, cSymbolMkt } =
    await getExchangeSymbolMap();

  let secId: string;
  if (cContractMkt[symbol] !== undefined && cContractToEContract[symbol] !== undefined) {
    secId = `${cContractMkt[symbol]}.${cContractToEContract[symbol]}`;
  } else {
    // Separate Chinese/English chars and numbers
    const charMatch = symbol.match(/[一-龥a-zA-Z]+/);
    const numMatch = symbol.match(/\d+/);
    const symbolChar = charMatch ? charMatch[0] : symbol;
    const numbers = numMatch ? numMatch[0] : '';

    if (/^[一-龥]+$/.test(symbolChar)) {
      secId = `${cSymbolMkt[symbolChar]}.${symbolChar}${numbers}`;
    } else {
      secId = `${eSymbolMkt[symbolChar]}.${symbolChar}${numbers}`;
    }
  }

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: secId,
    klt: periodDict[period],
    fqt: '1',
    lmt: '10000',
    end: '20500000',
    iscca: '1',
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64',
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    forcect: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines || data.data.klines.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '时间', '开盘', '最高', '最低', '收盘', '涨跌', '涨跌幅', '成交量', '成交额', '持仓量',
  ];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]) || 0,
      parseFloat(parts[3]) || 0,
      parseFloat(parts[4]) || 0,
      parseFloat(parts[2]) || 0,
      parseFloat(parts[9]) || 0,
      parseFloat(parts[8]) || 0,
      parseInt(parts[5]) || 0,
      parseFloat(parts[6]) || 0,
      parseInt(parts[12]) || 0,
    ];
  });

  // Filter by date range
  const filtered = rows.filter((row: any[]) => {
    const dateStr = row[0]?.replace(/-/g, '');
    return (!startDate || dateStr >= startDate) && (!endDate || dateStr <= endDate);
  });

  return createDataFrame(columns, filtered);
}

/**
 * 东方财富网-行情中心-期货市场-国际期货实时行情
 * https://quote.eastmoney.com/center/gridlist.html#futures_global
 */
export async function futures_global_spot_em(): Promise<DataFrame> {
  const url = 'https://futsseapi.eastmoney.com/list/COMEX,NYMEX,COBOT,SGX,NYBOT,LME,MDEX,TOCOM,IPE';
  const params = {
    orderBy: 'dm',
    sort: 'desc',
    pageSize: '20',
    pageIndex: '0',
    token: '58b2fa8f54638b60b87d69b31969089c',
    field: 'dm,sc,name,p,zsjd,zde,zdf,f152,o,h,l,zjsj,vol,wp,np,ccl',
    blockName: 'callback',
  };

  const data = await httpGet<any>(url, { params });
  const totalNum = data.total || 0;
  const totalPages = Math.ceil(totalNum / 20);

  const allItems: any[] = [];
  for (let page = 0; page < totalPages; page++) {
    const pageData = await httpGet<any>(url, {
      params: { ...params, pageIndex: String(page) },
    });
    if (pageData?.list) {
      allItems.push(...pageData.list);
    }
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅', '今开', '最高', '最低', '昨结', '成交量', '买盘', '卖盘', '持仓量',
  ];

  const rows = allItems.map((item: any, index: number) => [
    index + 1,
    item.dm,
    item.name,
    parseFloat(item.p) || 0,
    parseFloat(item.zde) || 0,
    parseFloat(item.zdf) || 0,
    parseFloat(item.o) || 0,
    parseFloat(item.h) || 0,
    parseFloat(item.l) || 0,
    parseFloat(item.zjsj) || 0,
    parseFloat(item.vol) || 0,
    parseFloat(item.wp) || 0,
    parseFloat(item.np) || 0,
    parseFloat(item.ccl) || 0,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-期货市场-国际期货-历史行情数据
 * @param symbol 品种代码，如 "HG00Y"
 */
export async function futures_global_hist_em(symbol: string = 'HG00Y'): Promise<DataFrame> {
  // Determine market code from symbol
  const marketCode = getGlobalMarketCode(symbol);

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: `${marketCode}.${symbol}`,
    klt: '101',
    fqt: '1',
    lmt: '6600',
    end: '20500000',
    iscca: '1',
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64',
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    forcect: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines || data.data.klines.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '代码', '名称', '开盘', '最新价', '最高', '最低', '总量', '涨幅', '持仓', '日增',
  ];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    let dayIncrease = parseInt(parts[13]) || 0;
    // Fix unsigned 32-bit to signed
    const signedMax = 2147483647;
    if (dayIncrease > signedMax) {
      dayIncrease = dayIncrease - 4294967296;
    }

    return [
      parts[0],
      data.data.code,
      data.data.name,
      parseFloat(parts[1]) || 0,
      parseFloat(parts[2]) || 0,
      parseFloat(parts[3]) || 0,
      parseFloat(parts[4]) || 0,
      parseInt(parts[5]) || 0,
      parseFloat(parts[8]) || 0,
      parseInt(parts[12]) || 0,
      dayIncrease,
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 根据品种代码获取市场代码
 */
function getGlobalMarketCode(symbol: string): number {
  let baseSymbol = '';
  for (let i = 0; i < symbol.length; i++) {
    if (/\d/.test(symbol[i])) break;
    baseSymbol += symbol[i];
  }
  if (!baseSymbol) baseSymbol = symbol;

  // Metals and precious metals - 101
  if (['HG', 'GC', 'SI', 'QI', 'QO', 'MGC', 'LTH'].includes(baseSymbol)) return 101;
  // Energy - 102
  if (['CL', 'NG', 'RB', 'HO', 'PA', 'PL', 'QM'].includes(baseSymbol)) return 102;
  // Agriculture and financial - 103
  if (['ZW', 'ZM', 'ZS', 'ZC', 'XC', 'XK', 'XW', 'YM', 'TY', 'US', 'EH', 'ZL', 'ZR', 'ZO', 'FV', 'TU', 'UL', 'NQ', 'ES'].includes(baseSymbol)) return 103;
  // China market - 104
  if (['TF', 'RT', 'CN'].includes(baseSymbol)) return 104;
  // Soft commodities - 108
  if (['SB', 'CT', 'SF'].includes(baseSymbol)) return 108;
  // Special L prefix - 109
  if (['LCPT', 'LZNT', 'LALT', 'LTNT', 'LLDT', 'LNKT'].includes(baseSymbol)) return 109;
  // MPM - 110
  if (baseSymbol === 'MPM') return 110;
  // Japan market - 111
  if (baseSymbol.startsWith('J')) return 111;
  // Single letter codes - 112
  if (['M', 'B', 'G'].includes(baseSymbol)) return 112;

  return 101; // default
}
