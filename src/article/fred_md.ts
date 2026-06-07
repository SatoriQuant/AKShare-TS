/**
 * AKShare TypeScript - Economic Research from Federal Reserve Bank of St. Louis
 * https://research.stlouisfed.org/econ/mccracken/fred-databases/
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * FRED-MD 月度宏观经济数据
 * @param date e.g., "2020-03"; from "2015-01" to now
 * @returns 月度数据
 */
export async function fred_md(date: string = '2020-01'): Promise<DataFrame> {
  const url = `https://s3.amazonaws.com/files.fred.stlouisfed.org/fred-md/monthly/${date}.csv`;
  const response = await httpGet<string>(url);

  // Parse CSV
  const lines = response.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return createDataFrame([], []);
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data: any[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      data.push(values.map(v => {
        const num = parseFloat(v);
        return isNaN(num) ? v : num;
      }));
    }
  }

  return createDataFrame(headers, data);
}

/**
 * FRED-QD 季度宏观经济数据
 * @param date e.g., "2020-03"; from "2015-01" to now
 * @returns 季度数据
 */
export async function fred_qd(date: string = '2020-01'): Promise<DataFrame> {
  const url = `https://s3.amazonaws.com/files.fred.stlouisfed.org/fred-md/quarterly/${date}.csv`;
  const response = await httpGet<string>(url);

  // Parse CSV
  const lines = response.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return createDataFrame([], []);
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data: any[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      data.push(values.map(v => {
        const num = parseFloat(v);
        return isNaN(num) ? v : num;
      }));
    }
  }

  return createDataFrame(headers, data);
}
