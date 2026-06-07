/**
 * AKShare TypeScript - 能源数据接口
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取能源实时行情 - 东方财富
 */
export async function energy_spot_em(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '100',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:113,m:114,m:115',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '品种代码', '品种名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '持仓量', '振幅', '开盘', '最高', '最低', '昨收', '结算'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 品种代码
    item.f14,  // 品种名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f8,   // 持仓量
    item.f7,   // 振幅
    item.f17,  // 开盘
    item.f15,  // 最高
    item.f16,  // 最低
    item.f18,  // 昨收
    item.f21,  // 结算
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取原油历史行情 - 东方财富
 *
 * @param symbol 品种代码，如 "CL" (WTI原油), "BRENT" (布伦特原油)
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function energy_oil_hist(
  symbol: string = 'CL',
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    daily: '101',
    weekly: '102',
    monthly: '103',
  };

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: periodMap[period],
    fqt: '1',
    secid: `101.${symbol}`,
    beg: startDate || '19700101',
    end: endDate || '20500101',
    lmt: '1000000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量', '振幅', '涨跌幅', '涨跌额'];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseInt(parts[5]),
      parseFloat(parts[7]),
      parseFloat(parts[8]),
      parseFloat(parts[9]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 获取天然气历史行情 - 东方财富
 */
export async function energy_gas_hist(
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  return energy_oil_hist('NG', period, startDate, endDate);
}

/**
 * 获取煤炭价格数据 - 东方财富
 */
export async function energy_coal_spot(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ENERGY_COAL',
    columns: 'ALL',
    pageNumber: '1',
    pageSize: '1000',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '品种', '价格', '涨跌', '单位'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.VARIETY,
    item.PRICE,
    item.CHANGE,
    item.UNIT,
  ]);

  return createDataFrame(columns, rows);
}

// ---------------------------------------------------------------------------
// 碳排放交易
// ---------------------------------------------------------------------------

/**
 * 碳交易网-行情信息
 * http://www.tanjiaoyi.com/
 *
 * @param symbol choice of {'湖北', '上海', '北京', '重庆', '广东', '天津', '深圳', '福建'}
 */
export async function energy_carbon_domestic(
  symbol: string = '湖北'
): Promise<DataFrame> {
  const url = 'http://k.tanjiaoyi.com:8080/KDataController/getHouseDatasInAverage.do';
  const params = {
    lcnK: '53f75bfcefff58e4046ccfa42171636c',
    brand: 'TAN',
  };

  const responseText = await httpGetText(url, { params });

  // Parse JSONP-like response: callbackName({...})
  const jsonStart = responseText.indexOf('(');
  const jsonEnd = responseText.lastIndexOf(')');
  if (jsonStart === -1 || jsonEnd === -1) {
    return createDataFrame([], []);
  }

  const jsonStr = responseText.substring(jsonStart + 1, jsonEnd);
  let dataJson: any;
  try {
    dataJson = JSON.parse(jsonStr);
  } catch {
    // Try with demjson-like lenient parsing (single quotes etc.)
    try {
      dataJson = JSON.parse(jsonStr.replace(/'/g, '"'));
    } catch {
      return createDataFrame([], []);
    }
  }

  const symbolData = dataJson[symbol];
  if (!symbolData || !Array.isArray(symbolData) || symbolData.length === 0) {
    return createDataFrame([], []);
  }

  const allColumns = ['成交价', '_', '成交量', '地点', '成交额', '日期', '_'];
  const keepColumns = ['日期', '成交价', '成交量', '成交额', '地点'];

  const rows = symbolData.map((item: any[]) => {
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      if (col !== '_') row[col] = item[i];
    });
    return keepColumns.map(col => row[col] ?? null);
  });

  return createDataFrame(keepColumns, rows);
}

/**
 * 北京市碳排放权电子交易平台-北京市碳排放权公开交易行情
 * https://www.bjets.com.cn/article/jyxx/
 */
