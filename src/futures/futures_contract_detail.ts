/**
 * AKShare TypeScript - 期货合约详情查询
 * https://finance.sina.com.cn/futures/quotes/V2101.shtml
 * https://quote.eastmoney.com/qihuo/v2602F.html
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-查询期货合约详情
 * https://finance.sina.com.cn/futures/quotes/V2101.shtml
 *
 * @param symbol 合约代码，如 "AP2101"
 */
export async function futures_contract_detail(symbol: string = 'AP2101'): Promise<DataFrame> {
  const url = `https://finance.sina.com.cn/futures/quotes/${symbol}.shtml`;

  try {
    const html = await httpGetText(url);

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

    // The 7th table (index 6) contains the contract details
    if (tables.length < 7) {
      return createDataFrame([], []);
    }

    const detailTable = tables[6];
    if (detailTable.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['item', 'value'];
    const rows: any[][] = [];

    // Parse 3-column layout
    for (const row of detailTable) {
      if (row.length >= 2) rows.push([row[0], row[1]]);
      if (row.length >= 4) rows.push([row[2], row[3]]);
      if (row.length >= 6) rows.push([row[4], row[5]]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 东方财富网-查询期货合约详情
 * https://quote.eastmoney.com/qihuo/v2602F.html
 *
 * @param symbol 合约代码，如 "v2602F"
 */
export async function futures_contract_detail_em(symbol: string = 'v2602F'): Promise<DataFrame> {
  const url = `https://quote.eastmoney.com/qihuo/${symbol}.html`;

  try {
    const html = await httpGetText(url);

    // Extract the inner symbol from the page
    const hrefMatch = html.match(/href="[^"]*#(futures_[^"]+)"/);
    if (!hrefMatch) {
      return createDataFrame([], []);
    }

    const innerSymbol = hrefMatch[1].replace('futures_', '');
    const infoUrl = `https://futsse-static.eastmoney.com/redis?msgid=${innerSymbol}_info`;
    const data = await httpGet<Record<string, any>>(infoUrl);

    const columnMapping: Record<string, string> = {
      vname: '交易品种',
      vcode: '交易代码',
      jydw: '交易单位',
      bjdw: '报价单位',
      market: '上市交易所',
      zxbddw: '最小变动价格',
      zdtbfd: '跌涨停板幅度',
      hyjgyf: '合约交割月份',
      jysj: '交易时间',
      zhjyr: '最后交易日',
      zhjgr: '最后交割日',
      jgpj: '交割品级',
      zcjybzj: '最初交易保证金',
      jgfs: '交割方式',
    };

    const columns = ['item', 'value'];
    const rows: any[][] = [];

    for (const [key, value] of Object.entries(data)) {
      const label = columnMapping[key] || key;
      rows.push([label, value]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
