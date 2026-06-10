/**
 * AKShare TypeScript - 新成立基金数据接口
 * 基金数据-新发基金-新成立基金
 * https://fund.eastmoney.com/data/xinfound.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

function parseLooseObject(text: string): any {
  const start = text.indexOf('{');
  if (start === -1) {
    return null;
  }
  const body = text.slice(start).replace(/;\s*$/, '');
  try {
    return JSON.parse(body);
  } catch {
    const fn = new Function(`return (${body});`);
    return fn();
  }
}

/**
 * 获取新成立基金数据 - 东方财富
 * https://fund.eastmoney.com/data/xinfound.html
 */
export async function fund_new_found_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/data/FundNewIssue.aspx';
  const params = {
    t: 'xcln',
    sort: 'jzrgq,desc',
    y: '',
    page: '1,50000',
    isbuy: '1',
  };

  try {
    const text = await httpGetText(url, { params });

    // 解析 var newfunddata={...} (loose JS object notation)
    const data = parseLooseObject(text.replace(/^\s*var\s+newfunddata\s*=\s*/i, ''));

    if (!data?.datas) {
      return createDataFrame([], []);
    }

    const columns = [
      '基金代码', '基金简称', '发行公司', '基金类型', '集中认购期',
      '募集份额', '成立日期', '成立来涨幅', '基金经理', '申购状态', '优惠费率',
    ];

    const rows = data.datas.map((item: string[]) => [
      item[0] || '',
      item[1] || '',
      item[2] || '',
      item[4] || '',
      item[10] || '',
      item[5] || '',
      item[6] || '',
      parseFloat(String(item[7] || '').replace(/,/g, '')) || null,
      item[8] || '',
      item[9] || '',
      item[18] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