export async function energy_carbon_bj(): Promise<DataFrame> {
  const url = 'https://www.bjets.com.cn/article/jyxx/';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  };

  const html = await httpGetText(url, { headers });

  // Extract total page count from <script> inside table
  const scriptMatch = html.match(/=(\d+);?/);
  const totalPages = scriptMatch ? parseInt(scriptMatch[1]) : 1;

  const columns = ['日期', '成交量', '成交均价', '成交额', '成交单位'];
  let allRows: any[][] = [];

  for (let page = 1; page <= totalPages; page++) {
    const pageUrl = page === 1 ? url : `${url}?${page}`;
    try {
      const pageHtml = await httpGetText(pageUrl, { headers });

      // Parse HTML table
      const tableMatch = pageHtml.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
      if (!tableMatch) continue;

      const table = tableMatch[0];
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch;
      let isFirstRow = true;

      while ((rowMatch = rowRegex.exec(table)) !== null) {
        if (isFirstRow) {
          isFirstRow = false;
          continue;
        }

        const cells: string[] = [];
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
        }

        if (cells.length >= 3) {
          // Parse 成交额 which may contain unit info in parentheses
          let amount = cells[3] || '';
          let unit = '';
          const unitMatch = amount.match(/[（(](.+?)[)）]/);
          if (unitMatch) {
            unit = unitMatch[1];
            amount = amount.replace(/[（(].+?[)）]/, '').trim();
          }
          amount = amount.replace(/,/g, '');

          allRows.push([
            cells[0],           // 日期
            cells[1],           // 成交量
            cells[2],           // 成交均价
            amount,             // 成交额
            unit,               // 成交单位
          ]);
        }
      }
    } catch {
      continue;
    }
  }

  // Sort by date
  allRows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  return createDataFrame(columns, allRows);
}

/**
 * 深圳碳排放交易所-国内碳情
 * http://www.cerx.cn/dailynewsCN/index.htm
 */
export async function energy_carbon_sz(): Promise<DataFrame> {
  const url = 'http://www.cerx.cn/dailynewsCN/index.htm';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  };

  const html = await httpGetText(url, { headers });

  // Extract page count
  const optionRegex = /<option[^>]*>(\d+)<\/option>/gi;
  let optionMatch;
  let pageNum = 1;
  while ((optionMatch = optionRegex.exec(html)) !== null) {
    const val = parseInt(optionMatch[1]);
    if (val > pageNum) pageNum = val;
  }

  const columns = ['交易日期', '开盘价', '最高价', '最低价', '成交均价', '收盘价', '成交量', '成交额'];
  let allRows: any[][] = [];

  // Helper to parse HTML table
  function parseTable(tableHtml: string): any[][] {
    const rows: any[][] = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    let isHeader = true;
    while ((trMatch = trRegex.exec(tableHtml)) !== null) {
      if (isHeader) { isHeader = false; continue; }
      const cells: string[] = [];
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let tdMatch;
      while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
        cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (cells.length >= 8) {
        rows.push(cells.slice(0, 8));
      }
    }
    return rows;
  }

  // Parse first page
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (tableMatch) {
    allRows = allRows.concat(parseTable(tableMatch[0]));
  }

  // Parse remaining pages
  for (let page = 2; page <= pageNum; page++) {
    const pageUrl = `http://www.cerx.cn/dailynewsCN/index_${page}.htm`;
    try {
      const pageHtml = await httpGetText(pageUrl, { headers });
      const pageTableMatch = pageHtml.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
      if (pageTableMatch) {
        allRows = allRows.concat(parseTable(pageTableMatch[0]));
      }
    } catch {
      continue;
    }
  }

  // Sort by date
  allRows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  return createDataFrame(columns, allRows);
}

/**
 * 深圳碳排放交易所-国际碳情
 * http://www.cerx.cn/dailynewsOuter/index.htm
 */
