/**
 * AKShare TypeScript - 同花顺-板块-概念板块
 * https://q.10jqka.com.cn/thshy/
 */

import * as vm from 'vm';
import * as fs from 'fs';
import * as path from 'path';
import { load } from 'cheerio';
import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取 ths.js 文件路径
 */
function getThsJsPath(): string {
  // Try multiple possible locations
  const candidates = [
    path.join(__dirname, '..', '..', 'akshare', 'akshare', 'data', 'ths.js'),
    path.join(__dirname, '..', '..', '..', 'akshare', 'akshare', 'data', 'ths.js'),
    path.join(process.cwd(), 'akshare', 'akshare', 'data', 'ths.js'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('ths.js not found');
}

/**
 * 执行 ths.js 获取 v_code cookie 值
 */
let cachedVCode: string | null = null;

function getVCode(): string {
  if (cachedVCode) return cachedVCode;
  const jsPath = getThsJsPath();
  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  const sandbox: any = {};
  vm.createContext(sandbox);
  vm.runInContext(jsContent, sandbox);
  const code: string = sandbox.v();
  cachedVCode = code;
  return code;
}

/**
 * 同花顺-板块-概念板块-概念板块一览表
 * http://q.10jqka.com.cn/gn/
 * @returns 概念板块一览表数据
 */
export async function stock_board_concept_name_ths(): Promise<DataFrame> {
  try {
    const vCode = getVCode();
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      'Cookie': `v=${vCode}`,
    };

    // First get concept names from summary pages
    const url = 'http://q.10jqka.com.cn/gn/index/field/addtime/order/desc/page/1/ajax/1/';
    const text = await httpGetText(url, { headers });
    const $ = load(text);
    const pageInfo = $('span.page_info').text();
    const totalPages = parseInt(pageInfo.split('/')[1]) || 1;

    const nameCodeMap: Record<string, string> = {};
    for (let page = 1; page <= totalPages; page++) {
      const pageUrl = `http://q.10jqka.com.cn/gn/index/field/addtime/order/desc/page/${page}/ajax/1/`;
      const pageText = await httpGetText(pageUrl, { headers });
      const pageSoup = load(pageText);
      pageSoup('a').each((_, el) => {
        const href = pageSoup(el).attr('href') || '';
        if (href.includes('detail')) {
          const name = pageSoup(el).text().trim();
          const code = href.split('/').filter(Boolean).pop() || '';
          if (name && code) {
            nameCodeMap[name] = code;
          }
        }
      });
    }

    const columns = ['name', 'code'];
    const rows = Object.entries(nameCodeMap).map(([name, code]) => [name, code]);
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame(['name', 'code'], []);
  }
}

/**
 * 同花顺-板块-概念板块-板块简介
 * http://q.10jqka.com.cn/gn/detail/code/301558/
 * @param symbol 板块名称
 * @returns 板块简介数据
 */
export async function stock_board_concept_info_ths(symbol: string = '阿里巴巴概念'): Promise<DataFrame> {
  try {
    const nameCodeDf = await stock_board_concept_name_ths();
    const codeIndex = nameCodeDf.columns.indexOf('code');
    const nameIndex = nameCodeDf.columns.indexOf('name');
    const matchRow = nameCodeDf.data.find(row => row[nameIndex] === symbol);
    if (!matchRow) return createDataFrame(['项目', '值'], []);
    const symbolCode = matchRow[codeIndex];

    const url = `http://q.10jqka.com.cn/gn/detail/code/${symbolCode}/`;
    const text = await httpGetText(url);
    const $ = load(text);

    const nameList: string[] = [];
    const valueList: string[] = [];
    $('div.board-infos dt').each((_, el) => {
      nameList.push($(el).text().trim());
    });
    $('div.board-infos dd').each((_, el) => {
      valueList.push($(el).text().trim().replace(/\n/g, '/'));
    });

    const columns = ['项目', '值'];
    const rows = nameList.map((name, i) => [name, valueList[i] || '']);
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame(['项目', '值'], []);
  }
}

/**
 * 同花顺-板块-概念板块-指数数据
 * https://q.10jqka.com.cn/gn/detail/code/301558/
 * @param symbol 概念板块名称
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @returns 指数数据
 */
export async function stock_board_concept_index_ths(
  symbol: string = '阿里巴巴概念',
  start_date: string = '20200101',
  end_date: string = '20250228'
): Promise<DataFrame> {
  try {
    const vCode = getVCode();
    const nameCodeDf = await stock_board_concept_name_ths();
    const codeIndex = nameCodeDf.columns.indexOf('code');
    const nameIndex = nameCodeDf.columns.indexOf('name');
    const matchRow = nameCodeDf.data.find(row => row[nameIndex] === symbol);
    if (!matchRow) return createDataFrame(['日期', '开盘价', '最高价', '最低价', '收盘价', '成交量', '成交额'], []);
    const symbolCode = matchRow[codeIndex];

    const detailUrl = `https://q.10jqka.com.cn/gn/detail/code/${symbolCode}`;
    const detailText = await httpGetText(detailUrl);
    const $ = load(detailText);
    const innerCode = $('input#clid').attr('value');
    if (!innerCode) return createDataFrame(['日期', '开盘价', '最高价', '最低价', '收盘价', '成交量', '成交额'], []);

    const currentYear = new Date().getFullYear();
    const beginYear = parseInt(start_date.substring(0, 4));
    const allRows: string[][] = [];

    for (let year = beginYear; year <= currentYear; year++) {
      const dataUrl = `https://d.10jqka.com.cn/v4/line/bk_${innerCode}/01/${year}.js`;
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
        'Referer': 'http://q.10jqka.com.cn',
        'Host': 'd.10jqka.com.cn',
        'Cookie': `v=${vCode}`,
      };
      try {
        const dataText = await httpGetText(dataUrl, { headers });
        const jsonStart = dataText.indexOf('{');
        if (jsonStart === -1) continue;
        const jsonStr = dataText.substring(jsonStart, dataText.length - 1);
        const parsed = JSON.parse(jsonStr);
        if (!parsed.data) continue;
        const entries = parsed.data.split(';');
        for (const entry of entries) {
          const fields = entry.split(',');
          if (fields.length >= 7) {
            allRows.push(fields);
          }
        }
      } catch {
        continue;
      }
    }

    const columns = ['日期', '开盘价', '最高价', '最低价', '收盘价', '成交量', '成交额'];
    const filteredRows = allRows.filter(row => {
      const dateStr = row[0];
      return dateStr >= start_date && dateStr <= end_date;
    });

    return createDataFrame(columns, filteredRows);
  } catch {
    return createDataFrame(['日期', '开盘价', '最高价', '最低价', '收盘价', '成交量', '成交额'], []);
  }
}

