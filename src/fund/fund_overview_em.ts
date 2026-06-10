/**
 * AKShare TypeScript - 基金概况数据接口
 * 天天基金-基金档案-基本概况
 * https://fundf10.eastmoney.com/jbgk_015641.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取基金基本概况 - 东方财富
 * https://fundf10.eastmoney.com/jbgk_015641.html
 *
 * @param symbol 基金代码
 */
export async function fund_overview_em(
  symbol: string = '015641'
): Promise<DataFrame> {
  const url = `https://fundf10.eastmoney.com/jbgk_${symbol}.html`;

  try {
    const html = await httpGetText(url);

    // 找到包含"基金全称"的表格
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    let tableHtml = '';
    let tableMatch;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      if (tableMatch[1].includes('基金全称')) {
        tableHtml = tableMatch[1];
        break;
      }
    }

    if (!tableHtml) {
      return createDataFrame([], []);
    }

    // 提取所有 <th> 和 <td> 元素（按顺序），处理未关闭的 <td> 标签
    const dict: Record<string, string> = {};
    const cellRegex = /<t([dh])[^>]*>([\s\S]*?)(?:<\/t\1>|(?=<t[dh])|<\/tr>|$)/gi;
    const cells: { type: string; content: string }[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(tableHtml)) !== null) {
      cells.push({
        type: cellMatch[1],
        content: cellMatch[2].replace(/<[^>]*>/g, '').trim(),
      });
    }

    // 配对 th-td 为 key-value
    for (let i = 0; i < cells.length - 1; i++) {
      if (cells[i].type === 'h' && cells[i + 1].type === 'd') {
        dict[cells[i].content] = cells[i + 1].content;
        i++; // 跳过已处理的 td
      }
    }

    if (Object.keys(dict).length === 0) {
      return createDataFrame([], []);
    }

    // 按 Python 版本的列顺序输出
    const columnOrder = [
      '基金全称', '基金简称', '基金代码', '基金类型', '发行日期', '成立日期/规模',
      '净资产规模', '份额规模', '基金管理人', '基金托管人', '基金经理人',
      '成立来分红', '管理费率', '托管费率', '销售服务费率', '最高认购费率',
      '业绩比较基准', '跟踪标的',
    ];

    const columns = columnOrder.filter(col => dict[col] !== undefined);
    const rows = [columns.map(col => dict[col] || '')];

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
