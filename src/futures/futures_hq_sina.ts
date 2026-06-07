/**
 * AKShare TypeScript - 新浪财经-外盘期货实时行情
 * https://finance.sina.com.cn/money/future/hf.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// 外盘期货品种映射
const futuresSymbolMap: Record<string, string> = {
  '新加坡铁矿石': 'FEF',
  '马棕油': 'FCPO',
  '日橡胶': 'RSS3',
  '美国原糖': 'RS',
  'CME比特币期货': 'BTC',
  'NYBOT-棉花': 'CT',
  'LME镍3个月': 'NID',
  'LME铅3个月': 'PBD',
  'LME锡3个月': 'SND',
  'LME锌3个月': 'ZSD',
  'LME铝3个月': 'AHD',
  'LME铜3个月': 'CAD',
  'CBOT-黄豆': 'S',
  'CBOT-小麦': 'W',
  'CBOT-玉米': 'C',
  'CBOT-黄豆油': 'BO',
  'CBOT-黄豆粉': 'SM',
  '日本橡胶': 'TRB',
  'COMEX铜': 'HG',
  'NYMEX天然气': 'NG',
  'NYMEX原油': 'CL',
  'COMEX白银': 'SI',
  'COMEX黄金': 'GC',
  'CME-瘦肉猪': 'LHC',
  '布伦特原油': 'OIL',
  '伦敦金': 'XAU',
  '伦敦银': 'XAG',
  '伦敦铂金': 'XPT',
  '伦敦钯金': 'XPD',
  '欧洲碳排放': 'EUA',
};

// 反向映射: 代码 -> 中文名
const codeToNameMap: Record<string, string> = {};
for (const [name, code] of Object.entries(futuresSymbolMap)) {
  codeToNameMap[code] = name;
}

/**
 * 获取外盘期货品种代码列表
 * https://finance.sina.com.cn/money/future/hf.html
 */
export function futures_hq_subscribe_exchange_symbol(): DataFrame {
  const columns = ['symbol', 'code'];
  const rows = Object.entries(futuresSymbolMap).map(([name, code]) => [name, code]);
  return createDataFrame(columns, rows);
}

/**
 * 获取需要订阅的外盘期货行情代码
 */
export function futures_foreign_commodity_subscribe_exchange_symbol(): string[] {
  return Object.values(futuresSymbolMap);
}

/**
 * 新浪-外盘期货-实时行情数据
 * https://finance.sina.com.cn/money/future/hf.html
 *
 * @param symbol 品种代码，如 "GC" 或 "GC,SI" 或 ["GC", "SI"]
 */
export async function futures_foreign_commodity_realtime(
  symbol: string | string[]
): Promise<DataFrame> {
  let symbols: string[];
  if (Array.isArray(symbol)) {
    symbols = symbol;
  } else {
    symbols = symbol.split(',').map(s => s.trim());
  }

  const payload = '?list=' + symbols.map(s => `hf_${s}`).join(',');
  const url = `https://hq.sinajs.cn/${payload}`;

  const headers = {
    Accept: '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    Host: 'hq.sinajs.cn',
    Referer: 'https://finance.sina.com.cn/',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
  };

  try {
    const dataText = await httpGetText(url, { headers });

    // Parse the response: var hhf_XX="value1,value2,...";
    const lines = dataText.split(';').filter(line => line.trim() !== '');

    if (lines.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '名称', '最新价', '人民币报价', '涨跌额', '涨跌幅',
      '开盘价', '最高价', '最低价', '昨日结算价', '持仓量',
      '买价', '卖价', '行情时间', '日期',
    ];

    const rows: any[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;

      const value = line.substring(eqIdx + 1).replace(/"/g, '');
      if (!value) continue;

      const parts = value.split(',');
      if (parts.length < 13) continue;

      const codeIdx = i < symbols.length ? i : symbols.length - 1;
      const code = symbols[codeIdx];
      const name = codeToNameMap[code] || code;

      const currentPrice = parseFloat(parts[0]) || 0;
      const bid = parseFloat(parts[2]) || 0;
      const ask = parseFloat(parts[3]) || 0;
      const high = parseFloat(parts[4]) || 0;
      const low = parseFloat(parts[5]) || 0;
      const time = parts[6] || '';
      const lastSettle = parseFloat(parts[7]) || 0;
      const open = parseFloat(parts[8]) || 0;
      const hold = parseFloat(parts[9]) || 0;
      const date = parts[12] || '';

      const changeAmount = currentPrice - lastSettle;
      const changeRate = lastSettle !== 0 ? ((currentPrice - lastSettle) / lastSettle) * 100 : 0;

      rows.push([
        name, currentPrice, 0, changeAmount, changeRate,
        open, high, low, lastSettle, hold,
        bid, ask, time, date,
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
