/**
 * AKShare TypeScript - 修大成主页-Risk Lab-Realized Volatility; Oxford-Man Institute of Quantitative Finance Realized Library
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * Oxford-Man Institute of Quantitative Finance Realized Library 的数据
 * @param symbol 指标代码, e.g., 'FTSE', 'GDAXI', 'RUT', 'SPX', 'STOXX50E', 'SSEC', 'N225'
 * @param index 指标类型, e.g., 'medrv', 'rk_twoscale', 'bv', 'rv10', 'rv5', 'rk_th2', 'rv10_ss', 'rsv', 'rv5_ss', 'bv_ss', 'rk_parzen', 'rsv_ss'
 * @returns 实现波动率数据
 */
export async function article_oman_rv(
  symbol: string = 'FTSE',
  index: string = 'rk_th2'
): Promise<DataFrame> {
  const url = 'https://realized.oxford-man.ox.ac.uk/theme/js/visualization-data.js?20191111113154';
  const response = await httpGet<string>(url);

  // Parse the JavaScript response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return createDataFrame([], []);
  }

  try {
    const dataJson = JSON.parse(jsonMatch[0]);
    const symbolKey = `.${symbol}`;

    if (!dataJson[symbolKey] || !dataJson[symbolKey][index]) {
      return createDataFrame([], []);
    }

    const dates = dataJson[symbolKey].dates;
    const values = dataJson[symbolKey][index].data;

    if (!dates || !values || dates.length !== values.length) {
      return createDataFrame([], []);
    }

    const data: any[][] = dates.map((date: number, i: number) => [
      new Date(date).toISOString().split('T')[0],
      values[i],
    ]);

    return createDataFrame(['date', `${symbol}-${index}`], data);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * Oxford-Man Institute of Quantitative Finance Realized Library 的数据 (短期)
 * @param symbol 指标代码, e.g., 'FTSE', 'GDAXI', 'RUT', 'SPX', 'STOXX50E', 'SSEC', 'N225'
 * @returns 实现波动率数据
 */
export async function article_oman_rv_short(
  symbol: string = 'FTSE'
): Promise<DataFrame> {
  const url = 'https://realized.oxford-man.ox.ac.uk/theme/js/front-page-chart.js';
  const response = await httpGet<string>(url);

  // Parse the JavaScript response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return createDataFrame([], []);
  }

  try {
    const dataJson = JSON.parse(jsonMatch[0]);
    const symbolKey = `.${symbol}`;

    if (!dataJson[symbolKey] || !dataJson[symbolKey].data) {
      return createDataFrame([], []);
    }

    const records = dataJson[symbolKey].data;
    const data: any[][] = records.map((record: any) => [
      new Date(record[0]).toISOString().split('T')[0],
      record[1],
    ]);

    return createDataFrame(['date', symbol], data);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 修大成主页-Risk Lab-Realized Volatility
 * @param symbol 股票代码
 * @returns 实现波动率数据
 */
export async function article_rlab_rv(
  symbol: string = '39693'
): Promise<DataFrame> {
  const url = 'https://dachxiu.chicagobooth.edu/data.php';
  const params = { ticker: symbol };
  const response = await httpGet<string>(url, { params });

  // Parse the response
  const lines = response.split('\n').filter(line => line.trim());
  if (lines.length < 3) {
    return createDataFrame([], []);
  }

  const data: any[][] = [];

  for (let i = 2; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 2) {
      const dateStr = parts[0];
      const value = parseFloat(parts[1]);

      if (!isNaN(value)) {
        // Format date from YYYYMMDD to YYYY-MM-DD
        const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        data.push([formattedDate, value]);
      }
    }
  }

  return createDataFrame(['date', 'RV'], data);
}
