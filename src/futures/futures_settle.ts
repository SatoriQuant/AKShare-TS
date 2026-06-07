/**
 * AKShare TypeScript - 期货结算参数
 * 支持: CFFEX中金所, CZCE郑商所, SHFE上期所, INE上能中心, GFEX广期所
 */

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
    const response = await httpGetText(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response || response.trim().startsWith('<')) {
      return createDataFrame([], []);
    }

    const lines = response.split('\n').filter(line => line.trim());
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
      const symbol = item.SYMBOL || '';
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
        item.ISCLOSETODAY || '',
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
      const symbol = item.SYMBOL || '';
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
        item.ISCLOSETODAY || '',
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
    return createDataFrame([], []);
  }

  return func(date);
}
