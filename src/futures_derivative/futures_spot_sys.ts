/**
 * AKShare TypeScript - 生意社-商品与期货-现期图
 * https://www.100ppi.com/sf/792.html
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 从 HTML 中解析表格数据
 */
function parseSimpleTable(html: string): string[][] {
  const rows: string[][] = [];
  const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
  if (!trMatches) return rows;

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
 * 从生意社页面解析多个表格
 */
function parseMultipleTables(html: string): string[][][] {
  const tables: string[][][] = [];
  const tableMatches = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
  if (!tableMatches) return tables;

  for (const table of tableMatches) {
    tables.push(parseSimpleTable(table));
  }
  return tables;
}

/**
 * 生意社-商品与期货-现期图
 * https://www.100ppi.com/sf/792.html
 *
 * @param symbol 期货品种，如 "铜", "铝", "锌" 等
 * @param indicator 指标类型，choice of {"市场价格", "基差率", "主力基差"}
 */
export async function futures_spot_sys(
  symbol: string = '铜',
  indicator: '市场价格' | '基差率' | '主力基差' = '市场价格'
): Promise<DataFrame> {
  // 第一步: 获取品种对应的 URL
  const indexUrl = 'https://www.100ppi.com/sf/792.html';
  const indexHtml = await httpGet<string>(indexUrl, {
    responseType: 'text' as any,
  });

  // 解析品种链接: 查找包含品种名称的 <a> 标签
  const linkRegex = new RegExp(
    `<a[^>]*href="([^"]*)"[^>]*>\\s*${symbol}\\s*</a>`,
    'i'
  );
  const linkMatch = indexHtml.match(linkRegex);

  if (!linkMatch) {
    return createDataFrame([], []);
  }

  const path = linkMatch[1];

  // 第二步: 获取品种数据页面
  const dataUrl = `https://www.100ppi.com${path}`;
  const dataHtml = await httpGet<string>(dataUrl, {
    responseType: 'text' as any,
  });

  const tables = parseMultipleTables(dataHtml);

  // 根据 indicator 选择不同的表格
  // 市场价格 -> 表格索引 1 (第2个表格)
  // 基差率 -> 表格索引 2 (第3个表格)
  // 主力基差 -> 表格索引 3 (第4个表格)
  const tableIndexMap: Record<string, number> = {
    '市场价格': 1,
    '基差率': 2,
    '主力基差': 3,
  };

  const tableIndex = tableIndexMap[indicator];
  if (!tables[tableIndex]) {
    return createDataFrame([], []);
  }

  const tableData = tables[tableIndex];

  // 生意社的表格通常是 列名为行、日期为列的转置格式
  // 需要转置: 第一行是列名，第一列是日期
  if (tableData.length < 2) {
    return createDataFrame([], []);
  }

  // 转置表格: 原始数据中第一行是列名(日期)，第一列是行名(指标名)
  const headerRow = tableData[0]; // 第一行: ['', '日期1', '日期2', ...]
  const dates = headerRow.slice(1); // 日期列表

  if (indicator === '市场价格') {
    // 市场价格: 行名是 现货价格, 主力合约, 最近合约
    const columns = ['日期', '现货价格', '主力合约', '最近合约'];
    const rows: any[][] = [];

    for (let colIdx = 0; colIdx < dates.length; colIdx++) {
      const row: any[] = [dates[colIdx]];
      // 第1行(tableData[1]) -> 现货价格
      // 第2行(tableData[2]) -> 主力合约
      // 第3行(tableData[3]) -> 最近合约
      for (let rowIdx = 1; rowIdx <= 3 && rowIdx < tableData.length; rowIdx++) {
        const val = tableData[rowIdx][colIdx + 1] || '';
        const num = parseFloat(val);
        row.push(isNaN(num) ? val : num);
      }
      if (row.length === columns.length) {
        rows.push(row);
      }
    }

    return createDataFrame(columns, rows);
  } else if (indicator === '基差率') {
    const columns = ['日期', '基差率'];
    const rows: any[][] = [];

    for (let colIdx = 0; colIdx < dates.length; colIdx++) {
      let val = '';
      if (tableData[1]) {
        val = (tableData[1][colIdx + 1] || '').replace('%', '');
      }
      const num = parseFloat(val);
      rows.push([dates[colIdx], isNaN(num) ? val : num]);
    }

    return createDataFrame(columns, rows);
  } else {
    // 主力基差
    const columns = ['日期', '主力基差'];
    const rows: any[][] = [];

    for (let colIdx = 0; colIdx < dates.length; colIdx++) {
      let val = '';
      if (tableData[1]) {
        val = tableData[1][colIdx + 1] || '';
      }
      const num = parseFloat(val);
      rows.push([dates[colIdx], isNaN(num) ? val : num]);
    }

    return createDataFrame(columns, rows);
  }
}
