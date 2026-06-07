/**
 * AKShare TypeScript - 港股指数数据接口
 * 新浪财经-港股指数 / 东方财富网-港股指数
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-行情中心-港股指数实时行情
 * https://vip.stock.finance.sina.com.cn/mkt/#zs_hk
 */
export async function stock_hk_index_spot_sina(): Promise<DataFrame> {
  const url =
    'https://hq.sinajs.cn/rn=mtf2t&list=hkCES100,hkCES120,hkCES280,hkCES300,hkCESA80,hkCESG10,' +
    'hkCESHKM,hkCSCMC,hkCSHK100,hkCSHKDIV,hkCSHKLC,hkCSHKLRE,hkCSHKMCS,hkCSHKME,hkCSHKPE,hkCSHKSE,' +
    'hkCSI300,hkCSRHK50,hkGEM,hkHKL,hkHSCCI,hkHSCEI,hkHSI,hkHSMBI,hkHSMOGI,hkHSMPI,hkHSTECH,hkSSE180,' +
    'hkSSE180GV,hkSSE380,hkSSE50,hkSSECEQT,hkSSECOMP,hkSSEDIV,hkSSEITOP,hkSSEMCAP,hkSSEMEGA,hkVHSI';

  const text = await httpGetText(url, {
    headers: { Referer: 'https://vip.stock.finance.sina.com.cn/' },
  });

  const dataLines = text.split('\n').filter(line => line.includes('"'));
  const dataList = dataLines.map(line => {
    const content = line.split('"')[1];
    return content.split(',');
  });

  if (dataList.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '名称', '最新价', '涨跌额', '涨跌幅',
    '昨收', '今开', '最高', '最低',
  ];

  const rows = dataList.map(parts => [
    parts[0],       // 代码
    parts[1],       // 名称
    parseFloat(parts[6]),  // 最新价
    parseFloat(parts[7]),  // 涨跌额
    parseFloat(parts[8]),  // 涨跌幅
    parseFloat(parts[2]),  // 昨收
    parseFloat(parts[3]),  // 今开
    parseFloat(parts[4]),  // 最高
    parseFloat(parts[5]),  // 最低
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-港股-指数实时行情
 * https://quote.eastmoney.com/center/gridlist.html#hk_index
 */
export async function stock_hk_index_spot_em(): Promise<DataFrame> {
  const url = 'https://15.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '200',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    wbp2u: '|0|0|0|web',
    fid: 'f3',
    fs: 'm:124,m:125,m:305',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,' +
      'f26,f22,f33,f11,f62,f128,f136,f115,f152',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '内部编号', '代码', '名称', '最新价', '涨跌额', '涨跌幅',
    '今开', '最高', '最低', '昨收', '成交量', '成交额',
  ];

  const rows = data.data.diff.map((item: any, idx: number) => [
    idx + 1,
    item.f13,
    item.f12,
    item.f14,
    item.f2,
    item.f4,
    item.f3,
    item.f17,
    item.f15,
    item.f16,
    item.f18,
    item.f5,
    item.f6,
  ]);

  return createDataFrame(columns, rows);
}

// Cache for HK index symbol -> internal code mapping
let hkSymbolCodeCache: Record<string, string> | null = null;

/**
 * 获取港股指数代码与内部编号的映射
 */
async function getHkSymbolCodeDict(): Promise<Record<string, string>> {
  if (hkSymbolCodeCache) {
    return hkSymbolCodeCache;
  }

  const df = await stock_hk_index_spot_em();
  const dict: Record<string, string> = { HSAHP: '100' };

  const codeIdx = df.columns.indexOf('代码');
  const internalIdx = df.columns.indexOf('内部编号');

  df.data.forEach(row => {
    dict[row[codeIdx]] = row[internalIdx];
  });

  hkSymbolCodeCache = dict;
  return dict;
}

/**
 * 东方财富网-港股-股票指数历史数据
 * https://quote.eastmoney.com/gb/zsHSTECF2L.html
 *
 * @param symbol 港股指数代码，如 "HSTECH"、"HSI"，可通过 stock_hk_index_spot_em() 获取
 */
export async function stock_hk_index_daily_em(symbol: string = 'HSTECF2L'): Promise<DataFrame> {
  const symbolCodeDict = await getHkSymbolCodeDict();
  const internalCode = symbolCodeDict[symbol];

  if (!internalCode) {
    return createDataFrame([], []);
  }

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: `${internalCode}.${symbol}`,
    klt: '101',
    fqt: '1',
    lmt: '10000',
    end: '20500000',
    iscca: '1',
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64',
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    forcect: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['date', 'open', 'high', 'low', 'latest'];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseFloat(parts[2]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 新浪财经-港股指数-历史行情数据
 * https://stock.finance.sina.com.cn/hkstock/quotes/CES100.html
 *
 * @param symbol 港股指数代码，如 "CES100"
 */
export async function stock_hk_index_daily_sina(symbol: string = 'CES100'): Promise<DataFrame> {
  const url = `https://finance.sina.com.cn/stock/hkstock/${symbol}/klc2_kl.js`;

  const text = await httpGetText(url, {
    params: { d: '2023_5_01' },
  });

  // Parse the JS response - format: var xxx = [{...},...]
  const jsonStr = text.split('=')[1]?.split(';')[0]?.replace(/"/g, '');
  if (!jsonStr) {
    return createDataFrame([], []);
  }

  try {
    // The data is returned as a JS array of objects
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      return createDataFrame([], []);
    }
    const data = JSON.parse(match[0]);

    const columns = ['date', 'open', 'close', 'high', 'low', 'volume'];
    const rows = data.map((item: any) => [
      item.date,
      parseFloat(item.open),
      parseFloat(item.close),
      parseFloat(item.high),
      parseFloat(item.low),
      parseFloat(item.volume),
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
