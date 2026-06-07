/**
 * AKShare TypeScript - 基金经理数据接口
 * 天天基金网-基金数据-基金经理大全
 * https://fund.eastmoney.com/manager/default.html
 */

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
  const url = 'https://fund.eastmoney.com/data/FundDataPortfolio_Interface.aspx';
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
    const data = JSON.parse(text.replace('var returnjson= ', ''));
    const totalPages = parseInt(data.pages) || 1;
    const allData: any[][] = [...(data.data || [])];

    // 获取剩余页面
    for (let page = 2; page <= totalPages; page++) {
      const pageParams = { ...params, pi: String(page) };
      const pageText = await httpGetText(url, { params: pageParams });
      const pageData = JSON.parse(pageText.replace('var returnjson= ', ''));
      if (pageData.data) {
        allData.push(...pageData.data);
      }
    }

    const columns = [
      '序号', '姓名', '所属公司', '现任基金代码', '现任基金',
      '累计从业时间', '现任基金资产总规模', '现任基金最佳回报',
    ];

    const rows: any[][] = [];
    let seqNum = 1;

    for (const item of allData) {
      const name = item[2] || '';
      const company = item[4] || '';
      const fundCodes = (item[5] || '').split(',');
      const fundNames = (item[6] || '').split(',');
      const workTime = parseFloat(item[7]) || null;
      const bestReturnStr = (item[8] || '').replace('%', '');
      const bestReturn = parseFloat(bestReturnStr) || null;
      const totalScaleStr = (item[11] || '').replace('亿元', '');
      const totalScale = parseFloat(totalScaleStr) || null;

      // 展开每个基金经理管理的多只基金
      for (let i = 0; i < fundCodes.length; i++) {
        rows.push([
          seqNum++,
          name,
          company,
          fundCodes[i] || '',
          fundNames[i] || '',
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
