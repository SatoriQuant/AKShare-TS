/**
 * AKShare TypeScript - 基金公司管理规模数据接口
 * 东方财富-基金-基金公司排名列表
 * https://fund.eastmoney.com/Company/lsgm.html
 */

import { httpGetText, httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取基金公司排名列表 - 东方财富
 * https://fund.eastmoney.com/Company/lsgm.html
 */
export async function fund_aum_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Company/home/gspmlist';
  const params = { fundType: '0' };

  try {
    const html = await httpGetText(url, { params });

    // 解析 HTML 表格
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/i;
    const tableMatch = html.match(tableRegex);

    if (!tableMatch) {
      return createDataFrame([], []);
    }

    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows: any[][] = [];
    let rowMatch;
    let isHeader = true;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      if (isHeader) {
        isHeader = false;
        continue;
      }

      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim());
      }

      if (cells.length >= 6) {
        // 解析全部管理规模字段（可能包含 "xxx 更新日期" 格式）
        const scaleField = cells[3] || '';
        const scaleParts = scaleField.split(/\s+/);
        const scale = parseFloat(scaleParts[0].replace(/,/g, '')) || null;
        const updateDate = scaleParts[1] || '';

        rows.push([
          parseInt(cells[0]) || null,  // 序号
          cells[1] || '',               // 基金公司
          cells[2] || '',               // 成立时间
          scale,                        // 全部管理规模
          parseInt(cells[4]) || null,   // 全部基金数
          parseInt(cells[5]) || null,   // 全部经理数
          updateDate,                   // 更新日期
        ]);
      }
    }

    const columns = [
      '序号', '基金公司', '成立时间', '全部管理规模', '全部基金数', '全部经理数', '更新日期',
    ];

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金市场管理规模走势 - 东方财富
 * https://fund.eastmoney.com/Company/default.html
 */
export async function fund_aum_trend_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Company/home/GetFundTotalScaleForChart';

  try {
    const data = await httpGet<any>(url, {
      params: { fundType: '0' },
    });

    if (!data?.x || !data?.y) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '规模'];
    const rows = data.x.map((date: string, index: number) => [
      date,
      parseFloat(data.y[index]) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金公司历年管理规模排行 - 东方财富
 * https://fund.eastmoney.com/Company/lsgm.html
 *
 * @param year 查询年份
 */
export async function fund_aum_hist_em(
  year: string = '2023'
): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Company/home/HistoryScaleTable';
  const params = { year };

  try {
    const html = await httpGetText(url, { params });

    // 解析 HTML 表格
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/i;
    const tableMatch = html.match(tableRegex);

    if (!tableMatch) {
      return createDataFrame([], []);
    }

    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows: any[][] = [];
    let rowMatch;
    let isHeader = true;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      if (isHeader) {
        isHeader = false;
        continue;
      }

      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim());
      }

      if (cells.length >= 8) {
        rows.push([
          parseInt(cells[0]) || null,    // 序号
          cells[1] || '',                 // 基金公司
          parseFloat(cells[2]) || null,   // 总规模
          parseFloat(cells[3]) || null,   // 股票型
          parseFloat(cells[4]) || null,   // 混合型
          parseFloat(cells[5]) || null,   // 债券型
          parseFloat(cells[6]) || null,   // 指数型
          parseFloat(cells[7]) || null,   // QDII
          parseFloat(cells[8]) || null,   // 货币型
        ]);
      }
    }

    const columns = [
      '序号', '基金公司', '总规模', '股票型', '混合型', '债券型', '指数型', 'QDII', '货币型',
    ];

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
