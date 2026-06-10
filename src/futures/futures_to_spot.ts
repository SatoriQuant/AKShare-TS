/**
 * AKShare TypeScript - 期货-期转现-交割
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

function parseXlsBuffer(buffer: Buffer): string[][] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const XLSX = require('xlsx');
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
}

/**
 * 上海期货交易所-期转现
 * @param date 年月，格式 YYYYMM，如 "202312"
 */
export async function futures_to_spot_shfe(date: string = '202312'): Promise<DataFrame> {
  const url = `https://tsite.shfe.com.cn/data/instrument/ExchangeDelivery${date}.dat`;

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.ExchangeDelivery || data.ExchangeDelivery.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '合约', '交割量', '期转现量'];
    const rows = data.ExchangeDelivery.map((item: any) => [
      item[1] || '',  // 日期
      item[5] || '',  // 合约
      parseFloat(item[2]) || 0,  // 交割量
      parseFloat(item[4]) || 0,  // 期转现量
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海期货交易所-交割情况表
 * @param date 年月，格式 YYYYMM，如 "202312"
 */
export async function futures_delivery_shfe(date: string = '202312'): Promise<DataFrame> {
  const url = `https://tsite.shfe.com.cn/data/dailydata/${date}monthvarietystatistics.dat`;

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.o_curdelivery || data.o_curdelivery.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '品种', '交割量-本月', '交割量-比重', '交割量-本年累计', '交割量-累计同比',
    ];

    const rows = data.o_curdelivery.map((item: any) => [
      item[0] || '',
      parseFloat(item[3]) || 0,
      parseFloat(item[4]) || 0,
      parseFloat(item[5]) || 0,
      parseFloat(item[6]) || 0,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 大连商品交易所-期转现
 * @param date 期转现日期，格式 YYYYMM，如 "202312"
 */
export async function futures_to_spot_dce(date: string = '202312'): Promise<DataFrame> {
  const url = 'http://www.dce.com.cn/publicweb/quotesdata/ftsDeal.html';
  const params = {
    'ftsDealQuotes.variety': 'all',
    year: '',
    month: '',
    'ftsDealQuotes.begin_month': date,
    'ftsDealQuotes.end_month': date,
  };

  try {
    const html = await httpGet<string>(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      responseType: 'text',
    });

    if (!html || typeof html !== 'string') {
      return createDataFrame([], []);
    }

    // Parse HTML table
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      return createDataFrame([], []);
    }

    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const allRows: string[][] = [];
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }
      if (cells.length > 0) allRows.push(cells);
    }

    if (allRows.length < 2) {
      return createDataFrame([], []);
    }

    const columns = allRows[0];
    const rows = allRows.slice(1).filter(row => {
      const contractCode = row[0] || '';
      return !contractCode.includes('小计') && !contractCode.includes('总计') && contractCode !== '';
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 大连商品交易所-交割统计
 * @param date 交割日期，格式 YYYYMM，如 "202101"
 */
export async function futures_delivery_dce(date: string = '202101'): Promise<DataFrame> {
  const url = 'http://www.dce.com.cn/publicweb/quotesdata/delivery.html';
  const nextMonth = (parseInt(date) + 1).toString();
  const params = {
    'deliveryQuotes.variety': 'all',
    year: '',
    month: '',
    'deliveryQuotes.begin_month': date,
    'deliveryQuotes.end_month': nextMonth,
  };

  try {
    const html = await httpGet<string>(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      responseType: 'text',
    });

    if (!html || typeof html !== 'string') {
      return createDataFrame([], []);
    }

    // Parse HTML table
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      return createDataFrame([], []);
    }

    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const allRows: string[][] = [];
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }
      if (cells.length > 0) allRows.push(cells);
    }

    if (allRows.length < 2) {
      return createDataFrame([], []);
    }

    const columns = allRows[0];
    const rows = allRows.slice(1).filter(row => {
      const variety = row[0] || '';
      return !variety.includes('小计') && !variety.includes('总计') && variety !== '';
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 郑州商品交易所-期转现统计
 * http://www.czce.com.cn/cn/jysj/qzxtj/H770311index_1.htm
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_to_spot_czce(date: string = '20231228'): Promise<DataFrame> {
  const year = date.substring(0, 4);
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataTrdtrades.xls`;

  try {
    const buffer = await httpGet<any>(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const allRows = parseXlsBuffer(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));

    if (allRows.length < 3) {
      return createDataFrame([], []);
    }

    const columns = ['合约代码', '合约数量'];
    const rows = allRows.slice(2).filter(row => {
      const contractCode = String(row[0] || '').trim();
      return contractCode && !contractCode.includes('合计');
    }).map(row => [
      String(row[0] || '').trim(),
      String(row[1] || '').replace(/,/g, ''),
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 大连商品交易所-交割配对表
 * http://www.dce.com.cn/dalianshangpin/xqsj/tjsj26/jgtj/jgsj/index.html
 *
 * @param symbol 交割品种，如 "a"
 */
export async function futures_delivery_match_dce(symbol: string = 'a'): Promise<DataFrame> {
  const url = 'http://www.dce.com.cn/publicweb/quotesdata/deliveryMatch.html';
  const params = {
    'deliveryMatchQuotes.variety': symbol,
    'contract.contract_id': 'all',
    'contract.variety_id': symbol,
  };

  try {
    const html = await httpGet<string>(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      responseType: 'text',
    });

    if (!html || typeof html !== 'string') {
      return createDataFrame([], []);
    }

    // Parse HTML table
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      return createDataFrame([], []);
    }

    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const allRows: string[][] = [];
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }
      if (cells.length > 0) allRows.push(cells);
    }

    if (allRows.length < 2) {
      return createDataFrame([], []);
    }

    const columns = allRows[0];
    // Remove the last row (summary)
    const rows = allRows.slice(1, -1);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 郑州商品交易所-交割配对
 * http://www.czce.com.cn/cn/jysj/jgpd/H770308index_1.htm
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_delivery_match_czce(date: string = '20210106'): Promise<DataFrame> {
  const year = date.substring(0, 4);
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataDelsettle.xls`;

  try {
    const buffer = await httpGet<any>(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const allRows = parseXlsBuffer(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));

    if (allRows.length < 3) {
      return createDataFrame([], []);
    }

    // Row 0: title, Row 1: date and contract info, Row 2: column headers
    const infoRow = String(allRows[1]?.[0] || '');
    const dateMatch = infoRow.match(/配对日期[：:]\s*(\S+)/);
    const contractMatch = infoRow.match(/合约代码[：:]\s*(\S+)/);
    const pairDate = dateMatch ? dateMatch[1] : date;
    const contractCode = contractMatch ? contractMatch[1] : '';

    const columns = [
      '卖方会员', '卖方会员-会员简称', '买方会员', '买方会员-会员简称',
      '交割量', '配对日期', '合约代码',
    ];

    const rows = allRows.slice(3).filter(row => {
      const first = String(row[0] || '').trim();
      return first && !first.includes('合计');
    }).map(row => [
      String(row[0] || '').trim(),
      String(row[1] || '').trim(),
      String(row[2] || '').trim(),
      String(row[3] || '').trim(),
      String(row[4] || '').replace(/,/g, ''),
      pairDate,
      contractCode,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 郑州商品交易所-月度交割查询
 * http://www.czce.com.cn/cn/jysj/ydjgcx/H770316index_1.htm
 *
 * @param date 日期，格式 YYYYMMDD
 */
export async function futures_delivery_czce(date: string = '20210112'): Promise<DataFrame> {
  const year = date.substring(0, 4);
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataSettlematched.xls`;

  try {
    const buffer = await httpGet<any>(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const allRows = parseXlsBuffer(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));

    if (allRows.length < 3) {
      return createDataFrame([], []);
    }

    // Skip header row (row 0 is title, row 1 is column headers)
    const columns = ['品种', '交割数量', '交割额'];
    const rows = allRows.slice(2).filter(row => row[0] && String(row[0]).trim()).map(row => [
      String(row[0] || '').trim(),
      String(row[1] || '').replace(/,/g, ''),
      String(row[2] || '').replace(/,/g, ''),
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
