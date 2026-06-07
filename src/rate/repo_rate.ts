/**
 * AKShare TypeScript - 中国外汇交易中心暨全国银行间同业拆借中心-回购定盘利率-历史数据
 * https://www.chinamoney.com.cn/chinese/bkfrr/
 */

import { httpPost, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  sortBy,
} from '../utils/dataframe';

/**
 * 中国外汇交易中心暨全国银行间同业拆借中心-回购定盘利率-历史数据
 * https://www.chinamoney.com.cn/chinese/bkfrr/
 *
 * @param symbol 选择 {"回购定盘利率", "银银间回购定盘利率"}
 */
export async function repo_rate_query(
  symbol: string = '回购定盘利率'
): Promise<DataFrame> {
  if (symbol === '回购定盘利率') {
    const url = 'https://www.chinamoney.com.cn/r/cms/www/chinamoney/data/currency/frr-chrt.csv';
    const text = await httpGetText(url);
    const lines = text.trim().split('\n');

    const columns = ['date', 'FR001', 'FR007', 'FR014'];
    const rows: any[][] = [];

    for (const line of lines) {
      const parts = line.split(',').filter(p => p.trim() !== '');
      if (parts.length >= 4) {
        rows.push([
          parts[0],
          parseFloat(parts[1]) || NaN,
          parseFloat(parts[2]) || NaN,
          parseFloat(parts[3]) || NaN,
        ]);
      }
    }

    let df = createDataFrame(columns, rows);
    df = sortBy(df, 'date', true);
    return df;
  } else {
    const url = 'https://www.chinamoney.com.cn/r/cms/www/chinamoney/data/currency/fdr-chrt.csv';
    const text = await httpGetText(url);
    const lines = text.trim().split('\n');

    const columns = ['date', 'FDR001', 'FDR007', 'FDR014'];
    const rows: any[][] = [];

    for (const line of lines) {
      const parts = line.split(',').filter(p => p.trim() !== '');
      if (parts.length >= 4) {
        rows.push([
          parts[0],
          parseFloat(parts[1]) || NaN,
          parseFloat(parts[2]) || NaN,
          parseFloat(parts[3]) || NaN,
        ]);
      }
    }

    let df = createDataFrame(columns, rows);
    df = sortBy(df, 'date', true);
    return df;
  }
}

/**
 * 中国外汇交易中心暨全国银行间同业拆借中心-回购定盘利率-历史数据（按日期范围查询）
 * https://www.chinamoney.com.cn/chinese/bkfrr/
 *
 * @param startDate 开始时间，格式 YYYYMMDD，开始时间与结束时间需要在一个月内
 * @param endDate 结束时间，格式 YYYYMMDD，开始时间与结束时间需要在一个月内
 */
export async function repo_rate_hist(
  startDate: string = '20200930',
  endDate: string = '20201029'
): Promise<DataFrame> {
  const formattedStart = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
  const formattedEnd = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;

  const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-bk-currency/FrrHis';
  const params = {
    lang: 'CN',
    startDate: formattedStart,
    endDate: formattedEnd,
  };

  const data = await httpPost<any>(url, undefined, { params });

  if (!data?.records || data.records.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['date', 'FR001', 'FR007', 'FR014', 'FDR001', 'FDR007', 'FDR014'];
  const rows: any[][] = data.records.map((item: any) => {
    const fr = item.frValueMap || {};
    return [
      fr.date,
      parseFloat(fr.FR001) || NaN,
      parseFloat(fr.FR007) || NaN,
      parseFloat(fr.FR014) || NaN,
      parseFloat(fr.FDR001) || NaN,
      parseFloat(fr.FDR007) || NaN,
      parseFloat(fr.FDR014) || NaN,
    ];
  });

  let df = createDataFrame(columns, rows);
  df = sortBy(df, 'date', true);
  return df;
}
