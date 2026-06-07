/**
 * AKShare TypeScript - 期货日线行情
 * 交易所日交易数据: SHFE上期所, DCE大商所, CZCE郑商所, CFFEX中金所, INE上能中心, GFEX广期所
 */

import { httpGet } from '../utils/httpClient';
import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

const CFFEX_DAILY_URL = 'http://www.cffex.com.cn/sj/hqsj/rtj/{year_month}/{day}/{date}_1.csv';

/**
 * 格式化日期为 YYYYMMDD
 */
function formatDate(date: string): string {
  return date.replace(/-/g, '');
}

/**
 * 上海期货交易所-日频率-量价数据
 * @param date 日期，格式 YYYYMMDD
 */
export async function get_shfe_daily(date: string): Promise<DataFrame> {
  const dateStr = formatDate(date);
  const url = `https://www.shfe.com.cn/data/tradedata/future/dailydata/kx${dateStr}.dat`;

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.o_curinstrument || data.o_curinstrument.length === 0) {
      return createDataFrame([], []);
    }

    const filtered = data.o_curinstrument.filter(
      (row: any) =>
        row.DELIVERYMONTH !== '小计' &&
        row.DELIVERYMONTH !== '合计' &&
        row.DELIVERYMONTH !== ''
    );

    const columns = [
      'symbol', 'date', 'open', 'high', 'low', 'close',
      'volume', 'open_interest', 'turnover', 'settle', 'pre_settle', 'variety',
    ];

    const rows = filtered.map((row: any) => {
      const variety = (row.PRODUCTGROUPID || row.PRODUCTID || '').toUpperCase().trim().split('_')[0];
      const symbol = variety + row.DELIVERYMONTH;
      return [
        symbol,
        dateStr,
        parseFloat(row.OPENPRICE) || 0,
        parseFloat(row.HIGHESTPRICE) || 0,
        parseFloat(row.LOWESTPRICE) || 0,
        parseFloat(row.CLOSEPRICE) || 0,
        parseFloat(row.VOLUME) || 0,
        parseFloat(row.OPENINTEREST) || 0,
        parseFloat(row.TURNOVER) || 0,
        parseFloat(row.SETTLEMENTPRICE) || 0,
        parseFloat(row.PRESETTLEMENTPRICE) || 0,
        variety,
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 大连商品交易所-日频率-量价数据
 * @param date 日期，格式 YYYYMMDD
 */
export async function get_dce_daily(date: string): Promise<DataFrame> {
  const url = 'http://www.dce.com.cn/dcereport/publicweb/dailystat/dayQuotes';
  const payload = {
    contractId: '',
    lang: 'zh',
    optionSeries: '',
    statisticsType: '0',
    tradeDate: date,
    tradeType: '1',
    varietyId: 'all',
  };

  try {
    const data = await httpPost<any>(url, payload);

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const dceMap: Record<string, string> = {
      '豆一': 'A', '豆二': 'B', '豆粕': 'M', '豆油': 'Y', '玉米': 'C',
      '玉米淀粉': 'CS', '棕榈油': 'P', '鸡蛋': 'JD', '纤维板': 'FB',
      '胶合板': 'BB', '粳米': 'RR', '生猪': 'LH', '聚乙烯': 'L',
      '聚氯乙烯': 'V', '聚丙烯': 'PP', '焦炭': 'J', '焦煤': 'JM',
      '铁矿石': 'I', '乙二醇': 'EG', '苯乙烯': 'EB', '液化石油气': 'PG',
    };

    const filtered = data.data.filter(
      (row: any) =>
        !row.variety?.includes('小计') &&
        !row.variety?.includes('总计')
    );

    const columns = [
      'symbol', 'date', 'open', 'high', 'low', 'close',
      'volume', 'open_interest', 'turnover', 'settle', 'pre_settle', 'variety',
    ];

    const rows = filtered.map((row: any) => {
      const variety = dceMap[row.variety] || row.variety;
      return [
        row.contractId,
        date,
        parseFloat(row.open) || 0,
        parseFloat(row.high) || 0,
        parseFloat(row.low) || 0,
        parseFloat(row.close) || 0,
        parseFloat(row.volumn) || 0,
        parseFloat(row.openInterest) || 0,
        parseFloat(row.turnover) || 0,
        parseFloat(row.clearPrice) || 0,
        parseFloat(row.lastClear) || 0,
        variety,
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 郑州商品交易所-日频率-量价数据
 * @param date 日期，格式 YYYYMMDD
 */
export async function get_czce_daily(date: string): Promise<DataFrame> {
  const year = date.substring(0, 4);
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataDaily.txt`;

  try {
    const response = await httpGet<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      responseType: 'text',
    });

    if (!response || typeof response !== 'string') {
      return createDataFrame([], []);
    }

    const lines = response.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return createDataFrame([], []);
    }

    const columns = [
      'symbol', 'date', 'open', 'high', 'low', 'close',
      'volume', 'open_interest', 'turnover', 'settle', 'pre_settle', 'variety',
    ];

    const rows: any[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('|').map(p => p.trim());
      if (parts.length < 12) continue;
      const symbol = parts[0];
      if (!symbol || symbol.includes('小计') || symbol.includes('合计')) continue;
      const varietyMatch = symbol.match(/^([a-zA-Z]+)/);
      if (!varietyMatch) continue;

      rows.push([
        symbol,
        date,
        parseFloat(parts[2]) || 0,   // open
        parseFloat(parts[3]) || 0,   // high
        parseFloat(parts[4]) || 0,   // low
        parseFloat(parts[5]) || 0,   // close
        parseInt(parts[8]) || 0,     // volume
        parseInt(parts[9]) || 0,     // open_interest
        parseFloat(parts[10]) || 0,  // turnover
        parseFloat(parts[6]) || 0,   // settle
        parseFloat(parts[1]) || 0,   // pre_settle
        varietyMatch[1],             // variety
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 中国金融期货交易所-日频率交易数据
 * @param date 日期，格式 YYYYMMDD
 */
export async function get_cffex_daily(date: string): Promise<DataFrame> {
  const dateStr = formatDate(date);
  const yearMonth = dateStr.substring(0, 6);
  const day = dateStr.substring(6, 8);
  const url = `http://www.cffex.com.cn/sj/hqsj/rtj/${yearMonth}/${day}/${dateStr}_1.csv`;

  try {
    const response = await httpGet<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      responseType: 'text',
    });

    if (!response || typeof response !== 'string') {
      return createDataFrame([], []);
    }

    const lines = response.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return createDataFrame([], []);
    }

    const columns = [
      'symbol', 'date', 'open', 'high', 'low', 'close',
      'volume', 'open_interest', 'turnover', 'settle', 'pre_settle', 'variety',
    ];

    const rows: any[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 12) continue;
      const symbol = parts[0];
      if (!symbol || symbol === '小计' || symbol === '合计') continue;
      if (symbol.includes('IO') || symbol.includes('MO') || symbol.includes('HO')) continue;

      const varietyMatch = symbol.match(/^([A-Z]+)/);
      if (!varietyMatch) continue;

      // CSV columns: 合约代码,开盘价,最高价,最低价,成交量,成交额,持仓量,持仓量变化,收盘价,结算价,前结算价,...
      rows.push([
        symbol,
        dateStr,
        parseFloat(parts[1]) || 0,   // open
        parseFloat(parts[2]) || 0,   // high
        parseFloat(parts[3]) || 0,   // low
        parseFloat(parts[8]) || 0,   // close
        parseFloat(parts[4]) || 0,   // volume
        parseFloat(parts[6]) || 0,   // open_interest
        parseFloat(parts[5]) || 0,   // turnover
        parseFloat(parts[9]) || 0,   // settle
        parseFloat(parts[10]) || 0,  // pre_settle
        varietyMatch[1],             // variety
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海国际能源交易中心-日频率-量价数据
 * @param date 日期，格式 YYYYMMDD
 */
export async function get_ine_daily(date: string): Promise<DataFrame> {
  const dateStr = formatDate(date);
  const url = `https://www.ine.cn/data/tradedata/future/dailydata/kx${dateStr}.dat`;

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.o_curinstrument || data.o_curinstrument.length === 0) {
      return createDataFrame([], []);
    }

    const filtered = data.o_curinstrument.filter(
      (row: any) =>
        row.DELIVERYMONTH !== '小计' &&
        !row.PRODUCTNAME?.includes('总计')
    );

    const columns = [
      'symbol', 'date', 'open', 'high', 'low', 'close',
      'volume', 'open_interest', 'turnover', 'settle', 'pre_settle', 'variety',
    ];

    const rows = filtered.map((row: any) => {
      const variety = (row.PRODUCTGROUPID || row.PRODUCTID || '').toUpperCase().trim().split('_')[0];
      const symbol = variety + row.DELIVERYMONTH;
      return [
        symbol,
        dateStr,
        parseFloat(row.OPENPRICE) || 0,
        parseFloat(row.HIGHESTPRICE) || 0,
        parseFloat(row.LOWESTPRICE) || 0,
        parseFloat(row.CLOSEPRICE) || 0,
        parseFloat(row.VOLUME) || 0,
        parseFloat(row.OPENINTEREST) || 0,
        parseFloat(row.TURNOVER) || 0,
        parseFloat(row.SETTLEMENTPRICE) || 0,
        parseFloat(row.PRESETTLEMENTPRICE) || 0,
        variety,
      ];
    }).filter((row: any[]) => !row[0].includes('efp'));

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 广州期货交易所-日频率-量价数据
 * @param date 日期，格式 YYYYMMDD
 */
export async function get_gfex_daily(date: string): Promise<DataFrame> {
  const url = 'http://www.gfex.com.cn/u/interfacesWebTiDayQuotes/loadList';
  const payload = `trade_date=${date}&trade_type=0`;

  try {
    const data = await httpPost<any>(url, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': 'http://www.gfex.com.cn/gfex/rihq/hqsj_tjsj.shtml',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const filtered = data.data.filter(
      (row: any) =>
        !row.variety?.includes('小计') &&
        !row.variety?.includes('总计')
    );

    const columns = [
      'symbol', 'date', 'open', 'high', 'low', 'close',
      'volume', 'open_interest', 'turnover', 'settle', 'pre_settle', 'variety',
    ];

    const rows = filtered.map((row: any) => {
      const variety = (row.varietyOrder || '').toUpperCase();
      const symbol = variety + row.delivMonth;
      return [
        symbol,
        date,
        parseFloat(row.open) || 0,
        parseFloat(row.high) || 0,
        parseFloat(row.low) || 0,
        parseFloat(row.close) || 0,
        parseFloat(row.volumn) || 0,
        parseFloat(row.openInterest) || 0,
        parseFloat(row.turnover) || 0,
        parseFloat(row.clearPrice) || 0,
        parseFloat(row.lastClear) || 0,
        variety,
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 交易所日交易数据
 *
 * @param startDate 开始日期，格式 YYYYMMDD
 * @param endDate 结束日期，格式 YYYYMMDD
 * @param market 交易所：CFFEX中金所, CZCE郑商所, SHFE上期所, DCE大商所, INE上能中心, GFEX广期所
 */
export async function get_futures_daily(
  startDate: string,
  endDate: string,
  market: 'CFFEX' | 'CZCE' | 'SHFE' | 'DCE' | 'INE' | 'GFEX' = 'CFFEX'
): Promise<DataFrame> {
  const marketFuncMap: Record<string, (date: string) => Promise<DataFrame>> = {
    CFFEX: get_cffex_daily,
    CZCE: get_czce_daily,
    SHFE: get_shfe_daily,
    DCE: get_dce_daily,
    INE: get_ine_daily,
    GFEX: get_gfex_daily,
  };

  const func = marketFuncMap[market.toUpperCase()];
  if (!func) {
    return createDataFrame([], []);
  }

  // For a single date, just call the function directly
  if (startDate === endDate) {
    return func(startDate);
  }

  // For date ranges, call for each day and concatenate
  const allRows: any[][] = [];
  let columns: string[] = [];

  const start = new Date(
    parseInt(startDate.substring(0, 4)),
    parseInt(startDate.substring(4, 6)) - 1,
    parseInt(startDate.substring(6, 8))
  );
  const end = new Date(
    parseInt(endDate.substring(0, 4)),
    parseInt(endDate.substring(4, 6)) - 1,
    parseInt(endDate.substring(6, 8))
  );

  const current = new Date(start);
  while (current <= end) {
    const dateStr =
      current.getFullYear().toString() +
      (current.getMonth() + 1).toString().padStart(2, '0') +
      current.getDate().toString().padStart(2, '0');

    const df = await func(dateStr);
    if (df.columns.length > 0 && columns.length === 0) {
      columns = df.columns;
    }
    allRows.push(...df.data);

    current.setDate(current.getDate() + 1);
  }

  return createDataFrame(columns, allRows);
}
