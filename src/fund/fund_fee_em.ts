/**
 * AKShare TypeScript - 基金费率数据接口
 * 天天基金-基金档案-购买信息
 * https://fundf10.eastmoney.com/jjfl_015641.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 解析 HTML 表格为二维数组
 */
function parseHtmlTable(html: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cells: string[] = [];
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim());
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }
  return rows;
}

/**
 * 获取基金费率信息 - 东方财富
 * https://fundf10.eastmoney.com/jjfl_015641.html
 *
 * @param symbol 基金代码
 * @param indicator 指标类型：交易状态, 申购与赎回金额, 交易确认日, 运作费用, 认购费率（前端）, 申购费率（前端）, 赎回费率
 */
export async function fund_fee_em(
  symbol: string = '015641',
  indicator: '交易状态' | '申购与赎回金额' | '交易确认日' | '运作费用' | '认购费率（前端）' | '申购费率（前端）' | '赎回费率' = '认购费率（前端）'
): Promise<DataFrame> {
  const url = `https://fundf10.eastmoney.com/jjfl_${symbol}.html`;

  try {
    const html = await httpGetText(url);

    // 解析所有 h4 标题和对应的表格
    const h4Regex = /<h4[^>]*>([\s\S]*?)<\/h4>/gi;
    const h4Matches: { title: string; index: number }[] = [];
    let h4Match;

    while ((h4Match = h4Regex.exec(html)) !== null) {
      const title = h4Match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      h4Matches.push({ title, index: h4Match.index });
    }

    // 解析表格
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: { content: string; index: number }[] = [];
    let tableMatch;

    while ((tableMatch = tableRegex.exec(html)) !== null) {
      tables.push({ content: tableMatch[1], index: tableMatch.index });
    }

    // 将表格与标题关联
    const tablesDict: Record<string, string> = {};
    for (const h4 of h4Matches) {
      // 找到紧跟在标题后面的表格
      const nextTable = tables.find(t => t.index > h4.index);
      if (nextTable) {
        if (h4.title === '申购与赎回金额') {
          // 申购与赎回金额有两个表格
          const nextNextTable = tables.find(t => t.index > nextTable.index);
          if (nextNextTable) {
            tablesDict[h4.title] = nextTable.content + '|||' + nextNextTable.content;
          } else {
            tablesDict[h4.title] = nextTable.content;
          }
        } else {
          tablesDict[h4.title] = nextTable.content;
        }
      }
    }

    const targetTable = tablesDict[indicator];
    if (!targetTable) {
      return createDataFrame([], []);
    }

    // 处理申购与赎回金额的合并表格
    if (indicator === '申购与赎回金额' && targetTable.includes('|||')) {
      const parts = targetTable.split('|||');
      const rows1 = parseHtmlTable(parts[0]);
      const rows2 = parseHtmlTable(parts[1]);
      const allRows = [...rows1, ...rows2];

      if (allRows.length === 0) {
        return createDataFrame([], []);
      }

      const columns = allRows[0];
      const data = allRows.slice(1);
      return createDataFrame(columns, data);
    }

    const tableRows = parseHtmlTable(targetTable);
    if (tableRows.length === 0) {
      return createDataFrame([], []);
    }

    let columns = tableRows[0];
    let data = tableRows.slice(1);

    // 处理认购费率（前端）的特殊格式
    if (indicator === '认购费率（前端）' && columns.some(c => c.includes('|'))) {
      const newColumns: string[] = [];
      for (const col of columns) {
        if (col.includes('|')) {
          const parts = col.split('|').map(s => s.trim());
          newColumns.push(...parts);
        } else {
          newColumns.push(col);
        }
      }
      columns = newColumns;

      // 拆分数据行
      data = data.map(row => {
        const newRow: string[] = [];
        for (const cell of row) {
          if (cell.includes('|')) {
            newRow.push(...cell.split('|').map(s => s.trim()));
          } else {
            newRow.push(cell);
          }
        }
        return newRow;
      });
    }

    // 处理申购费率（前端）的特殊格式
    if (indicator === '申购费率（前端）' && columns.some(c => c.includes('|'))) {
      const newColumns: string[] = [];
      for (const col of columns) {
        if (col.includes('原费率|天天基金优惠费率')) {
          newColumns.push('原费率', '天天基金优惠费率-银行卡购买', '天天基金优惠费率-活期宝购买');
        } else if (col.includes('|')) {
          newColumns.push(...col.split('|').map(s => s.trim()));
        } else {
          newColumns.push(col);
        }
      }
      columns = newColumns;

      data = data.map(row => {
        const newRow: string[] = [];
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          if (cell.includes('|')) {
            const parts = cell.split('|').map(s => s.trim());
            // 如果拆分后不足3个，用原费率填充
            while (parts.length < 3) {
              parts.push(parts[0] || '');
            }
            newRow.push(...parts.slice(0, 3));
          } else {
            newRow.push(cell);
          }
        }
        return newRow;
      });
    }

    // 处理赎回费率的特殊格式
    if (indicator === '赎回费率' && columns.some(c => c.includes('|'))) {
      const newColumns: string[] = [];
      for (const col of columns) {
        if (col.includes('|')) {
          newColumns.push(...col.split('|').map(s => s.trim()));
        } else {
          newColumns.push(col);
        }
      }
      columns = newColumns;

      data = data.map(row => {
        const newRow: string[] = [];
        for (const cell of row) {
          if (cell.includes('|')) {
            newRow.push(...cell.split('|').map(s => s.trim()));
          } else {
            newRow.push(cell);
          }
        }
        return newRow;
      });
    }

    return createDataFrame(columns, data);
  } catch (error) {
    return createDataFrame([], []);
  }
}
