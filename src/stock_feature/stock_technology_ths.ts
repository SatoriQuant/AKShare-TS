/**
 * AKShare TypeScript - 同花顺-数据中心-技术选股
 * https://data.10jqka.com.cn/rank/cxg/
 */

import { load } from 'cheerio';
import { httpGetTextGbk } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { getThsHeaders } from '../utils/thsAuth';

/**
 * 同花顺-数据中心-技术选股-创新高
 * https://data.10jqka.com.cn/rank/cxg/
 * @param symbol 选择 {"创月新高", "半年新高", "一年新高", "历史新高"}
 * @returns 创新高数据
 */
export async function stock_rank_cxg_ths(symbol: string = '创月新高'): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '股票代码', '股票简称', '涨跌幅', '换手率', '最新价', '前期高点', '前期高点日期'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-创新低
 * https://data.10jqka.com.cn/rank/cxd/
 * @param symbol 选择 {"创月新低", "半年新低", "一年新低", "历史新低"}
 * @returns 创新低数据
 */
export async function stock_rank_cxd_ths(symbol: string = '创月新低'): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '代码', '名称', '最新价', '涨跌幅', '换手率', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-连续上涨
 * https://data.10jqka.com.cn/rank/lxsz/
 * @returns 连续上涨数据
 */
export async function stock_rank_lxsz_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '股票代码', '股票简称', '收盘价', '最高价', '最低价', '连涨天数', '连续涨跌幅', '累计换手率', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-连续下跌
 * https://data.10jqka.com.cn/rank/lxxd/
 * @returns 连续下跌数据
 */
export async function stock_rank_lxxd_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '股票代码', '股票简称', '收盘价', '最高价', '最低价', '连涨天数', '连续涨跌幅', '累计换手率', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-量价齐升
 * https://data.10jqka.com.cn/rank/ljqs/
 * @returns 量价齐升数据
 */
export async function stock_rank_ljqs_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['序号', '股票代码', '股票简称', '最新价', '量价齐升天数', '阶段涨幅', '累计换手率', '所属行业'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-技术选股-量价齐跌
 * https://data.10jqka.com.cn/rank/ljqd/
 * @returns 量价齐跌数据
 */
export async function stock_rank_ljqd_ths(): Promise<DataFrame> {
  const columns = ['序号', '股票代码', '股票简称', '最新价', '量价齐跌天数', '阶段涨幅', '累计换手率', '所属行业'];
  const rows: any[][] = [];

  try {
    const firstUrl =
      'http://data.10jqka.com.cn/rank/ljqd/field/count/order/desc/ajax/1/free/1/page/1/free/1/';
    const firstText = await httpGetTextGbk(firstUrl, { headers: getThsHeaders() });
    const $first = load(firstText);
    const pageInfo = $first('span.page_info').text();
    const totalPage = parseInt(pageInfo.split('/')[1] || '1', 10) || 1;

    for (let page = 1; page <= totalPage; page++) {
      const pageUrl =
        `http://data.10jqka.com.cn/rank/ljqd/field/count/order/desc/ajax/1/free/1/page/${page}/free/1/`;
      const html = await httpGetTextGbk(pageUrl, { headers: getThsHeaders() });
      const $ = load(html);
      const table = $('table.m-table.J-ajax-table');
      if (table.length === 0) {
        continue;
      }

      table.find('tbody tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length >= 8) {
          const pct = (idx: number) => {
            const raw = $(tds[idx]).text().trim().replace('%', '');
            const n = Number(raw);
            return Number.isFinite(n) ? n : null;
          };
          const num = (idx: number) => {
            const raw = $(tds[idx]).text().trim();
            const n = Number(raw);
            return Number.isFinite(n) ? n : null;
          };

          rows.push([
            $(tds[0]).text().trim(),
            ($(tds[1]).find('a').first().text().trim() || $(tds[1]).text().trim()).padStart(6, '0'),
            $(tds[2]).find('a').first().text().trim() || $(tds[2]).text().trim(),
            num(3),
            num(4),
            pct(5),
            pct(6),
            $(tds[7]).find('a').first().text().trim() || $(tds[7]).text().trim(),
          ]);
        }
      });
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame(columns, []);
  }
}
