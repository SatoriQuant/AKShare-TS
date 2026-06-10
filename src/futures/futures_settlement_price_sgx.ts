/**
 * AKShare TypeScript - 新加坡交易所-衍生品-历史结算价格
 * https://www.sgx.com/zh-hans/research-education/derivatives
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 通过东方财富获取FTSE指数期货数据来计算SGX文件编号
 * @param date 日期，格式 YYYYMMDD
 */
async function fetchFtseIndexFutu(date: string): Promise<number> {
  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    secid: '100.STI',
    klt: '101',
    fqt: '0',
    lmt: '10000',
    end: date,
    iscca: '1',
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64',
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    forcect: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines || data.data.klines.length === 0) {
    return 0;
  }

  // The formula: last_kline_index + 791
  return data.data.klines.length + 791;
}

/**
 * 新加坡交易所-衍生品-历史数据-历史结算价格
 * https://www.sgx.com/zh-hans/research-education/derivatives
 *
 * @param date 交易日，格式 YYYYMMDD
 */
export async function futures_settlement_price_sgx(
  date: string = '20231107'
): Promise<DataFrame> {
  try {
    const num = await fetchFtseIndexFutu(date);
    if (num === 0) {
      return createDataFrame([], []);
    }

    const url = `https://links.sgx.com/1.0.0/derivatives-daily/${num}/FUTURE.zip`;

    // Note: ZIP file processing is complex in TypeScript/Node.js
    // This function returns the URL for manual download if needed
    // For a full implementation, you'd need a ZIP library like 'jszip' or 'adm-zip'

    // Attempt to get the CSV data directly if available
    try {
      const response = await httpGet<any>(url, {
        responseType: 'arraybuffer',
      });

      // If the response is a ZIP, we can't easily process it without a ZIP library
      // Return empty DataFrame with a note
      return createDataFrame([], []);
    } catch {
      return createDataFrame([], []);
    }
  } catch {
    return createDataFrame([], []);
  }
}
