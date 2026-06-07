/**
 * AKShare TypeScript - 大宗商品现货价格及基差数据
 * 数据源: 生意社 https://www.100ppi.com/sf/
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// 中文品种名到英文代码的映射
const chineseToEnglishMap: Record<string, string> = {
  '铜': 'CU', '铝': 'AL', '锌': 'ZN', '铅': 'PB', '镍': 'NI',
  '锡': 'SN', '黄金': 'AU', '白银': 'AG', '螺纹钢': 'RB', '线材': 'WR',
  '热轧卷板': 'HC', '不锈钢': 'SS', '天然橡胶': 'RU', '燃料油': 'FU',
  '石油沥青': 'BU', '纸浆': 'SP', '原油': 'SC', '20号胶': 'NR',
  '低硫燃料油': 'LU', '国际铜': 'BC', '焦炭': 'J', '焦煤': 'JM',
  '铁矿石': 'I', '豆粕': 'M', '豆油': 'Y', '棕榈油': 'P', '玉米': 'C',
  '豆一': 'A', '豆二': 'B', '玉米淀粉': 'CS', '鸡蛋': 'JD', '粳米': 'RR',
  '生猪': 'LH', '纤维板': 'FB', '胶合板': 'BB', '聚乙烯': 'L',
  '聚氯乙烯': 'V', '聚丙烯': 'PP', '乙二醇': 'EG', '苯乙烯': 'EB',
  '液化石油气': 'PG', 'PTA': 'TA', '甲醇': 'MA', '白糖': 'SR',
  '棉花': 'CF', '菜籽油': 'OI', '菜粕': 'RM', '动力煤': 'ZC',
  '玻璃': 'FG', '纯碱': 'SA', '尿素': 'UR', '苹果': 'AP',
  '红枣': 'CJ', '花生': 'PK', '硅铁': 'SF', '锰硅': 'SM',
  '工业硅': 'SI', '碳酸锂': 'LC', 'PX': 'PX',
};

/**
 * 生意社-大宗商品现货价格及基差（指定日期）
 * https://www.100ppi.com/sf/
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_spot_price(date: string): Promise<DataFrame> {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  const formattedDate = `${year}-${month}-${day}`;

  const url = `https://www.100ppi.com/sf/day-${formattedDate}.html`;

  try {
    const html = await httpGetText(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    // Parse HTML tables - extract the main data table
    const tableMatch = html.match(/<table[^>]*class="futures_table"[^>]*>([\s\S]*?)<\/table>/i)
      || html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);

    if (!tableMatch) {
      return createDataFrame([], []);
    }

    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows: string[][] = [];
    let match;

    while ((match = rowRegex.exec(tableHtml)) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(match[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length < 3) {
      return createDataFrame([], []);
    }

    const columns = [
      'var', 'sp', 'near_symbol', 'near_price', 'dom_symbol', 'dom_price',
      'near_basis', 'dom_basis', 'near_basis_rate', 'dom_basis_rate', 'date',
    ];

    const resultRows: any[][] = [];
    // Skip header rows (first 2)
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 6) continue;

      const chineseName = row[0].replace(/[^一-龥A-Za-z]/g, '');
      if (!chineseName || ['商品', '价格', '暂无数据'].includes(chineseName)) continue;
      if (chineseName.includes('交易所')) continue;

      let symbol = chineseToEnglishMap[chineseName] || chineseName;

      const spotPrice = parseFloat(row[1]) || 0;
      const nearSymbol = row[2] || '';
      const nearPrice = parseFloat(row[3]) || 0;
      const domSymbol = row[4] || '';
      const domPrice = parseFloat(row[5]) || 0;

      // Special unit conversions
      let adjustedSpotPrice = spotPrice;
      if (symbol === 'JD') adjustedSpotPrice = spotPrice * 500;
      if (symbol === 'FG') adjustedSpotPrice = spotPrice * 80;
      if (symbol === 'LH') adjustedSpotPrice = spotPrice * 1000;

      const nearBasis = nearPrice - adjustedSpotPrice;
      const domBasis = domPrice - adjustedSpotPrice;
      const nearBasisRate = adjustedSpotPrice !== 0 ? nearPrice / adjustedSpotPrice - 1 : 0;
      const domBasisRate = adjustedSpotPrice !== 0 ? domPrice / adjustedSpotPrice - 1 : 0;

      resultRows.push([
        symbol, adjustedSpotPrice, nearSymbol, nearPrice, domSymbol, domPrice,
        nearBasis, domBasis, nearBasisRate, domBasisRate, date,
      ]);
    }

    return createDataFrame(columns, resultRows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 生意社-大宗商品现货价格及基差（日期范围）
 *
 * @param startDay 开始日期，格式 YYYYMMDD
 * @param endDay 结束日期，格式 YYYYMMDD
 */
export async function futures_spot_price_daily(
  startDay: string,
  endDay: string
): Promise<DataFrame> {
  const startDate = new Date(
    parseInt(startDay.substring(0, 4)),
    parseInt(startDay.substring(4, 6)) - 1,
    parseInt(startDay.substring(6, 8))
  );
  const endDate = new Date(
    parseInt(endDay.substring(0, 4)),
    parseInt(endDay.substring(4, 6)) - 1,
    parseInt(endDay.substring(6, 8))
  );

  const allRows: any[][] = [];
  let columns: string[] = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr =
      current.getFullYear().toString() +
      (current.getMonth() + 1).toString().padStart(2, '0') +
      current.getDate().toString().padStart(2, '0');

    const df = await futures_spot_price(dateStr);
    if (df.columns.length > 0 && columns.length === 0) {
      columns = df.columns;
    }
    allRows.push(...df.data);

    current.setDate(current.getDate() + 1);
  }

  return createDataFrame(columns, allRows);
}

/**
 * 生意社-大宗商品现货价格及基差（新版）
 * https://www.100ppi.com/sf2/
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_spot_price_previous(date: string): Promise<DataFrame> {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  const formattedDate = `${year}-${month}-${day}`;

  const url = `https://www.100ppi.com/sf2/day-${formattedDate}.html`;

  try {
    const html = await httpGetText(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    // Parse HTML tables
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: string[][][] = [];
    let tableMatch;

    while ((tableMatch = tableRegex.exec(html)) !== null) {
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
      tables.push(rows);
    }

    if (tables.length < 2) {
      return createDataFrame([], []);
    }

    const mainTable = tables[1];
    if (mainTable.length < 3) {
      return createDataFrame([], []);
    }

    const columns = [
      '商品', '现货价格', '主力合约代码', '主力合约价格',
      '主力合约基差', '主力合约变动百分比',
      '180日内主力基差最高', '180日内主力基差最低', '180日内主力基差平均',
    ];

    const resultRows: any[][] = [];
    for (let i = 2; i < mainTable.length; i++) {
      const row = mainTable[i];
      if (row.length < 9) continue;
      const name = row[0].replace(/<[^>]*>/g, '').trim();
      if (!name || name.includes('暂无数据')) continue;

      resultRows.push([
        name,
        parseFloat(row[1]) || 0,
        row[2] || '',
        parseFloat(row[3]) || 0,
        parseFloat(row[4]) || 0,
        parseFloat(row[5]?.replace('%', '')) || 0,
        row[6] || '',
        row[7] || '',
        row[8] || '',
      ]);
    }

    return createDataFrame(columns, resultRows);
  } catch {
    return createDataFrame([], []);
  }
}
