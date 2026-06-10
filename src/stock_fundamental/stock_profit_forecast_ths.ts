/**
 * AKShare TypeScript - 同花顺-盈利预测
 * https://basic.10jqka.com.cn/new/600519/worth.html
 */

import { httpGetText, httpGetTextGbk } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 同花顺-盈利预测
 * https://basic.10jqka.com.cn/new/600519/worth.html
 *
 * Uses cheerio for HTML parsing (same as Python AKShare with BeautifulSoup).
 *
 * @param symbol 股票代码，如 "600519"
 * @param indicator 指标类型:
 *   "预测年报每股收益", "预测年报净利润", "业绩预测详表-机构", "业绩预测详表-详细指标预测"
 */
export async function stock_profit_forecast_ths(
  symbol: string = '600519',
  indicator: string = '预测年报每股收益'
): Promise<DataFrame> {
  try {
    const { load } = await import('cheerio');

    const url = `https://basic.10jqka.com.cn/new/${symbol}/worth.html`;
    const htmlText = await httpGetTextGbk(url);

    if (htmlText.includes('本年度暂无机构做出业绩预测')) {
      return createDataFrame([], []);
    }

    const $ = load(htmlText);
    const tables = $('table').toArray();

    if (tables.length === 0) {
      return createDataFrame([], []);
    }

    function parseTable(tableEl: any): { headers: string[]; rows: string[][] } {
      const headers: string[] = [];
      $(tableEl).find('thead th').each((_: any, th: any) => {
        headers.push($(th).text().trim());
      });

      const rows: string[][] = [];
      $(tableEl).find('tbody tr').each((_: any, tr: any) => {
        const cells: string[] = [];
        $(tr).find('td').each((_: any, td: any) => {
          cells.push($(td).text().trim());
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });

      return { headers, rows };
    }

    if (indicator === '预测年报每股收益') {
      const { headers, rows } = parseTable(tables[0]);
      if (headers.length === 0 && rows.length > 0) {
        return createDataFrame(rows[0].map((_, i) => `列${i + 1}`), rows);
      }
      // Python converts 年度 column to string
      const yearIdx = headers.indexOf('年度');
      const finalRows = rows.map(row => {
        const newRow = [...row];
        if (yearIdx !== -1 && newRow[yearIdx]) {
          newRow[yearIdx] = String(newRow[yearIdx]);
        }
        return newRow;
      });
      return createDataFrame(headers, finalRows);
    }

    if (indicator === '预测年报净利润') {
      if (tables.length < 2) return createDataFrame([], []);
      const { headers, rows } = parseTable(tables[1]);
      if (headers.length === 0 && rows.length > 0) {
        return createDataFrame(rows[0].map((_, i) => `列${i + 1}`), rows);
      }
      return createDataFrame(headers, rows);
    }

    if (indicator === '业绩预测详表-机构') {
      const tableIndex = tables.length >= 3 ? 2 : 0;
      const { headers: rawHeaders, rows } = parseTable(tables[tableIndex]);

      const processedHeaders = rawHeaders.map((h, i) => {
        if (i >= 2 && i <= 4) return `预测年报每股收益${h}`;
        if (i >= 5 && i <= 7) return `预测年报净利润${h}`;
        return h;
      });

      return createDataFrame(processedHeaders, rows);
    }

    if (indicator === '业绩预测详表-详细指标预测') {
      const tableIndex = tables.length >= 4 ? 3 : 1;
      if (!tables[tableIndex]) return createDataFrame([], []);
      const { headers: rawHeaders, rows } = parseTable(tables[tableIndex]);

      const processedHeaders = rawHeaders.map(h =>
        h.replace(/（/g, '-').replace(/）/g, '')
      );

      return createDataFrame(processedHeaders, rows);
    }

    return createDataFrame([], []);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 经济通-公司资料-盈利预测 (港股)
 * https://www.etnet.com.hk/www/sc/stocks/realtime/quote_profit.php?code=9999
 *
 * Uses etnet.com.hk HTML table parsing (same as Python AKShare).
 *
 * @param symbol 股票代码，如 "09999"
 * @param indicator 指标类型:
 *   "评级总览", "去年度业绩表现", "综合盈利预测", "盈利预测概览"
 */
export async function stock_hk_profit_forecast_et(
  symbol: string = '09999',
  indicator: string = '盈利预测概览'
): Promise<DataFrame> {
  try {
    const { load } = await import('cheerio');

    const url = 'https://www.etnet.com.hk/www/sc/stocks/realtime/quote_profit.php';
    const params = { code: String(parseInt(symbol)) };

    const text = await httpGetText(url, { params });
    const $ = load(text);

    // Parse all tables on the page
    const tables: string[][][] = [];
    $('table').each((_, table) => {
      const rows: string[][] = [];
      $(table).find('tr').each((_, tr) => {
        const cells: string[] = [];
        $(tr).find('td, th').each((_, cell) => {
          cells.push($(cell).text().trim());
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
      if (rows.length > 0) {
        tables.push(rows);
      }
    });

    if (indicator === '评级总览') {
      // Table index 0 contains rating overview
      if (tables.length < 1) return createDataFrame([], []);
      const firstTable = tables[0];
      if (firstTable.length < 1) return createDataFrame([], []);

      // Parse the rating data from the first row
      const ratingText = firstTable[0].join(' ');
      const parts = ratingText.split(' ').filter(s => s !== '' && s !== '平均评级');
      if (parts.length < 3) return createDataFrame([], []);

      const columns = ['方向', '评级数量', '平均评级'];
      const rows = [parts.slice(0, 3)];
      return createDataFrame(columns, rows);
    }

    if (indicator === '去年度业绩表现') {
      // Table index 2 contains last year performance
      if (tables.length < 3) return createDataFrame([], []);
      const perfTable = tables[2];
      if (perfTable.length < 1) return createDataFrame([], []);

      const columns = ['item', 'value'];
      const rows: any[][] = [];

      // Parse two-column layout
      for (const row of perfTable) {
        if (row.length >= 2) {
          rows.push([row[0], row[1]]);
        }
        if (row.length >= 5) {
          rows.push([row[3], row[4]]);
        }
      }

      return createDataFrame(columns, rows);
    }

    if (indicator === '综合盈利预测') {
      // Table index 3 contains consolidated forecast
      if (tables.length < 4) return createDataFrame([], []);
      const forecastTable = tables[3];
      if (forecastTable.length < 2) return createDataFrame([], []);

      const columns = [
        '财政年度', '纯利/亏损', '每股盈利/每股亏损', '每股派息',
        '每股资产净值', '最高', '最低',
      ];

      const rows: any[][] = [];
      for (let i = 1; i < forecastTable.length; i++) {
        const row = forecastTable[i];
        if (row.length >= 7) {
          rows.push(row.slice(0, 7));
        }
      }

      return createDataFrame(columns, rows);
    }

    if (indicator === '盈利预测概览') {
      // Table index 4 contains forecast overview
      if (tables.length < 5) return createDataFrame([], []);
      const overviewTable = tables[4];
      if (overviewTable.length < 2) return createDataFrame([], []);

      const columns = [
        '财政年度', '纯利/亏损', '每股盈利', '每股派息',
        '证券商', '评级', '目标价', '更新日期',
      ];

      const rows: any[][] = [];
      for (let i = 1; i < overviewTable.length; i++) {
        const row = overviewTable[i];
        // HTML table has 9 cells: [财政年度, 纯利/亏损, 每股盈利, 每股派息, 证券商, 评级, 目标价, <dup>, 更新日期]
        // Python deletes the duplicate 目标价 column, so we skip index 7
        if (row.length >= 9) {
          // Remove the duplicate 目标价 column at index 7
          const cleaned = [...row.slice(0, 7), row[8]];
          // Convert date from DD/MM/YYYY to YYYY-MM-DD
          const dateParts = cleaned[7].split('/');
          if (dateParts.length === 3) {
            cleaned[7] = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
          }
          // Convert numeric values: remove commas
          cleaned[1] = String(cleaned[1]).replace(/,/g, '');
          cleaned[2] = String(cleaned[2]).replace(/,/g, '');
          cleaned[3] = String(cleaned[3]).replace(/,/g, '');
          cleaned[6] = String(cleaned[6]).replace(/,/g, '');
          // Convert 财政年度 to string
          cleaned[0] = String(cleaned[0]);
          rows.push(cleaned);
        }
      }

      return createDataFrame(columns, rows);
    }

    return createDataFrame([], []);
  } catch (error) {
    return createDataFrame([], []);
  }
}