/**
 * 同花顺-数据中心-概念板块-概念时间表
 * https://q.10jqka.com.cn/gn/
 * @returns 概念时间表数据
 */
export async function stock_board_concept_summary_ths(): Promise<DataFrame> {
  try {
    const vCode = getVCode();
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      'Cookie': `v=${vCode}`,
    };

    const url = 'http://q.10jqka.com.cn/gn/index/field/addtime/order/desc/page/1/ajax/1/';
    const text = await httpGetText(url, { headers });
    const $ = load(text);
    const pageInfo = $('span.page_info').text();
    const totalPages = parseInt(pageInfo.split('/')[1]) || 1;

    const columns = ['日期', '概念名称', '驱动事件', '龙头股', '成分股数量'];
    const allRows: string[][] = [];

    for (let page = 1; page <= totalPages; page++) {
      const pageUrl = `http://q.10jqka.com.cn/gn/index/field/addtime/order/desc/page/${page}/ajax/1/`;
      try {
        const pageText = await httpGetText(pageUrl, { headers });
        const pageSoup = load(pageText);

        // Parse the HTML table
        pageSoup('table tbody tr').each((_, tr) => {
          const cells: string[] = [];
          pageSoup(tr).find('td').each((__, td) => {
            cells.push(pageSoup(td).text().trim());
          });
          if (cells.length >= 5) {
            allRows.push([
              cells[0], // 日期
              cells[1], // 概念名称
              cells[2], // 驱动事件
              cells[3], // 龙头股
              cells[4], // 成分股数量
            ]);
          }
        });
      } catch {
        break;
      }
    }

    return createDataFrame(columns, allRows);
  } catch {
    return createDataFrame(['日期', '概念名称', '驱动事件', '龙头股', '成分股数量'], []);
  }
}