export async function energy_carbon_eu(): Promise<DataFrame> {
  const url = 'http://www.cerx.cn/dailynewsOuter/index.htm';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  };

  const html = await httpGetText(url, { headers });

  // Extract page count
  const optionRegex = /<option[^>]*>(\d+)<\/option>/gi;
  let optionMatch;
  let pageNum = 1;
  while ((optionMatch = optionRegex.exec(html)) !== null) {
    const val = parseInt(optionMatch[1]);
    if (val > pageNum) pageNum = val;
  }

  const columns = ['交易日期', '开盘价', '最高价', '最低价', '成交均价', '收盘价', '成交量', '成交额'];
  let allRows: any[][] = [];

  function parseTable(tableHtml: string): any[][] {
    const rows: any[][] = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    let isHeader = true;
    while ((trMatch = trRegex.exec(tableHtml)) !== null) {
      if (isHeader) { isHeader = false; continue; }
      const cells: string[] = [];
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let tdMatch;
      while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
        cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (cells.length >= 8) {
        rows.push(cells.slice(0, 8));
      }
    }
    return rows;
  }

  // Parse first page
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (tableMatch) {
    allRows = allRows.concat(parseTable(tableMatch[0]));
  }

  // Parse remaining pages
  for (let page = 2; page <= pageNum; page++) {
    const pageUrl = `http://www.cerx.cn/dailynewsOuter/index_${page}.htm`;
    try {
      const pageHtml = await httpGetText(pageUrl, { headers });
      const pageTableMatch = pageHtml.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
      if (pageTableMatch) {
        allRows = allRows.concat(parseTable(pageTableMatch[0]));
      }
    } catch {
      continue;
    }
  }

  // Sort by date
  allRows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  return createDataFrame(columns, allRows);
}

/**
 * 湖北碳排放权交易中心-现货交易数据-配额-每日概况
 * https://www.hbets.cn/
 */
