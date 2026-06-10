/**
 * AKShare TypeScript - 指数成分股数据接口
 * 新浪财经-指数成分股 / 中证指数-成分股
 */

import * as XLSX from 'xlsx';
import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-股票指数成份股 (新浪老接口)
 * https://vip.stock.finance.sina.com.cn/corp/view/vII_NewestComponent.php?page=1&indexid=399639
 *
 * @param symbol 指数代码，如 "399639"
 */
export async function index_stock_cons_old_sina(symbol: string = '399639'): Promise<DataFrame> {
  const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vII_NewestComponent/indexid/${symbol}.phtml`;

  const text = await httpGetText(url);

  // Parse HTML table - simplified version
  // In production, you'd use a proper HTML parser
  const rows: any[][] = [];

  // Try to extract table data using regex
  const tableMatch = text.match(/<table[^>]*class="table2"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    return createDataFrame([], []);
  }

  const tableHtml = tableMatch[1];
  const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

  if (!rowMatches) {
    return createDataFrame([], []);
  }

  // Skip header row
  for (let i = 1; i < rowMatches.length; i++) {
    const rowHtml = rowMatches[i];
    const cellMatches = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);

    if (cellMatches && cellMatches.length >= 3) {
      const cells = cellMatches.map(cell => {
        const textMatch = cell.match(/>([^<]*)</);
        return textMatch ? textMatch[1].trim() : '';
      });
      rows.push(cells);
    }
  }

  const columns = ['品种代码', '品种名称', '纳入时间'];

  return createDataFrame(columns, rows);
}

/**
 * 中证指数网站-成份股目录
 * https://www.csindex.com.cn/zh-CN/indices/index-detail/000300
 * Python columns: 日期, 指数代码, 指数名称, 指数英文名称, 成分券代码, 成分券名称, 成分券英文名称, 交易所, 交易所英文名称
 *
 * @param symbol 指数代码，如 "000300"
 */
export async function index_stock_cons_csindex(symbol: string = '000300'): Promise<DataFrame> {
  const url = `https://oss-ch.csindex.com.cn/static/html/csindex/public/uploads/file/autofile/cons/${symbol}cons.xls`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return createDataFrame([], []);
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return createDataFrame([], []);
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as any[][];
    if (rows.length <= 1) {
      return createDataFrame([], []);
    }

    const columns = [
      '日期', '指数代码', '指数名称', '指数英文名称',
      '成分券代码', '成分券名称', '成分券英文名称',
      '交易所', '交易所英文名称',
    ];

    const data = rows.slice(1).map((row) => columns.map((_, index) => row[index] ?? ''));

    return createDataFrame(columns, data);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 中证指数网站-样本权重
 * https://www.csindex.com.cn/zh-CN/indices/index-detail/000300
 * Python columns: 日期, 指数代码, 指数名称, 指数英文名称, 成分券代码, 成分券名称, 成分券英文名称, 交易所, 交易所英文名称, 权重
 *
 * @param symbol 指数代码，如 "000300"
 */
export async function index_stock_cons_weight_csindex(symbol: string = '000300'): Promise<DataFrame> {
  const url = `https://oss-ch.csindex.com.cn/static/html/csindex/public/uploads/file/autofile/closeweight/${symbol}closeweight.xls`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return createDataFrame([], []);
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return createDataFrame([], []);
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as any[][];
    if (rows.length <= 1) {
      return createDataFrame([], []);
    }

    const columns = [
      '日期', '指数代码', '指数名称', '指数英文名称',
      '成分券代码', '成分券名称', '成分券英文名称',
      '交易所', '交易所英文名称', '权重',
    ];

    const data = rows.slice(1).map((row) => columns.map((_, index) => row[index] ?? ''));

    return createDataFrame(columns, data);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 新浪新版股票指数成份页面
 * https://vip.stock.finance.sina.com.cn/mkt/#zhishu_000040
 *
 * @param symbol 指数代码，如 "000300"
 */
export async function index_stock_cons_sina(symbol: string = '000300'): Promise<DataFrame> {
  // For HS300, use a different approach
  if (symbol === '000300') {
    const countUrl = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCountSimple';
    const countData = await httpGet<any>(countUrl, { params: { node: 'hs300' } });

    const total = parseInt(countData);
    const pageSize = 80;
    const pages = Math.ceil(total / pageSize) + 1;

    const allRows: any[][] = [];

    for (let page = 1; page <= pages; page++) {
      const url = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData';
      const params = {
        page: String(page),
        num: '80',
        sort: 'symbol',
        asc: '1',
        node: 'hs300',
        symbol: '',
        _s_r_a: 'init',
      };

      try {
        const data = await httpGet<any>(url, { params });
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            allRows.push([
              item.symbol,
              item.name,
              item.trade,
              item.pricechange,
              item.changepercent,
              item.buy,
              item.sell,
              item.settlement,
              item.open,
              item.high,
              item.low,
              item.volume,
              item.amount,
            ]);
          });
        }
      } catch {
        // Continue to next page
      }
    }

    const columns = [
      'symbol', 'code', 'name', 'trade', 'pricechange', 'changepercent',
      'buy', 'sell', 'settlement', 'open', 'high', 'low',
      'volume', 'amount', 'ticktime', 'per', 'pb', 'mktcap', 'nmc', 'turnoverratio',
    ];

    const expandedRows = allRows.map((row: any[]) => [
      row[0],  // symbol
      row[0] ? row[0].replace(/^(sh|sz)/, '') : '',  // code
      row[1],  // name
      row[2],  // trade
      row[3],  // pricechange
      row[4],  // changepercent
      row[5],  // buy
      row[6],  // sell
      row[7],  // settlement
      row[8],  // open
      row[9],  // high
      row[10], // low
      row[11], // volume
      row[12], // amount
      '',      // ticktime
      '',      // per
      '',      // pb
      '',      // mktcap
      '',      // nmc
      '',      // turnoverratio
    ]);

    return createDataFrame(columns, expandedRows);
  }

  // For other indices
  const url = 'https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeDataSimple';
  const params = {
    page: '1',
    num: '3000',
    sort: 'symbol',
    asc: '1',
    node: `zhishu_${symbol}`,
    _s_r_a: 'setlen',
  };

  const data = await httpGet<any>(url, { params });

  if (!Array.isArray(data)) {
    return createDataFrame([], []);
  }

  const columns = [
    'symbol', 'code', 'name', 'trade', 'pricechange', 'changepercent',
    'buy', 'sell', 'settlement', 'open', 'high', 'low',
    'volume', 'amount', 'ticktime', 'per', 'pb', 'mktcap', 'nmc', 'turnoverratio',
  ];

  const rows = data.map((item: any) => [
    item.symbol,
    item.symbol ? item.symbol.replace(/^(sh|sz)/, '') : '',
    item.name,
    item.trade,
    item.pricechange,
    item.changepercent,
    item.buy,
    item.sell,
    item.settlement,
    item.open,
    item.high,
    item.low,
    item.volume,
    item.amount,
    item.ticktime || '',
    item.per || '',
    item.pb || '',
    item.mktcap || '',
    item.nmc || '',
    item.turnoverratio || '',
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 聚宽-指数数据-指数列表
 * https://www.joinquant.com/data/dict/indexData
 */
export async function index_stock_info(): Promise<DataFrame> {
  const url = 'https://www.joinquant.com/data/dict/indexData';

  const text = await httpGetText(url);

  // Parse HTML table - simplified version
  // In production, you'd use a proper HTML parser
  const rows: any[][] = [];

  // Try to extract table data using regex
  const tableMatch = text.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    return createDataFrame([], []);
  }

  const tableHtml = tableMatch[1];
  const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

  if (!rowMatches) {
    return createDataFrame([], []);
  }

  // Skip header row
  for (let i = 1; i < rowMatches.length; i++) {
    const rowHtml = rowMatches[i];
    const cellMatches = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);

    if (cellMatches && cellMatches.length >= 3) {
      const cells = cellMatches.map(cell => {
        const textMatch = cell.match(/>([^<]*)</);
        return textMatch ? textMatch[1].trim() : '';
      });
      rows.push([cells[0].split('.')[0], cells[1], cells[2]]);
    }
  }

  const columns = ['index_code', 'display_name', 'publish_date'];

  return createDataFrame(columns, rows);
}
