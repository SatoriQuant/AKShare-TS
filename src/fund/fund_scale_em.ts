/**
 * AKShare TypeScript - 基金规模份额数据接口
 * 天天基金网-基金数据-规模份额
 * https://fund.eastmoney.com/data/cyrjglist.html
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

function toPandasNumericString(value: any): string {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '';
  }
  const num = Number(raw.replace(/,/g, ''));
  if (!Number.isFinite(num)) {
    return '';
  }
  return Number.isInteger(num) ? num.toFixed(1) : num.toString();
}

function toPandasIntegerString(value: any): string {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '';
  }
  const num = Number(raw.replace(/,/g, ''));
  if (!Number.isFinite(num)) {
    return '';
  }
  return Math.trunc(num).toString();
}

/**
 * 获取基金规模变动数据 - 东方财富
 * https://fund.eastmoney.com/data/gmbdlist.html
 */
export async function fund_scale_change_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/data/FundDataPortfolio_Interface.aspx';

  try {
    // 先获取第一页得到总页数
    const params = {
      dt: '9',
      pi: '1',
      pn: '50',
      mc: 'hypzDetail',
      st: 'desc',
      sc: 'reportdate',
    };

    const text = await httpGetText(url, { params });
    const firstData = parseLooseObject(text);
    if (!firstData) {
      return createDataFrame([], []);
    }
    const totalPages = parseInt(firstData.pages) || 1;
    const allData: any[][] = [...(firstData.data || [])];

    // 获取剩余页面
    for (let page = 2; page <= totalPages; page++) {
      const pageParams = { ...params, pi: String(page) };
      const pageText = await httpGetText(url, { params: pageParams });
      const pageData = parseLooseObject(pageText);
      if (pageData?.data) {
        allData.push(...pageData.data);
      }
    }

    const columns = [
      '序号', '截止日期', '基金家数', '期间申购', '期间赎回', '期末总份额', '期末净资产',
    ];

    const rows = allData.map((item: any, index: number) => [
      index + 1,
      item[0] || '',
      item[1] || '',
      item[2] || '',
      item[3] || '',
      item[4] || '',
      item[5] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金持有人结构数据 - 东方财富
 * https://fund.eastmoney.com/data/cyrjglist.html
 */
export async function fund_hold_structure_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/data/FundDataPortfolio_Interface.aspx';

  try {
    const params = {
      dt: '11',
      pi: '1',
      pn: '50',
      mc: 'hypzDetail',
      st: 'desc',
      sc: 'reportdate',
    };

    const text = await httpGetText(url, { params });
    const firstData = parseLooseObject(text);
    if (!firstData) {
      return createDataFrame([], []);
    }
    const totalPages = parseInt(firstData.pages) || 1;
    const allData: any[][] = [...(firstData.data || [])];

    for (let page = 2; page <= totalPages; page++) {
      const pageParams = { ...params, pi: String(page) };
      const pageText = await httpGetText(url, { params: pageParams });
      const pageData = parseLooseObject(pageText);
      if (pageData?.data) {
        allData.push(...pageData.data);
      }
    }

    const columns = [
      '序号', '截止日期', '基金家数', '机构持有比列', '个人持有比列', '内部持有比列', '总份额',
    ];

    const rows = allData.map((item: any, index: number) => {
      const row = Array.isArray(item) ? item : [];
      return [
        index + 1,
        row[0] || '',
        toPandasIntegerString(row[1]),
        toPandasNumericString(row[2]),
        toPandasNumericString(row[3]),
        toPandasNumericString(row[4]),
        toPandasNumericString(row[5]),
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
