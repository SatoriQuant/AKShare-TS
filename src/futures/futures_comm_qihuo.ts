/**
 * AKShare TypeScript - 九期网-期货手续费
 * https://www.9qihuo.com/qihuoshouxufei
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

type ExchangeName =
  | '所有'
  | '上海期货交易所'
  | '大连商品交易所'
  | '郑州商品交易所'
  | '上海国际能源交易中心'
  | '中国金融期货交易所'
  | '广州期货交易所';

/**
 * 解析HTML表格为行数组
 */
function parseHtmlTable(html: string): string[][] {
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows: string[][] = [];
  let rowMatch;

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
    }
    if (cells.length > 0) rows.push(cells);
  }

  return rows;
}

/**
 * 处理单个交易所的手续费数据
 */
function processExchangeData(
  rawRows: string[][],
  exchangeName: string
): { columns: string[]; rows: any[][] } {
  const columns = [
    '交易所名称', '合约名称', '合约代码', '现价', '涨停板', '跌停板',
    '保证金-买开', '保证金-卖开', '保证金-每手',
    '手续费标准-开仓-万分之', '手续费标准-开仓-元',
    '手续费标准-平昨-万分之', '手续费标准-平昨-元',
    '手续费标准-平今-万分之', '手续费标准-平今-元',
    '每跳毛利', '手续费', '每跳净利', '备注',
  ];

  const rows = rawRows.map(row => {
    if (row.length < 13) return null;

    // Parse contract name and code from "合约品种" field
    const varietyRaw = row[0] || '';
    const varietyParts = varietyRaw.split('(');
    const contractName = varietyParts[0]?.trim() || '';
    const contractCode = varietyParts[1]?.replace(')', '').trim() || '';

    // Parse limit up/down
    const limitRaw = row[2] || '';
    const limitParts = limitRaw.split('/');
    const limitUp = limitParts[0]?.trim() || '';
    const limitDown = limitParts[1]?.trim() || '';

    // Parse margin
    const marginBuyOpen = (row[3] || '').replace('%', '');
    const marginSellOpen = (row[4] || '').replace('%', '');
    const marginPerLot = (row[5] || '').replace('元', '');

    // Parse commission standards
    const commOpenRaw = row[6] || '';
    const commCloseYRaw = row[7] || '';
    const commCloseTRaw = row[8] || '';

    const parseCommStandard = (raw: string) => {
      if (raw.includes('万分之')) {
        const parts = raw.split('/');
        const ratio = parseFloat(parts[0]) / 10000;
        return { ratio: isNaN(ratio) ? null : ratio, yuan: null };
      } else if (raw.includes('元')) {
        return { ratio: null, yuan: raw.replace('元', '') };
      }
      return { ratio: null, yuan: null };
    };

    const commOpen = parseCommStandard(commOpenRaw);
    const commCloseY = parseCommStandard(commCloseYRaw);
    const commCloseT = parseCommStandard(commCloseTRaw);

    return [
      exchangeName,
      contractName,
      contractCode,
      parseFloat(row[1]) || 0,
      parseFloat(limitUp) || 0,
      parseFloat(limitDown) || 0,
      parseFloat(marginBuyOpen) || 0,
      parseFloat(marginSellOpen) || 0,
      parseFloat(marginPerLot) || 0,
      commOpen.ratio,
      commOpen.yuan,
      commCloseY.ratio,
      commCloseY.yuan,
      commCloseT.ratio,
      commCloseT.yuan,
      parseFloat(row[9]) || 0,
      parseFloat(row[10]?.replace('元', '')) || 0,
      parseFloat(row[11]) || 0,
      row[12] || '',
    ];
  }).filter((row): row is any[] => row !== null);

  return { columns, rows };
}

/**
 * 九期网-期货手续费
 * https://www.9qihuo.com/qihuoshouxufei
 *
 * @param symbol 交易所名称，默认"所有"
 */
export async function futures_comm_info(
  symbol: ExchangeName = '所有'
): Promise<DataFrame> {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: 'https://www.9qihuo.com/',
  };

  try {
    const url = 'https://www.9qihuo.com/qihuoshouxufei';
    const html = await httpGetText(url, { headers });

    const allRows = parseHtmlTable(html);
    if (allRows.length < 10) {
      return createDataFrame([], []);
    }

    // Find exchange section boundaries
    const exchangeSections: Record<string, number> = {};
    const exchangeNames = [
      '上海期货交易所', '大连商品交易所', '郑州商品交易所',
      '上海国际能源交易中心', '广州期货交易所', '中国金融期货交易所',
    ];

    for (let i = 0; i < allRows.length; i++) {
      const cellText = allRows[i][0] || '';
      for (const name of exchangeNames) {
        if (cellText.includes(name)) {
          exchangeSections[name] = i;
        }
      }
    }

    const exchangeIndices = Object.entries(exchangeSections)
      .sort((a, b) => a[1] - b[1]);

    const getExchangeData = (exchangeName: string): any[][] => {
      const idx = exchangeSections[exchangeName];
      if (idx === undefined) return [];

      const nextIdx = exchangeIndices.find(([name]) => name !== exchangeName && exchangeSections[name] > idx);
      const endIdx = nextIdx ? nextIdx[1] : allRows.length;

      // Skip header rows (3 rows after exchange name)
      const dataRows = allRows.slice(idx + 3, endIdx);
      return dataRows.filter(row => {
        const text = row[0] || '';
        return !text.includes('小计') && !text.includes('总计') && text !== '';
      });
    };

    const allData: any[][] = [];
    let columns: string[] = [];

    const targetExchanges = symbol === '所有' ? exchangeNames : [symbol];

    for (const exchangeName of targetExchanges) {
      const rawData = getExchangeData(exchangeName);
      const processed = processExchangeData(rawData, exchangeName);
      if (processed.columns.length > 0 && columns.length === 0) {
        columns = processed.columns;
      }
      allData.push(...processed.rows);
    }

    return createDataFrame(columns, allData);
  } catch {
    return createDataFrame([], []);
  }
}
