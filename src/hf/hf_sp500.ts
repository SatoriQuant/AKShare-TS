/**
 * AKShare TypeScript - 高频数据-标普 500 指数
 * S&P 500 minute data from 2012-2018
 * https://github.com/FutureSharks/financial-data
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * S&P 500 分钟级数据 (2012-2018)
 * @param year 年份，从 2012 到 2018，默认 "2017"
 * @returns S&P 500 分钟级行情数据
 */
export async function hf_sp_500(year: string = '2017'): Promise<DataFrame> {
  const url = `https://github.com/FutureSharks/financial-data/raw/master/pyfinancialdata/data/stocks/histdata/SPXUSD/DAT_ASCII_SPXUSD_M1_${year}.csv`;

  const text = await httpGetText(url);

  const lines = text.trim().split('\n');
  const columns = ['date', 'open', 'high', 'low', 'close', 'price'];
  const rows: any[][] = [];

  for (const line of lines) {
    const parts = line.split(';');
    if (parts.length < 5) continue;

    // Date format from the CSV: YYYYMMDD HHMMSS or similar
    const dateStr = parts[0].trim();
    const open = parseFloat(parts[1]);
    const high = parseFloat(parts[2]);
    const low = parseFloat(parts[3]);
    const close = parseFloat(parts[4]);
    // Price (tick volume) may be in field 5
    const price = parts.length > 5 ? parseFloat(parts[5]) : NaN;

    rows.push([dateStr, open, high, low, close, price]);
  }

  return createDataFrame(columns, rows);
}
