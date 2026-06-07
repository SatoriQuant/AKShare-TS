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
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return createDataFrame([], []);
    }

    const firstData = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    const totalPages = parseInt(firstData.pages) || 1;
    const allData: any[][] = [...(firstData.data || [])];

    // 获取剩余页面
    for (let page = 2; page <= totalPages; page++) {
      const pageParams = { ...params, pi: String(page) };
      const pageText = await httpGetText(url, { params: pageParams });
      const pJsonStart = pageText.indexOf('{');
      const pJsonEnd = pageText.lastIndexOf('}');
      if (pJsonStart !== -1 && pJsonEnd !== -1) {
        const pageData = JSON.parse(pageText.slice(pJsonStart, pJsonEnd + 1));
        if (pageData.data) {
          allData.push(...pageData.data);
        }
      }
    }

    const columns = [
      '序号', '截止日期', '基金家数', '期间申购', '期间赎回', '期末总份额', '期末净资产',
    ];

    const rows = allData.map((item: any, index: number) => [
      index + 1,
      item.reportdate || '',
      parseInt(item.jjjs) || null,
      parseFloat(String(item.qisg || '').replace(/,/g, '')) || null,
      parseFloat(String(item.qish || '').replace(/,/g, '')) || null,
      parseFloat(String(item.qmzfe || '').replace(/,/g, '')) || null,
      parseFloat(String(item.qmjze || '').replace(/,/g, '')) || null,
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
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return createDataFrame([], []);
    }

    const firstData = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    const totalPages = parseInt(firstData.pages) || 1;
    const allData: any[][] = [...(firstData.data || [])];

    for (let page = 2; page <= totalPages; page++) {
      const pageParams = { ...params, pi: String(page) };
      const pageText = await httpGetText(url, { params: pageParams });
      const pJsonStart = pageText.indexOf('{');
      const pJsonEnd = pageText.lastIndexOf('}');
      if (pJsonStart !== -1 && pJsonEnd !== -1) {
        const pageData = JSON.parse(pageText.slice(pJsonStart, pJsonEnd + 1));
        if (pageData.data) {
          allData.push(...pageData.data);
        }
      }
    }

    const columns = [
      '序号', '截止日期', '基金家数', '机构持有比列', '个人持有比列', '内部持有比列', '总份额',
    ];

    const rows = allData.map((item: any, index: number) => [
      index + 1,
      item.reportdate || '',
      parseInt(item.jjjs) || null,
      parseFloat(item.jjcyrbl) || null,
      parseFloat(item.grcyrbl) || null,
      parseFloat(item.nbcyrbl) || null,
      parseFloat(String(item.zfe || '').replace(/,/g, '')) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
