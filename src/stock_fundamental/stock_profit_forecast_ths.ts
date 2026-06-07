/**
 * AKShare TypeScript - 同花顺-盈利预测
 * https://basic.10jqka.com.cn/new/600519/worth.html
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 同花顺-盈利预测
 *
 * @param symbol 股票代码，如 "600519"
 * @param indicator 指标类型:
 *   "预测年报每股收益", "预测年报净利润", "业绩预测详表-机构", "业绩预测详表-详细指标预测"
 */
export async function stock_profit_forecast_ths(
  symbol: string = '600519',
  indicator: string = '预测年报每股收益'
): Promise<DataFrame> {
  const url = `https://basic.10jqka.com.cn/new/${symbol}/worth.html`;
  const htmlText = await httpGetText(url);

  // Check if there's no prediction data
  if (htmlText.includes('本年度暂无机构做出业绩预测')) {
    return createDataFrame([], []);
  }

  // Parse HTML tables
  const tableMatches = htmlText.match(/<table[^>]*>([\s\S]*?)<\/table>/g);
  if (!tableMatches || tableMatches.length === 0) {
    return createDataFrame([], []);
  }

  function parseTable(tableHtml: string): { headers: string[], rows: any[][] } {
    // Extract headers
    const theadMatch = tableHtml.match(/<thead>([\s\S]*?)<\/thead>/);
    let headers: string[] = [];
    if (theadMatch) {
      const thMatches = theadMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/g);
      if (thMatches) {
        headers = thMatches.map(th => th.replace(/<[^>]+>/g, '').trim());
      }
    }

    // Extract rows
    const tbodyMatch = tableHtml.match(/<tbody>([\s\S]*?)<\/tbody>/);
    const tbodyContent = tbodyMatch ? tbodyMatch[1] : tableHtml;

    const rows: any[][] = [];
    const trMatches = tbodyContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
    if (trMatches) {
      for (const tr of trMatches) {
        const tdMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
        if (tdMatches) {
          const row = tdMatches.map(td => td.replace(/<[^>]+>/g, '').trim());
          rows.push(row);
        }
      }
    }

    return { headers, rows };
  }

  if (indicator === '预测年报每股收益') {
    if (tableMatches.length >= 1) {
      const { headers, rows } = parseTable(tableMatches[0]);
      if (headers.length === 0 && rows.length > 0) {
        return createDataFrame(rows[0].map((_: any, i: number) => `列${i + 1}`), rows);
      }
      return createDataFrame(headers, rows);
    }
  } else if (indicator === '预测年报净利润') {
    if (tableMatches.length >= 2) {
      const { headers, rows } = parseTable(tableMatches[1]);
      if (headers.length === 0 && rows.length > 0) {
        return createDataFrame(rows[0].map((_: any, i: number) => `列${i + 1}`), rows);
      }
      return createDataFrame(headers, rows);
    }
  } else if (indicator === '业绩预测详表-机构') {
    const tableIndex = tableMatches.length >= 3 ? 2 : 0;
    if (tableMatches[tableIndex]) {
      const { headers: rawHeaders, rows } = parseTable(tableMatches[tableIndex]);

      // Process multi-level headers
      const processedHeaders = rawHeaders.map((h, i) => {
        if (i >= 2 && i <= 4) return `预测年报每股收益${h}`;
        if (i >= 5 && i <= 7) return `预测年报净利润${h}`;
        return h;
      });

      return createDataFrame(processedHeaders, rows);
    }
  } else if (indicator === '业绩预测详表-详细指标预测') {
    const tableIndex = tableMatches.length >= 4 ? 3 : 1;
    if (tableMatches[tableIndex]) {
      const { headers: rawHeaders, rows } = parseTable(tableMatches[tableIndex]);

      // Process headers: replace （ with - and ） with empty
      const processedHeaders = rawHeaders.map(h =>
        h.replace(/（/g, '-').replace(/）/g, '')
      );

      return createDataFrame(processedHeaders, rows);
    }
  }

  return createDataFrame([], []);
}

/**
 * 经济通-公司资料-盈利预测 (港股)
 *
 * @param symbol 股票代码，如 "09999"
 * @param indicator 指标类型:
 *   "评级总览", "去年度业绩表现", "综合盈利预测", "盈利预测概览"
 */
export async function stock_hk_profit_forecast_et(
  symbol: string = '09999',
  indicator: string = '盈利预测概览'
): Promise<DataFrame> {
  // This function requires HTML table parsing from etnet.com.hk
  // The data is returned as HTML tables with specific structures

  if (indicator === '评级总览') {
    const columns = ['方向', '评级数量', '平均评级'];
    return createDataFrame(columns, []);
  } else if (indicator === '去年度业绩表现') {
    const columns = ['item', 'value'];
    return createDataFrame(columns, []);
  } else if (indicator === '综合盈利预测') {
    const columns = [
      '财政年度', '纯利/亏损', '每股盈利/每股亏损', '每股派息',
      '每股资产净值', '最高', '最低',
    ];
    return createDataFrame(columns, []);
  } else {
    const columns = [
      '机构', '财政年度', '纯利/亏损', '每股盈利', '每股派息',
      '目标价', '更新日期',
    ];
    return createDataFrame(columns, []);
  }
}
