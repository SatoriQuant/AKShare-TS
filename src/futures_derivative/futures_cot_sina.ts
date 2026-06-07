/**
 * AKShare TypeScript - 新浪财经-期货-成交持仓
 * https://vip.stock.finance.sina.com.cn/q/view/vFutures_Positions_cjcc.php
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 解析新浪期货成交持仓 HTML 表格
 * 由于新浪返回的是 HTML 页面，需要解析其中的表格数据
 */
function parseHtmlTable(html: string, tableIndex: number): string[][] {
  // 简单的 HTML 表格解析 - 提取 <table> 中的 <tr> 和 <td> 数据
  const tableMatches = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
  if (!tableMatches || tableMatches[tableIndex] === undefined) {
    return [];
  }

  const table = tableMatches[tableIndex];
  const rows: string[][] = [];

  const trMatches = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
  if (!trMatches) return [];

  for (const tr of trMatches) {
    const cells: string[] = [];
    const tdMatches = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
    if (!tdMatches) continue;

    for (const td of tdMatches) {
      const content = td.replace(/<[^>]+>/g, '').trim();
      cells.push(content);
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

/**
 * 新浪财经-期货-成交持仓
 * https://vip.stock.finance.sina.com.cn/q/view/vFutures_Positions_cjcc.php
 *
 * @param symbol 数据类型，choice of {"成交量", "多单持仓", "空单持仓"}
 * @param contract 期货合约代码，如 "OI2501"
 * @param date 查询日期，格式 "YYYYMMDD"
 */
export async function futures_hold_pos_sina(
  symbol: '成交量' | '多单持仓' | '空单持仓' = '成交量',
  contract: string = 'OI2501',
  date: string = '20240223'
): Promise<DataFrame> {
  const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
  const url = 'https://vip.stock.finance.sina.com.cn/q/view/vFutures_Positions_cjcc.php';
  const params = { t_breed: contract, t_date: formattedDate };

  const html = await httpGet<string>(url, {
    params,
    responseType: 'text' as any,
  });

  const symbolToTableIndex: Record<string, number> = {
    '成交量': 2,
    '多单持仓': 3,
    '空单持仓': 4,
  };

  const tableIndex = symbolToTableIndex[symbol];
  if (tableIndex === undefined) {
    throw new Error('请输入正确的 symbol 参数');
  }

  const allRows = parseHtmlTable(html, tableIndex);

  if (allRows.length === 0) {
    return createDataFrame([], []);
  }

  // 第一行是表头
  const columns = allRows[0];
  // 最后一行通常是汇总行，去掉
  const dataRows = allRows.slice(1, -1);

  // 转换数值列
  const rows = dataRows.map((row) =>
    row.map((cell, idx) => {
      // "名次"列和数值列尝试转换为数字
      if (idx === 0 || idx >= 2) {
        const num = parseFloat(cell);
        if (!isNaN(num)) return num;
      }
      return cell;
    })
  );

  return createDataFrame(columns, rows);
}
