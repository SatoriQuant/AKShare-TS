/**
 * AKShare TypeScript - 每日注册仓单数据
 * 大连商品交易所, 上海期货交易所, 郑州商品交易所, 广州期货交易所
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 中文品种名到英文代码的映射
 */
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
  '工业硅': 'SI', '碳酸锂': 'LC', '棉纱': 'CY', '短纤': 'PF',
  '对二甲苯': 'PX', '烧碱': 'SH', '菜籽': 'RS', '氧化铝': 'AO',
  'BR橡胶': 'BR', '集运指数': 'EC', '原木': 'LG', '纯苯': 'BZ',
};

/**
 * 大连商品交易所-注册仓单数据
 * http://www.dce.com.cn/dce/channel/list/187.html
 *
 * @param date 交易日，格式 YYYYMMDD
 * @param varsList 品种列表，如 ['A', 'M', 'Y']；默认为全部品种
 */
export async function get_dce_receipt(
  date: string,
  varsList?: string[]
): Promise<DataFrame> {
  const url = 'http://www.dce.com.cn/dcereport/publicweb/dailystat/wbillWeeklyQuotes';
  const payload = {
    tradeDate: date,
    varietyId: 'all',
  };

  try {
    const data = await httpPost<any>(url, payload);

    if (!data?.data?.entityList) {
      return createDataFrame([], []);
    }

    const columns = ['var', 'receipt', 'receipt_chg', 'date'];
    const rows: any[][] = [];

    for (const item of data.data.entityList) {
      if (typeof item.variety === 'string' && item.variety.endsWith('小计')) {
        const chineseName = item.variety.slice(0, -2);
        const varCode = chineseToEnglishMap[chineseName] || chineseName;
        rows.push([
          varCode,
          parseInt(item.wbillQty) || 0,
          parseInt(item.diff) || 0,
          date,
        ]);
      }
    }

    // Filter by varsList if provided
    let filteredRows = rows;
    if (varsList && varsList.length > 0) {
      filteredRows = rows.filter(row => varsList.includes(row[0]));
    }

    return createDataFrame(columns, filteredRows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海期货交易所-注册仓单数据
 * https://tsite.shfe.com.cn/statements/dataview.html?paramid=dailystock
 *
 * @param date 交易日，格式 YYYYMMDD
 * @param varsList 品种列表；默认为全部品种
 */
export async function get_shfe_receipt(
  date: string,
  varsList?: string[]
): Promise<DataFrame> {
  const url = `https://www.shfe.com.cn/data/tradedata/future/dailydata/${date}dailystock.dat`;

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.o_cursor || data.o_cursor.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['var', 'receipt', 'receipt_chg', 'date'];
    const records: Record<string, { receipt: number; receiptChg: number }> = {};

    for (const item of data.o_cursor) {
      const varName = (item.VARNAME || '').split('$')[0];
      let varCode: string;

      if (varName.includes('BC')) {
        varCode = 'BC';
      } else {
        // Extract Chinese characters and convert
        const chineseChars = varName.replace(/[a-zA-Z\$]/g, '');
        varCode = chineseToEnglishMap[chineseChars] || chineseChars;
      }

      const weight = parseInt(item.WRTWGHTS) || 0;
      const change = parseInt(item.WRTCHANGE) || 0;

      if (!records[varCode]) {
        records[varCode] = { receipt: 0, receiptChg: 0 };
      }
      records[varCode].receipt += weight;
      records[varCode].receiptChg += change;
    }

    const rows: any[][] = [];
    for (const [varCode, values] of Object.entries(records)) {
      rows.push([varCode, values.receipt, values.receiptChg, date]);
    }

    // Filter by varsList if provided
    let filteredRows = rows;
    if (varsList && varsList.length > 0) {
      filteredRows = rows.filter(row => varsList.includes(row[0]));
    }

    return createDataFrame(columns, filteredRows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 郑州商品交易所-注册仓单数据
 * http://www.czce.com.cn/cn/jysj/cdrb/H770310index_1.htm
 *
 * @param date 交易日，格式 YYYYMMDD
 * @param varsList 品种列表；默认为全部品种
 */
export async function get_czce_receipt(
  date: string,
  varsList?: string[]
): Promise<DataFrame> {
  const year = date.substring(0, 4);
  // Use the XLS/XLSX file format
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataWhsheet.xls`;

  try {
    // CZCE returns Excel files which are hard to parse in pure TypeScript
    // Fall back to the HTML-based approach for modern dates
    const htmlUrl = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataWhsheet.htm`;

    const response = await httpGet<string>(htmlUrl, {
      responseType: 'text',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response || typeof response !== 'string') {
      return createDataFrame([], []);
    }

    // Parse HTML table
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: string[][][] = [];
    let tableMatch;

    while ((tableMatch = tableRegex.exec(response)) !== null) {
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

    const columns = ['var', 'receipt', 'receipt_chg', 'date'];
    const rows: any[][] = [];

    // Process each table (each table is a variety section)
    for (const table of tables) {
      if (table.length < 3) continue;

      // Find the variety name from first row
      const firstRow = table[0];
      if (!firstRow || firstRow.length === 0) continue;

      const headerText = firstRow.join(' ');
      let varCode = '';

      if (headerText.includes('PTA')) {
        varCode = 'TA';
      } else {
        const match = headerText.match(/品种[：:]?\s*([A-Z]+)/);
        if (match) {
          varCode = match[1];
        } else {
          // Try to extract Chinese name
          const chineseMatch = headerText.match(/品种[：:]?\s*([一-龥]+)/);
          if (chineseMatch) {
            varCode = chineseToEnglishMap[chineseMatch[1]] || chineseMatch[1];
          }
        }
      }

      if (!varCode) continue;

      // Find the last data row (before summary)
      let receipt = 0;
      let receiptChg = 0;

      for (let i = table.length - 1; i >= 1; i--) {
        const row = table[i];
        const rowText = row.join(' ');
        if (rowText.includes('合计') || rowText.includes('小计') || rowText.includes('注')) continue;

        // Find receipt and change columns
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (cell.includes('仓单数量')) {
            // Header row, skip
          }
        }

        // Try to get numeric values from the last data row
        const numericValues = row.filter(cell => /^-?\d+(\.\d+)?$/.test(cell.replace(/,/g, '')));
        if (numericValues.length >= 2) {
          receipt = parseInt(numericValues[0].replace(/,/g, '')) || 0;
          receiptChg = parseInt(numericValues[1].replace(/,/g, '')) || 0;
          break;
        }
      }

      if (receipt > 0 || receiptChg !== 0) {
        rows.push([varCode, receipt, receiptChg, date]);
      }
    }

    // Filter by varsList if provided
    let filteredRows = rows;
    if (varsList && varsList.length > 0) {
      filteredRows = rows.filter(row => varsList.includes(row[0]));
    }

    return createDataFrame(columns, filteredRows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 郑州商品交易所-仓单日报（兼容别名）
 */
export async function futures_warehouse_receipt_czce(
  date: string = '20251103'
): Promise<DataFrame> {
  return get_czce_receipt(date);
}

/**
 * 广州期货交易所-注册仓单数据
 * http://www.gfex.com.cn/gfex/cdrb/hqsj_tjsj.shtml
 *
 * @param date 交易日，格式 YYYYMMDD
 * @param varsList 品种列表；默认为全部品种
 */
export async function get_gfex_receipt(
  date: string,
  varsList?: string[]
): Promise<DataFrame> {
  const url = 'http://www.gfex.com.cn/u/interfacesWebTdWbillWeeklyQuotes/loadList';

  try {
    const data = await httpPost<any>(url, `gen_date=${date}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    // Filter for summary rows (小计)
    const summaryRows = data.data.filter(
      (item: any) => item.variety && item.variety.includes('小计')
    );

    const columns = ['var', 'receipt', 'receipt_chg', 'date'];
    const rows: any[][] = [];

    for (const item of summaryRows) {
      const varCode = (item.varietyOrder || '').toUpperCase();
      rows.push([
        varCode,
        parseInt(item.wbillQty) || 0,
        parseInt(item.diff) || 0,
        date,
      ]);
    }

    // Filter by varsList if provided
    let filteredRows = rows;
    if (varsList && varsList.length > 0) {
      filteredRows = rows.filter(row => varsList.includes(row[0]));
    }

    return createDataFrame(columns, filteredRows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 大宗商品-注册仓单数据（通用接口）
 *
 * @param date 交易日，格式 YYYYMMDD
 * @param market 交易所：DCE, SHFE, CZCE, GFEX
 * @param varsList 品种列表；默认为全部品种
 */
export async function get_receipt(
  date: string,
  market: 'DCE' | 'SHFE' | 'CZCE' | 'GFEX' = 'DCE',
  varsList?: string[]
): Promise<DataFrame> {
  const marketFuncMap: Record<string, (date: string, varsList?: string[]) => Promise<DataFrame>> = {
    DCE: get_dce_receipt,
    SHFE: get_shfe_receipt,
    CZCE: get_czce_receipt,
    GFEX: get_gfex_receipt,
  };

  const func = marketFuncMap[market.toUpperCase()];
  if (!func) {
    return createDataFrame([], []);
  }

  return func(date, varsList);
}
