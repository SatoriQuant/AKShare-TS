/**
 * AKShare TypeScript - 中国期货各合约展期收益率
 * 日线数据从 daily_bar 函数获取, 需要在收盘后运行
 */

import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { get_futures_daily } from './futures_daily_bar';

/**
 * 交易所品种映射
 */
const marketExchangeSymbols: Record<string, string[]> = {
  cffex: ['IF', 'IC', 'IM', 'IH', 'T', 'TF', 'TS', 'TL'],
  dce: ['C', 'CS', 'A', 'B', 'M', 'Y', 'P', 'FB', 'BB', 'JD', 'L', 'V', 'PP', 'J', 'JM', 'I', 'EG', 'RR', 'EB', 'PG', 'LH'],
  czce: ['WH', 'PM', 'CF', 'SR', 'TA', 'OI', 'RI', 'MA', 'ME', 'FG', 'RS', 'RM', 'ZC', 'JR', 'LR', 'SF', 'SM', 'WT', 'TC', 'GN', 'RO', 'ER', 'SRX', 'SRY', 'WSX', 'WSY', 'CY', 'AP', 'UR', 'CJ', 'SA', 'PK', 'PF', 'PX', 'SH'],
  shfe: ['CU', 'AL', 'ZN', 'PB', 'NI', 'SN', 'AU', 'AG', 'RB', 'WR', 'HC', 'FU', 'BU', 'RU', 'SC', 'NR', 'SP', 'SS', 'LU', 'BC', 'AO', 'BR'],
  gfex: ['SI', 'LC'],
};

/**
 * 根据品种代码获取所属交易所
 */
function symbolMarket(variety: string): string {
  const upper = variety.toUpperCase();
  for (const [market, symbols] of Object.entries(marketExchangeSymbols)) {
    if (symbols.includes(upper)) return market;
  }
  return 'shfe'; // default
}

/**
 * 从合约代码中提取品种名称
 */
function symbolVarieties(symbol: string): string {
  const match = symbol.match(/^([A-Za-z]+)/);
  return match ? match[1].toUpperCase() : '';
}

/**
 * 指定交易日指定品种（主力和次主力）或任意两个合约的展期收益率
 *
 * @param date 交易日，格式 YYYYMMDD
 * @param varName 合约品种如 RB、AL 等
 * @param symbol1 合约1如 rb1810
 * @param symbol2 合约2如 rb1812
 * @param df 从 dailyBar 得到的合约价格数据，如果为空会在函数内部获取
 */
export async function get_roll_yield(
  date?: string,
  varName: string = 'BB',
  symbol1?: string,
  symbol2?: string,
  df?: DataFrame
): Promise<[number, string, string] | null> {
  // Parse date
  let targetDate: Date;
  if (date) {
    const year = parseInt(date.substring(0, 4));
    const month = parseInt(date.substring(4, 6)) - 1;
    const day = parseInt(date.substring(6, 8));
    targetDate = new Date(year, month, day);
  } else {
    targetDate = new Date();
  }

  const dateStr =
    targetDate.getFullYear().toString() +
    (targetDate.getMonth() + 1).toString().padStart(2, '0') +
    targetDate.getDate().toString().padStart(2, '0');

  // If symbol1 is provided, determine variety
  let variety = varName;
  if (symbol1) {
    variety = symbolVarieties(symbol1);
  }

  // Get daily data if not provided
  if (!df) {
    const market = symbolMarket(variety);
    df = await get_futures_daily(dateStr, dateStr, market as any);
  }

  if (df.columns.length === 0) {
    return null;
  }

  // Filter for the variety and exclude efp
  const varietyIdx = df.columns.indexOf('variety');
  const symbolIdx = df.columns.indexOf('symbol');
  const closeIdx = df.columns.indexOf('close');
  const oiIdx = df.columns.indexOf('open_interest');

  if (varietyIdx === -1 || symbolIdx === -1 || closeIdx === -1) {
    return null;
  }

  let filteredData = df.data.filter(row => {
    const sym = String(row[symbolIdx] || '');
    return !sym.includes('efp');
  });

  if (variety) {
    filteredData = filteredData.filter(row => String(row[varietyIdx]) === variety);
  }

  // Sort by open interest descending
  if (oiIdx !== -1) {
    filteredData.sort((a, b) => (Number(b[oiIdx]) || 0) - (Number(a[oiIdx]) || 0));
  }

  if (filteredData.length < 2) {
    return null;
  }

  // Determine symbols
  if (!symbol1) {
    symbol1 = String(filteredData[0][symbolIdx]);
    symbol2 = String(filteredData[1][symbolIdx]);
  }

  // Get close prices
  const row1 = filteredData.find(r => String(r[symbolIdx]) === symbol1);
  const row2 = filteredData.find(r => String(r[symbolIdx]) === symbol2);

  if (!row1 || !row2) {
    return null;
  }

  const close1 = Number(row1[closeIdx]) || 0;
  const close2 = Number(row2[closeIdx]) || 0;

  // Calculate months difference
  const a = symbol1!.replace(/\D/g, '');
  const a_1 = parseInt(a.substring(0, a.length - 2));
  const a_2 = parseInt(a.substring(a.length - 2));
  const b = symbol2!.replace(/\D/g, '');
  const b_1 = parseInt(b.substring(0, b.length - 2));
  const b_2 = parseInt(b.substring(b.length - 2));
  const c = (a_1 - b_1) * 12 + (a_2 - b_2);

  if (close1 === 0 || close2 === 0) {
    return null;
  }

  const rollYield = Math.log(close2 / close1) / c * 12;

  if (c > 0) {
    return [rollYield, symbol2!, symbol1!];
  } else {
    return [rollYield, symbol1!, symbol2!];
  }
}

