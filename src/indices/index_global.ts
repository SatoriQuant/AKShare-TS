/**
 * AKShare TypeScript - 全球指数数据接口
 * 东方财富网-行情中心-全球指数 / 新浪财经-环球市场
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 全球指数名称与代码映射表 - 东方财富
 */
const indexGlobalEmSymbolMap: Record<string, { code: string; market: string }> = {
  '波罗的海BDI指数': { code: 'BDI', market: '100' },
  '葡萄牙PSI20': { code: 'PSI20', market: '100' },
  '菲律宾马尼拉': { code: 'PSI', market: '100' },
  '泰国SET': { code: 'SET', market: '100' },
  '俄罗斯RTS': { code: 'RTS', market: '100' },
  '巴基斯坦卡拉奇': { code: 'KSE100', market: '100' },
  '越南胡志明': { code: 'VNINDEX', market: '100' },
  '红筹指数': { code: 'HSCCI', market: '124' },
  '印尼雅加达综合': { code: 'JKSE', market: '100' },
  '希腊雅典ASE': { code: 'ASE', market: '100' },
  '墨西哥BOLSA': { code: 'MXX', market: '100' },
  '挪威OSEBX': { code: 'OSEBX', market: '100' },
  '巴西BOVESPA': { code: 'BVSP', market: '100' },
  '波兰WIG': { code: 'WIG', market: '100' },
  '印度孟买SENSEX': { code: 'SENSEX', market: '100' },
  '布拉格指数': { code: 'PX', market: '100' },
  '荷兰AEX': { code: 'AEX', market: '100' },
  '冰岛ICEX': { code: 'ICEXI', market: '100' },
  '斯里兰卡科伦坡': { code: 'CSEALL', market: '100' },
  '富时新加坡海峡时报': { code: 'STI', market: '100' },
  '富时意大利MIB': { code: 'MIB', market: '100' },
  '路透CRB商品指数': { code: 'CRB', market: '100' },
  '比利时BFX': { code: 'BFX', market: '100' },
  '富时AIM全股': { code: 'AXX', market: '100' },
  '新西兰50': { code: 'NZ50', market: '100' },
  '上证指数': { code: '000001', market: '1' },
  '国企指数': { code: 'HSCEI', market: '100' },
  '沪深300': { code: '000300', market: '1' },
  '英国富时100': { code: 'FTSE', market: '100' },
  '中小100': { code: '399005', market: '0' },
  '瑞士SMI': { code: 'SSMI', market: '100' },
  '西班牙IBEX35': { code: 'IBEX', market: '100' },
  '瑞典OMXSPI': { code: 'OMXSPI', market: '100' },
  '爱尔兰综合': { code: 'ISEQ', market: '100' },
  '韩国KOSPI': { code: 'KS11', market: '100' },
  '深证成指': { code: '399001', market: '0' },
  '韩国KOSPI200': { code: 'KOSPI200', market: '100' },
  '芬兰赫尔辛基': { code: 'HEX', market: '100' },
  '恒生指数': { code: 'HSI', market: '100' },
  '欧洲斯托克50': { code: 'SX5E', market: '100' },
  '美元指数': { code: 'UDI', market: '100' },
  '法国CAC40': { code: 'FCHI', market: '100' },
  '台湾加权': { code: 'TWII', market: '100' },
  '英国富时250': { code: 'MCX', market: '100' },
  '富时马来西亚KLCI': { code: 'KLSE', market: '100' },
  'OMX哥本哈根20': { code: 'OMXC20', market: '100' },
  '道琼斯': { code: 'DJIA', market: '100' },
  '奥地利ATX': { code: 'ATX', market: '100' },
  '加拿大S&P/TSX': { code: 'TSX', market: '100' },
  '德国DAX30': { code: 'GDAXI', market: '100' },
  '创业板指': { code: '399006', market: '0' },
  '澳大利亚普通股': { code: 'AORD', market: '100' },
  '标普500': { code: 'SPX', market: '100' },
  '澳大利亚标普200': { code: 'AS51', market: '100' },
  '日经225': { code: 'N225', market: '100' },
  '纳斯达克': { code: 'NDX', market: '100' },
};

/**
 * 全球指数名称与代码映射表 - 新浪
 */
const indexGlobalSinaSymbolMap: Record<string, string> = {
  '英国富时100指数': 'UKX',
  '德国DAX 30种股价指数': 'DAX',
  '俄罗斯MICEX指数': 'INDEXCF',
  '法CAC40指数': 'CAC',
  '瑞士股票指数': 'SWI20',
  '富时意大利MIB指数': 'FTSEMIB',
  '荷兰AEX综合指数': 'AEX',
  '西班牙IBEX指数': 'IBEX',
  '欧洲Stoxx50指数': 'SX5E',
  '加拿大S&P/TSX综合指数': 'GSPTSE',
  '墨西哥BOLSA指数': 'MXX',
  '巴西BOVESPA股票指数': 'IBOV',
  '中国台湾加权指数': 'TWJQ',
  '日经225指数': 'NKY',
  '首尔综合指数': 'KOSPI',
  '印度尼西亚雅加达综合指数': 'JCI',
  '印度孟买SENSEX指数': 'SENSEX',
  '澳大利亚标准普尔200指数': 'AS51',
  '新西兰NZSE 50指数': 'NZ250',
  '埃及CASE 30指数': 'CASE',
};

