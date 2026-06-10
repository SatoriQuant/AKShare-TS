/**
 * AKShare TypeScript - 基金经理数据接口
 * 天天基金网-基金数据-基金经理大全
 * https://fund.eastmoney.com/manager/default.html
 */

import vm from 'vm';
import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  concat,
} from '../utils/dataframe';

/**
 * 获取基金经理大全 - 东方财富
 * https://fund.eastmoney.com/manager/default.html
 */
export async function fund_manager_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Data/FundDataPortfolio_Interface.aspx';
  const params = {
    dt: '14',
    mc: 'returnjson',
    ft: 'all',
    pn: '500',
    pi: '1',
    sc: 'abbname',
    st: 'asc',
  };

  try {
    // 先获取第一页得到总页数
    const text = await httpGetText(url, { params });
    // Response uses JS object literal syntax (unquoted keys) - use VM eval
    const cleanText = text.replace(/^var\s+returnjson\s*=\s*/, '');
    const sandbox: any = {};
    vm.createContext(sandbox);
    const data = vm.runInContext(`(${cleanText})`, sandbox);
    const totalPages = parseInt(data.pages) || 1;
    const allData: any[][] = [...(data.data || [])];

    // 获取剩余页面
    for (let page = 2; page <= totalPages; page++) {
      const pageParams = { ...params, pi: String(page) };
      const pageText = await httpGetText(url, { params: pageParams });
      const cleanPageText = pageText.replace(/^var\s+returnjson\s*=\s*/, '');
      const pageSandbox: any = {};
      vm.createContext(pageSandbox);
      const pageData = vm.runInContext(`(${cleanPageText})`, pageSandbox);
      if (pageData.data) {
        allData.push(...pageData.data);
      }
    }

    const columns = [
      '序号', '姓名', '所属公司', '现任基金代码', '现任基金',
      '累计从业时间', '现任基金资产总规模', '现任基金最佳回报',
    ];

    const rows: any[][] = [];

    const toNum = (v: any): number | null => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    for (let idx = 0; idx < allData.length; idx++) {
      const item = allData[idx];
      const name = item[1] || '';
      const company = item[3] || '';
      const fundCodes = (item[4] || '').split(',');
      const fundNames = (item[5] || '').split(',');
      const workTime = toNum(item[6]);
      const bestReturnStr = (item[7] || '').replace('%', '');
      const bestReturn = toNum(bestReturnStr);
      const totalScaleStr = (item[10] || '').replace('亿元', '');
      const totalScale = toNum(totalScaleStr);

      // 展开每个基金经理管理的多只基金
      for (let i = 0; i < fundCodes.length; i++) {
        const code = fundCodes[i] || '';
        const fund = fundNames[i] || '';
        if (!code && !fund) continue;
        rows.push([
          idx + 1,
          name,
          company,
          code,
          fund,
          workTime,
          totalScale,
          bestReturn,
        ]);
      }
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