/**
 * 展期收益率
 *
 * @param typeMethod 类型:
 *   - 'symbol': 获取指定交易日指定品种所有交割月合约的收盘价
 *   - 'var': 获取指定交易日所有品种两个主力合约的展期收益率(展期收益率横截面)
 *   - 'date': 获取指定品种每天的两个主力合约的展期收益率(展期收益率时间序列)
 * @param varName 合约品种如 "RB", "AL" 等
 * @param date 指定交易日，格式 YYYYMMDD
 * @param startDay 开始日期，格式 YYYYMMDD
 * @param endDay 结束日期，格式 YYYYMMDD
 */
export async function get_roll_yield_bar(
  typeMethod: 'symbol' | 'var' | 'date' = 'var',
  varName: string = 'RB',
  date: string = '20201030',
  startDay?: string,
  endDay?: string
): Promise<DataFrame> {
  const targetDate = date || new Date().toISOString().slice(0, 10).replace(/-/g, '');

  if (typeMethod === 'symbol') {
    const market = symbolMarket(varName);
    const df = await get_futures_daily(targetDate, targetDate, market as any);
    // Filter for the variety
    const varietyIdx = df.columns.indexOf('variety');
    if (varietyIdx === -1) return createDataFrame([], []);
    const filtered = df.data.filter(row => String(row[varietyIdx]) === varName);
    return createDataFrame(df.columns, filtered);
  }

  if (typeMethod === 'var') {
    const markets = ['dce', 'cffex', 'shfe', 'czce', 'gfex'];
    let allRows: any[][] = [];
    let columns: string[] = [];

    for (const market of markets) {
      const df = await get_futures_daily(targetDate, targetDate, market as any);
      if (df.columns.length > 0 && columns.length === 0) {
        columns = df.columns;
      }
      allRows.push(...df.data);
    }

    if (allRows.length === 0) {
      return createDataFrame([], []);
    }

    // Get unique varieties, excluding IO, MO, HO
    const varietyIdx = columns.indexOf('variety');
    const excludeList = ['IO', 'MO', 'HO'];
    const varieties = [...new Set(allRows.map(row => String(row[varietyIdx])))].filter(
      v => !excludeList.includes(v)
    );

    const resultColumns = ['roll_yield', 'near_by', 'deferred', 'date'];
    const resultRows: any[][] = [];

    // Build a temporary DataFrame from all rows
    const tempDf: DataFrame = { columns, data: allRows };

    for (const v of varieties) {
      const ry = await get_roll_yield(targetDate, v, undefined, undefined, tempDf);
      if (ry) {
        resultRows.push([ry[0], ry[1], ry[2], targetDate]);
      }
    }

    // Sort by roll yield
    resultRows.sort((a, b) => (a[0] as number) - (b[0] as number));

    return createDataFrame(resultColumns, resultRows);
  }

  if (typeMethod === 'date') {
    const startDate = startDay || targetDate;
    const endDate = endDay || targetDate;

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

    const resultColumns = ['roll_yield', 'near_by', 'deferred'];
    const resultRows: any[][] = [];

    const current = new Date(start);
    while (current <= end) {
      const dateStr =
        current.getFullYear().toString() +
        (current.getMonth() + 1).toString().padStart(2, '0') +
        current.getDate().toString().padStart(2, '0');

      try {
        const ry = await get_roll_yield(dateStr, varName);
        if (ry) {
          resultRows.push([ry[0], ry[1], ry[2]]);
        }
      } catch {
        // Skip days with errors
      }

      current.setDate(current.getDate() + 1);
    }

    return createDataFrame(resultColumns, resultRows);
  }

  return createDataFrame([], []);
}
