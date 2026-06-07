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

    // 解析 var newfunddata={...}
    const match = text.match(/var\s+newfunddata\s*=\s*(\{.*\})/s);
    if (!match) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(match[1]);

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
      parseFloat(item[5]) || null,
      item[6] || '',
      parseFloat(String(item[7] || '').replace(/,/g, '')) || null,
      item[8] || '',
      item[9] || '',
      parseFloat(String(item[18] || '').replace('%', '')) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
