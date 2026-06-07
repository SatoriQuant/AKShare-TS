/**
 * AKShare TypeScript - 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 解析 CSV 数据
 */
function parseCsvData(text: string, columnCount: number): any[][] {
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= columnCount) {
      rows.push(parts.slice(0, columnCount));
    }
  }

  return rows;
}

/**
 * 50ETF 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?50ETF
 */
export async function index_option_50etf_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 5);

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 50ETF 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?50ETF
 */
export async function index_option_50etf_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vix50.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 300ETF 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?300ETF
 */
export async function index_option_300etf_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 13) {
      rows.push([parts[0], parts[9], parts[10], parts[11], parts[12]]);
    }
  }

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 300ETF 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?300ETF
 */
export async function index_option_300etf_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vix300.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 500ETF 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?500ETF
 */
export async function index_option_500etf_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 71) {
      rows.push([parts[0], parts[67], parts[68], parts[69], parts[70]]);
    }
  }

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 500ETF 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?500ETF
 */
export async function index_option_500etf_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vix500.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 创业板 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?CYB
 */
export async function index_option_cyb_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 75) {
      rows.push([parts[0], parts[71], parts[72], parts[73], parts[74]]);
    }
  }

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 创业板 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?CYB
 */
export async function index_option_cyb_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vixcyb.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 科创板 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?KCB
 */
export async function index_option_kcb_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 87) {
      rows.push([parts[0], parts[83], parts[84], parts[85], parts[86]]);
    }
  }

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 科创板 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?KCB
 */
export async function index_option_kcb_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vixkcb.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 深证100ETF 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?100ETF
 */
export async function index_option_100etf_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 79) {
      rows.push([parts[0], parts[75], parts[76], parts[77], parts[78]]);
    }
  }

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 深证100ETF 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?100ETF
 */
export async function index_option_100etf_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vix100.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 中证300股指 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?Index
 */
export async function index_option_300index_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 21) {
      rows.push([parts[0], parts[17], parts[18], parts[19], parts[20]]);
    }
  }

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 中证300股指 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?Index
 */
export async function index_option_300index_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vixindex.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 中证1000股指 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?Index1000
 */
export async function index_option_1000index_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 29) {
      rows.push([parts[0], parts[25], parts[26], parts[27], parts[28]]);
    }
  }

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 中证1000股指 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?Index1000
 */
export async function index_option_1000index_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vixindex1000.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 上证50股指 期权波动率指数 QVIX
 * http://1.optbbs.com/s/vix.shtml?50index
 */
export async function index_option_50index_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/k.csv';

  const text = await httpGetText(url);
  const lines = text.split('\n').filter(line => line.trim());
  const rows: any[][] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 83) {
      rows.push([parts[0], parts[79], parts[80], parts[81], parts[82]]);
    }
  }

  const columns = ['date', 'open', 'high', 'low', 'close'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
    parseFloat(row[2]),
    parseFloat(row[3]),
    parseFloat(row[4]),
  ]);

  return createDataFrame(columns, data);
}

/**
 * 上证50股指 期权波动率指数 QVIX - 分时
 * http://1.optbbs.com/s/vix.shtml?50index
 */
export async function index_option_50index_min_qvix(): Promise<DataFrame> {
  const url = 'http://1.optbbs.com/d/csv/d/vix50index.csv';

  const text = await httpGetText(url);
  const rows = parseCsvData(text, 2);

  const columns = ['time', 'qvix'];

  const data = rows.map(row => [
    row[0],
    parseFloat(row[1]),
  ]);

  return createDataFrame(columns, data);
}