export async function energy_carbon_hb(): Promise<DataFrame> {
  const url = 'https://www.hbets.cn/';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  };

  const html = await httpGetText(url, { headers });

  // Extract the JSON data from the script containing "cjj = '"
  const cjjMatch = html.match(/cjj\s*=\s*'\[[\s\S]*?\]/);
  if (!cjjMatch) {
    return createDataFrame([], []);
  }

  // Extract the JSON array string
  const fullMatch = html.match(/cjj\s*=\s*'(\[[\s\S]*?\])\s*'/);
  if (!fullMatch) {
    return createDataFrame([], []);
  }

  let dataJson: any[];
  try {
    dataJson = JSON.parse(fullMatch[1]);
  } catch {
    try {
      // Try lenient parsing
      dataJson = JSON.parse(fullMatch[1].replace(/'/g, '"'));
    } catch {
      return createDataFrame([], []);
    }
  }

  if (!Array.isArray(dataJson) || dataJson.length === 0) {
    return createDataFrame([], []);
  }

  const columnMapping: Record<string, string> = {
    riqi: '日期',
    cjj: '成交价',
    cjl: '成交量',
    zx: '最新',
    zd: '涨跌',
  };

  const keepColumns = ['日期', '成交价', '成交量', '最新', '涨跌'];

  const rows = dataJson.map((item: Record<string, any>) =>
    keepColumns.map(col => {
      const srcKey = Object.entries(columnMapping).find(([, v]) => v === col)?.[0];
      return srcKey ? (item[srcKey] ?? null) : null;
    })
  );

  return createDataFrame(keepColumns, rows);
}

/**
 * 广州碳排放权交易中心-行情信息
 * http://www.cnemission.com/article/hqxx/
 */
export async function energy_carbon_gz(): Promise<DataFrame> {
  const url = 'http://ets.cnemission.com/carbon/portalIndex/markethistory';
  const params = {
    Top: '1',
    beginTime: '2010-01-01',
    endTime: '2030-09-12',
  };

  const html = await httpGetText(url, { params });

  // Parse HTML table
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (!tableMatch || tableMatch.length < 2) {
    return createDataFrame([], []);
  }

  const table = tableMatch[1]; // Second table (index 1)
  const rows: any[][] = [];

  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  let isHeader = true;

  while ((trMatch = trRegex.exec(table)) !== null) {
    if (isHeader) { isHeader = false; continue; }
    const cells: string[] = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
      cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    if (cells.length >= 10) {
      rows.push([
        cells[0],                         // 日期
        cells[1],                         // 品种
        parseFloat(cells[2]) || null,     // 开盘价
        parseFloat(cells[3]) || null,     // 收盘价
        parseFloat(cells[4]) || null,     // 最高价
        parseFloat(cells[5]) || null,     // 最低价
        parseFloat(cells[6]) || null,     // 涨跌
        cells[7] ? parseFloat(cells[7].replace('%', '')) || null : null, // 涨跌幅
        parseFloat(cells[8]) || null,     // 成交数量
        parseFloat(cells[9]) || null,     // 成交金额
      ]);
    }
  }

  const columns = ['日期', '品种', '开盘价', '收盘价', '最高价', '最低价', '涨跌', '涨跌幅', '成交数量', '成交金额'];

  // Sort by date
  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  return createDataFrame(columns, rows);
}

// ---------------------------------------------------------------------------
// 东方财富-数据中心-中国油价
// ---------------------------------------------------------------------------

/**
 * 汽柴油历史调价信息
 * https://data.eastmoney.com/cjsj/oil_default.html
 */
export async function energy_oil_benchmark(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPTA_WEB_YJ_BD',
    columns: 'ALL',
    sortColumns: 'dim_date',
    sortTypes: '-1',
    token: '894050c76af8597a853f5b408b759f5d',
    pageNumber: '1',
    pageSize: '1000',
    source: 'WEB',
    p: '1',
    pageNo: '1',
    pageNum: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const rawData = data.result.data;
  if (rawData.length === 0) return createDataFrame([], []);

  const columns = ['调整日期', '汽油价格', '柴油价格', '汽油涨跌', '柴油涨跌'];

  // The API returns data with generic column names; use positional mapping
  const firstItem = rawData[0];
  const keys = Object.keys(firstItem);

  const rows = rawData.map((item: any) => keys.map(k => item[k]));

  return createDataFrame(columns, rows);
}

/**
 * 全国各地区的汽油和柴油油价
 * https://data.eastmoney.com/cjsj/oil_default.html
 *
 * @param date 可以调用 energy_oil_benchmark() 得到可以获取油价的调整时间，格式 YYYYMMDD
 */
export async function energy_oil_detail(date: string = '20220517'): Promise<DataFrame> {
  const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPTA_WEB_YJ_JH',
    columns: 'ALL',
    filter: `(dim_date='${formattedDate}')`,
    sortColumns: 'cityname',
    sortTypes: '1',
    token: '894050c76af8597a853f5b408b759f5d',
    pageNumber: '1',
    pageSize: '1000',
    source: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const rawData = data.result.data;
  if (rawData.length === 0) return createDataFrame([], []);

  const columns = [
    '日期', '地区',
    'V_0', 'V_92', 'V_95', 'V_89',
    'ZDE_0', 'ZDE_92', 'ZDE_95', 'ZDE_89',
    'QE_0', 'QE_92', 'QE_95', 'QE_89',
  ];

  // The API returns data with generic column names; use positional mapping
  // Skip the first column (index) as Python does with iloc[:, 1:]
  const firstItem = rawData[0];
  const keys = Object.keys(firstItem);

  const rows = rawData.map((item: any) => {
    const values = keys.map(k => item[k]);
    // Skip first column (index column like Python's iloc[:, 1:])
    return values.slice(1);
  });

  return createDataFrame(columns, rows);
}
