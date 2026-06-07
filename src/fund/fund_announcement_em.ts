/**
 * AKShare TypeScript - 基金公告数据接口
 * 东方财富网站-天天基金网-基金档案-基金公告
 * https://fundf10.eastmoney.com/jjgg_000001.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取基金公告-分红配送 - 东方财富
 * https://fundf10.eastmoney.com/jjgg_000001_2.html
 *
 * @param symbol 基金代码
 */
export async function fund_announcement_dividend_em(
  symbol: string = '000001'
): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/f10/JJGG';
  const params = {
    fundcode: symbol,
    pageIndex: '1',
    pageSize: '1000',
    type: '2',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: `https://fundf10.eastmoney.com/jjgg_${symbol}_2.html`,
      },
    });

    if (!data?.Data) {
      return createDataFrame([], []);
    }

    const columns = ['基金代码', '公告标题', '基金名称', '公告日期', '报告ID'];
    const rows = data.Data.map((item: any) => [
      item.FCODE || '',
      item.FTITLE || '',
      item.FSRQ || '',
      item.NOTICEDATE ? item.NOTICEDATE.split('T')[0] : '',
      item.ID || '',
    ]);

    // 按公告日期排序
    rows.sort((a: any[], b: any[]) => (a[3] || '').localeCompare(b[3] || ''));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金公告-定期报告 - 东方财富
 * https://fundf10.eastmoney.com/jjgg_000001_3.html
 *
 * @param symbol 基金代码
 */
export async function fund_announcement_report_em(
  symbol: string = '000001'
): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/f10/JJGG';
  const params = {
    fundcode: symbol,
    pageIndex: '1',
    pageSize: '1000',
    type: '3',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: `https://fundf10.eastmoney.com/jjgg_${symbol}_3.html`,
      },
    });

    if (!data?.Data) {
      return createDataFrame([], []);
    }

    const columns = ['基金代码', '公告标题', '基金名称', '公告日期', '报告ID'];
    const rows = data.Data.map((item: any) => [
      item.FCODE || '',
      item.FTITLE || '',
      item.FSRQ || '',
      item.NOTICEDATE ? item.NOTICEDATE.split('T')[0] : '',
      item.ID || '',
    ]);

    rows.sort((a: any[], b: any[]) => (a[3] || '').localeCompare(b[3] || ''));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金公告-人事调整 - 东方财富
 * https://fundf10.eastmoney.com/jjgg_000001_4.html
 *
 * @param symbol 基金代码
 */
export async function fund_announcement_personnel_em(
  symbol: string = '000001'
): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/f10/JJGG';
  const params = {
    fundcode: symbol,
    pageIndex: '1',
    pageSize: '1000',
    type: '4',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: `https://fundf10.eastmoney.com/jjgg_${symbol}_4.html`,
      },
    });

    if (!data?.Data) {
      return createDataFrame([], []);
    }

    const columns = ['基金代码', '公告标题', '基金名称', '公告日期', '报告ID'];
    const rows = data.Data.map((item: any) => [
      item.FCODE || '',
      item.FTITLE || '',
      item.FSRQ || '',
      item.NOTICEDATE ? item.NOTICEDATE.split('T')[0] : '',
      item.ID || '',
    ]);

    rows.sort((a: any[], b: any[]) => (a[3] || '').localeCompare(b[3] || ''));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
