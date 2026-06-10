/**
 * AKShare TypeScript - 期货结算参数
 * 支持: CFFEX中金所, CZCE郑商所, SHFE上期所, INE上能中心, GFEX广期所
 */

import axios from 'axios';
import { httpGet, httpGetText, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 中国金融期货交易所-结算参数
 * http://www.cffex.com.cn/jscs/
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_settle_cffex(date: string = '20260119'): Promise<DataFrame> {
  const yearMonth = date.substring(0, 6);
  const day = date.substring(6, 8);
  const url = `http://www.cffex.com.cn/sj/jscs/${yearMonth}/${day}/${date}_1.csv`;

  try {
    // CFFEX returns GBK-encoded CSV; fetch raw bytes and decode
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const rawBuffer = Buffer.from(response.data as any);
    let text = '';
    try {
      text = new TextDecoder('gbk').decode(rawBuffer);
    } catch {
      text = rawBuffer.toString('utf8');
    }

    if (!text || text.trim().startsWith('<')) {
      return createDataFrame([], []);
    }

    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 3) {
      return createDataFrame([], []);
    }

    const columns = [
      'date', 'symbol', 'variety', 'long_margin_ratio', 'short_margin_ratio',
      'trade_fee_ratio', 'delivery_fee_ratio', 'close_today_fee_ratio',
    ];

    const rows: any[][] = [];
    // Skip header lines
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 6) continue;
      const symbol = parts[0];
      if (!symbol || !/^[A-Z]+/.test(symbol)) continue;

      const varietyMatch = symbol.match(/^([A-Z]+)/);
      if (!varietyMatch) continue;

      rows.push([
        date,
        symbol,
        varietyMatch[1],
        parts[1],
        parts[2],
        parts[3],
        parts[4],
        parts[5],
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 郑州商品交易所-结算参数
 * http://www.czce.com.cn/cn/jysj/jscs/H077003003index_1.htm
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_settle_czce(date: string = '20260119'): Promise<DataFrame> {
  const year = date.substring(0, 4);
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataClearParams.txt`;

  try {
    const response = await httpGetText(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response) {
      return createDataFrame([], []);
    }

    const lines = response.split('\n').filter(line => line.trim());
    if (lines.length < 3) {
      return createDataFrame([], []);
    }

    const columns = [
      'date', 'symbol', 'variety', 'settle_price', 'is_single_market',
      'single_market_days', 'margin_ratio', 'limit_ratio', 'trade_fee',
      'fee_type', 'delivery_fee', 'close_today_fee', 'position_limit', 'trade_limit',
    ];

    const rows: any[][] = [];
    // Skip header lines
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('|').map(p => p.trim());
      if (parts.length < 12) continue;
      const symbol = parts[0];
      if (!symbol || symbol.includes('小计') || symbol.includes('合计') || symbol.includes('总计')) continue;

      const varietyMatch = symbol.match(/^([A-Za-z]+)/);
      if (!varietyMatch) continue;

      rows.push([
        date,
        symbol,
        varietyMatch[1],
        parts[1],
        parts[2],
        parts[3],
        parts[4],
        parts[5],
        parts[6],
        parts[7],
        parts[8],
        parts[9],
        parts[10],
        parts[11],
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海期货交易所-结算参数
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_settle_shfe(date: string = '20260119'): Promise<DataFrame> {
  const url = `https://www.shfe.com.cn/data/tradedata/future/dailydata/js${date}.dat`;

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.o_cursor || data.o_cursor.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      'date', 'symbol', 'variety', 'settle_price',
      'spec_long_margin_ratio', 'hedge_long_margin_ratio',
      'spec_short_margin_ratio', 'hedge_short_margin_ratio',
      'trade_fee_ratio', 'close_today_fee_ratio', 'is_close_today',
    ];

    const rows = data.o_cursor.map((item: any) => {
      const symbol = item.INSTRUMENTID || item.SYMBOL || '';
      const varietyMatch = symbol.match(/^([A-Za-z]+)/);
      return [
        date,
        symbol,
        varietyMatch ? varietyMatch[1] : '',
        item.SETTLEMENTPRICE || '',
        item.SPECLONGMARGINRATIO || '',
        item.HEDGLONGMARGINRATIO || '',
        item.SPECSHORTMARGINRATIO || '',
        item.HEDGSHORTMARGINRATIO || '',
        item.TRADEFEERATIO || '',
        item.TTRADEFEERATIO || '',
        item.ISUNITODAY || item.ISCLOSETODAY || '',
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海国际能源交易中心-结算参数
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_settle_ine(date: string = '20260119'): Promise<DataFrame> {
  const url = `https://www.ine.cn/data/tradedata/future/dailydata/js${date}.dat`;

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.o_cursor || data.o_cursor.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      'date', 'symbol', 'variety', 'settle_price',
      'spec_long_margin_ratio', 'hedge_long_margin_ratio',
      'spec_short_margin_ratio', 'hedge_short_margin_ratio',
      'trade_fee_ratio', 'close_today_fee_ratio', 'is_close_today',
    ];

    const rows = data.o_cursor.map((item: any) => {
      const symbol = item.INSTRUMENTID || item.SYMBOL || '';
      const varietyMatch = symbol.match(/^([A-Za-z]+)/);
      return [
        date,
        symbol,
        varietyMatch ? varietyMatch[1] : '',
        item.SETTLEMENTPRICE || '',
        item.SPECLONGMARGINRATIO || '',
        item.HEDGLONGMARGINRATIO || '',
        item.SPECSHORTMARGINRATIO || '',
        item.HEDGSHORTMARGINRATIO || '',
        item.TRADEFEERATIO || '',
        item.TTRADEFEERATIO || '',
        item.ISUNITODAY || item.ISCLOSETODAY || '',
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 广州期货交易所-结算参数
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_settle_gfex(date: string = '20260119'): Promise<DataFrame> {
  const url = 'http://www.gfex.com.cn/u/interfacesWebTtQueryTradPara/loadDayList';

  try {
    const data = await httpPost<any>(url, 'trade_type=0', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Referer: 'http://www.gfex.com.cn/gfex/rjycs/ywcs.shtml',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!data?.data || data.code !== '0') {
      return createDataFrame([], []);
    }

    // Filter out options (contracts with '-')
    const futuresOnly = data.data.filter(
      (item: any) => !item.contractId?.includes('-')
    );

    if (futuresOnly.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      'date', 'symbol', 'variety', 'spec_buy_rate', 'spec_buy',
      'hedge_buy_rate', 'hedge_buy', 'rise_limit_rate', 'rise_limit',
      'fall_limit', 'agent_tot_buy_posi_quota', 'self_tot_buy_posi_quota',
      'client_buy_posi_quota',
    ];

    const rows = futuresOnly.map((item: any) => {
      const symbol = item.contractId || '';
      const varietyMatch = symbol.match(/^([A-Za-z]+)/);
      return [
        date,
        symbol,
        varietyMatch ? varietyMatch[1] : '',
        item.specBuyRate || '',
        item.specBuy || '',
        item.hedgeBuyRate || '',
        item.hedgeBuy || '',
        item.riseLimitRate || '',
        item.riseLimit || '',
        item.fallLimit || '',
        item.agentTotBuyPosiQuota || '',
        item.selfTotBuyPosiQuota || '',
        item.clientBuyPosiQuota || '',
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 期货交易所结算参数（通用接口）
 *
 * @param date 结算日期，格式 YYYYMMDD
 * @param market 交易所代码：CFFEX中金所, CZCE郑商所, SHFE上期所, INE上能中心, GFEX广期所
 */
const SETTLE_OUTPUT_COLUMNS = [
  'date', 'symbol', 'variety', 'settle_price',
  'long_margin_ratio', 'short_margin_ratio',
  'spec_long_margin_ratio', 'spec_short_margin_ratio',
  'hedge_long_margin_ratio', 'hedge_short_margin_ratio',
  'trade_fee_ratio', 'close_today_fee_ratio', 'delivery_fee_ratio',
  'is_single_market', 'single_market_days',
  'limit_ratio', 'position_limit', 'trade_limit',
  'rise_limit_rate', 'fall_limit_rate',
];

function normalizeSettleColumns(df: DataFrame): DataFrame {
  if (!df.data?.length) return createDataFrame(SETTLE_OUTPUT_COLUMNS, []);
  const cols = df.columns;
  const rows = df.data;
  const fieldMapping: Record<string, string[]> = {
    settle_price: ['settle_price', 'SETTLEMENTPRICE'],
    long_margin_ratio: ['long_margin_ratio', 'margin_ratio', 'SPECLONGMARGINRATIO', 'specBuyRate', 'spec_buy_rate'],
    short_margin_ratio: ['short_margin_ratio', 'SPECSHORTMARGINRATIO', 'hedgeBuyRate', 'hedge_buy_rate'],
    spec_long_margin_ratio: ['spec_long_margin_ratio', 'SPECLONGMARGINRATIO', 'spec_buy_rate'],
    spec_short_margin_ratio: ['spec_short_margin_ratio', 'SPECSHORTMARGINRATIO', 'hedge_buy_rate'],
    hedge_long_margin_ratio: ['hedge_long_margin_ratio', 'HEDGLONGMARGINRATIO', 'hedge_buy_rate'],
    hedge_short_margin_ratio: ['hedge_short_margin_ratio', 'HEDGSHORTMARGINRATIO', 'spec_buy_rate'],
    trade_fee_ratio: ['trade_fee_ratio', 'TRADEFEERATIO'],
    close_today_fee_ratio: ['close_today_fee_ratio', 'TTRADEFEERATIO'],
    delivery_fee_ratio: ['delivery_fee_ratio', 'COMMODITYDELIVFEERATIO'],
    is_single_market: ['is_single_market'],
    single_market_days: ['single_market_days'],
    limit_ratio: ['limit_ratio'],
    position_limit: ['position_limit', 'clientBuyPosiQuota', 'client_buy_posi_quota'],
    trade_limit: ['trade_limit'],
    rise_limit_rate: ['rise_limit_rate', 'riseLimitRate'],
    fall_limit_rate: ['fall_limit_rate', 'fallLimit'],
  };

  const colIdx: Record<string, number> = {};
  cols.forEach((c, i) => { colIdx[c] = i; });

  const newRows = rows.map((row) => {
    const result: any[] = [];
    for (const targetCol of SETTLE_OUTPUT_COLUMNS) {
      if (colIdx[targetCol] !== undefined) {
        result.push(row[colIdx[targetCol]]);
      } else if (targetCol === 'variety' && colIdx['symbol'] !== undefined) {
        const sym = String(row[colIdx['symbol']] ?? '');
        const m = sym.match(/^([A-Za-z]+)/);
        result.push(m ? m[1] : '');
      } else {
        const sources = fieldMapping[targetCol] ?? [];
        let found = false;
        for (const src of sources) {
          if (colIdx[src] !== undefined) {
            result.push(row[colIdx[src]]);
            found = true;
            break;
          }
        }
        if (!found) result.push(null);
      }
    }
    return result;
  });

  return createDataFrame(SETTLE_OUTPUT_COLUMNS, newRows);
}

export async function futures_settle(
  date: string = '20260119',
  market: 'CFFEX' | 'CZCE' | 'SHFE' | 'INE' | 'GFEX' = 'CFFEX'
): Promise<DataFrame> {
  const marketFuncMap: Record<string, (date: string) => Promise<DataFrame>> = {
    CFFEX: futures_settle_cffex,
    CZCE: futures_settle_czce,
    SHFE: futures_settle_shfe,
    INE: futures_settle_ine,
    GFEX: futures_settle_gfex,
  };

  const func = marketFuncMap[market.toUpperCase()];
  if (!func) {
    return createDataFrame(SETTLE_OUTPUT_COLUMNS, []);
  }

  const df = await func(date);
  return normalizeSettleColumns(df);
}
