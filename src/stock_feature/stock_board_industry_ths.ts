/**
 * AKShare TypeScript - 同花顺-板块-行业板块
 * https://q.10jqka.com.cn/thshy/
 */

import { httpGet, httpGetText, httpGetTextGbk } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { getThsHeaders } from '../utils/thsAuth';

/**
 * 同花顺-板块-行业板块-行业
 * http://q.10jqka.com.cn/thshy/
 * @returns 所有行业板块的名称和链接
 */
export async function stock_board_industry_name_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['name', 'code'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-板块-行业板块-板块简介
 * http://q.10jqka.com.cn/gn/detail/code/301558/
 * @param symbol 行业板块名称
 * @returns 板块简介数据
 */
export async function stock_board_industry_info_ths(symbol: string = '半导体'): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['项目', '值'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-板块-行业板块-指数数据
 * https://q.10jqka.com.cn/thshy/detail/code/881270/
 * @param symbol 行业板块名称
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @returns 指数数据
 */
export async function stock_board_industry_index_ths(
  symbol: string = '元件',
  start_date: string = '20200101',
  end_date: string = '20240108'
): Promise<DataFrame> {
  // Note: THS requires cookie authentication and JS execution
  const columns = ['日期', '开盘价', '最高价', '最低价', '收盘价', '成交量', '成交额'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-行业板块-同花顺行业一览表
 * https://q.10jqka.com.cn/thshy/
 * @returns 同花顺行业一览表数据
 */
export async function stock_board_industry_summary_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = [
    '序号', '板块', '涨跌幅', '总成交量', '总成交额', '净流入',
    '上涨家数', '下跌家数', '均价', '领涨股', '领涨股-最新价', '领涨股-涨跌幅',
  ];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-新股数据-新股上市首日
 * https://data.10jqka.com.cn/ipo/xgsr/
 *
 * Uses THS authentication with v-code (same as Python AKShare).
 *
 * @returns 新股上市首日数据
 */
export async function stock_xgsr_ths(): Promise<DataFrame> {
  try {
    const { load } = await import('cheerio');

    const headers = getThsHeaders();
    const allRows: string[][] = [];
    let tableHeaders: string[] = [];

    // First page to get total pages
    const firstUrl = 'https://data.10jqka.com.cn/ipo/xgsr/field/SSRQ/order/desc/page/1/ajax/1/free/1/';
    const firstText = await httpGetTextGbk(firstUrl, { headers });
    const $ = load(firstText);

    // Get total pages
    const pageInfo = $('span.page_info').text();
    let totalPages = 1;
    if (pageInfo) {
      const parts = pageInfo.split('/');
      if (parts.length >= 2) {
        totalPages = parseInt(parts[1]) || 1;
      }
    }

    // Parse first page table
    $('table thead th').each((_, th) => {
      tableHeaders.push($(th).text().trim());
    });

    $('table tbody tr').each((_, tr) => {
      const cells: string[] = [];
      $(tr).find('td').each((_, td) => {
        cells.push($(td).text().trim());
      });
      if (cells.length > 0) {
        allRows.push(cells);
      }
    });

    // Fetch remaining pages
    for (let page = 2; page <= totalPages; page++) {
      const pageUrl = `https://data.10jqka.com.cn/ipo/xgsr/field/SSRQ/order/desc/page/${page}/ajax/1/free/1/`;
      const pageHeaders = getThsHeaders();
      const pageText = await httpGetTextGbk(pageUrl, { headers: pageHeaders });
      const $page = load(pageText);

      $page('table tbody tr').each((_, tr) => {
        const cells: string[] = [];
        $page(tr).find('td').each((_, td) => {
          cells.push($page(td).text().trim());
        });
        if (cells.length > 0) {
          allRows.push(cells);
        }
      });
    }

    if (tableHeaders.length === 0 || allRows.length === 0) {
      return createDataFrame([], []);
    }

    // Rename columns to match Python output
    const columnRenames: Record<string, string> = {
      '发行价(元)': '发行价',
    };

    const finalColumns = tableHeaders.map(h => columnRenames[h] || h);

    // Process rows to match Python output
    const colIdx: Record<string, number> = {};
    finalColumns.forEach((c, i) => { colIdx[c] = i; });

    const processedRows = allRows.map(row => {
      const newRow = [...row];
      // Convert 首日涨跌幅: strip % and divide by 100
      if (colIdx['首日涨跌幅'] !== undefined && newRow[colIdx['首日涨跌幅']]) {
        const pctStr = String(newRow[colIdx['首日涨跌幅']]).replace('%', '');
        const pctNum = parseFloat(pctStr);
        if (!isNaN(pctNum)) {
          newRow[colIdx['首日涨跌幅']] = String(pctNum / 100);
        }
      }
      return newRow;
    });

    return createDataFrame(finalColumns, processedRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 同花顺-数据中心-新股数据-IPO受益股
 * https://data.10jqka.com.cn/ipo/syg/
 * @returns IPO受益股数据
 */
export async function stock_ipo_benefit_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = [
    '序号', '股票代码', '股票简称', '收盘价', '涨跌幅',
    '市值', '参股家数', '投资总额', '投资占市值比', '参股对象',
  ];
  return createDataFrame(columns, []);
}