/**
 * 获取全球指数名称代码映射表 - 东方财富
 */
export function index_global_em_symbol_map(): Record<string, { code: string; market: string }> {
  return { ...indexGlobalEmSymbolMap };
}

/**
 * 东方财富网-行情中心-全球指数-实时行情数据
 * https://quote.eastmoney.com/center/gridlist.html#global_qtzs
 */
export async function index_global_spot_em(): Promise<DataFrame> {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get';
  const params = {
    np: '2',
    fltt: '1',
    invt: '2',
    fs: 'i:1.000001,i:0.399001,i:0.399005,i:0.399006,i:1.000300,i:100.HSI,i:100.HSCEI,i:124.HSCCI,' +
      'i:100.TWII,i:100.N225,i:100.KOSPI200,i:100.KS11,i:100.STI,i:100.SENSEX,i:100.KLSE,i:100.SET,' +
      'i:100.PSI,i:100.KSE100,i:100.VNINDEX,i:100.JKSE,i:100.CSEALL,i:100.SX5E,i:100.FTSE,i:100.MCX,' +
      'i:100.AXX,i:100.FCHI,i:100.GDAXI,i:100.RTS,i:100.IBEX,i:100.PSI20,i:100.OMXC20,i:100.BFX,' +
      'i:100.AEX,i:100.WIG,i:100.OMXSPI,i:100.SSMI,i:100.HEX,i:100.OSEBX,i:100.ATX,i:100.MIB,' +
      'i:100.ASE,i:100.ICEXI,i:100.PX,i:100.ISEQ,i:100.DJIA,i:100.SPX,i:100.NDX,i:100.TSX,' +
      'i:100.BVSP,i:100.MXX,i:100.AS51,i:100.AORD,i:100.NZ50,i:100.UDI,i:100.BDI,i:100.CRB',
    fields: 'f12,f13,f14,f292,f1,f2,f4,f3,f152,f17,f18,f15,f16,f7,f124',
    fid: 'f3',
    pn: '1',
    pz: '200',
    po: '1',
    dect: '1',
    wbp2u: '|0|0|0|web',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅',
    '开盘价', '最高价', '最低价', '昨收价', '振幅', '最新行情时间',
  ];

  const diffObj = data.data.diff;
  const keys = Object.keys(diffObj);
  const rows = keys.map((key, idx) => {
    const item = diffObj[key];
    const timestamp = item.f124;
    let timeStr = '';
    if (timestamp) {
      const d = new Date(timestamp * 1000);
      timeStr = d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    }
    return [
      idx + 1,
      item.f12,
      item.f14,
      (item.f2 ?? 0) / 100,
      (item.f4 ?? 0) / 100,
      (item.f3 ?? 0) / 100,
      (item.f17 ?? 0) / 100,
      (item.f15 ?? 0) / 100,
      (item.f16 ?? 0) / 100,
      (item.f18 ?? 0) / 100,
      (item.f7 ?? 0) / 100,
      timeStr,
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-全球指数-历史行情数据
 * https://quote.eastmoney.com/gb/zsUDI.html
 *
 * @param symbol 指数名称，可通过 index_global_spot_em() 获取
 */
export async function index_global_hist_em(symbol: string = '美元指数'): Promise<DataFrame> {
  const symbolInfo = indexGlobalEmSymbolMap[symbol];
  if (!symbolInfo) {
    return createDataFrame([], []);
  }

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: `${symbolInfo.market}.${symbolInfo.code}`,
    klt: '101',
    fqt: '1',
    lmt: '50000',
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

  const columns = ['日期', '代码', '名称', '今开', '最新价', '最高', '最低', '振幅'];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      data.data.code,
      data.data.name,
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseFloat(parts[7]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 新浪财经-行情中心-环球市场-名称代码映射表
 * https://finance.sina.com.cn/stock/globalindex/quotes/UKX
 */
export function index_global_name_table(): DataFrame {
  const columns = ['指数名称', '代码'];
  const rows = Object.entries(indexGlobalSinaSymbolMap).map(([name, code]) => [name, code]);
  return createDataFrame(columns, rows);
}

/**
 * 新浪财经-行情中心-环球市场-历史行情
 * https://finance.sina.com.cn/stock/globalindex/quotes/UKX
 *
 * @param symbol 指数名称，可通过 index_global_name_table() 获取
 */
export async function index_global_hist_sina(symbol: string = 'OMX'): Promise<DataFrame> {
  const sinaCode = indexGlobalSinaSymbolMap[symbol] || symbol;

  const url = 'https://gi.finance.sina.com.cn/hq/daily';
  const params = {
    symbol: sinaCode,
    num: '10000',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['date', 'open', 'high', 'low', 'close', 'volume'];

  const rows = data.result.data.map((item: any) => [
    item.d,
    parseFloat(item.o),
    parseFloat(item.h),
    parseFloat(item.l),
    parseFloat(item.c),
    parseFloat(item.v),
  ]);

  return createDataFrame(columns, rows);
}
