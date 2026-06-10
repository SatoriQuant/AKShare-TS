/**
 * AKShare TypeScript - 唯爱期货-期权保证金
 * https://www.iweiai.com/qihuo/yuanyou
 */

import { load } from 'cheerio';
import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取商品期权品种代码和名称
 * @returns 商品期权品种代码和名称
 */
export async function option_margin_symbol(): Promise<DataFrame> {
  const url = 'https://www.iweiai.com/qiquan/yuanyou';

  try {
    const text = await httpGetText(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const $ = load(text);
    const columns = ['symbol', 'url'];
    const rows: any[][] = [];

    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const name = $(el).text().trim();
      if (href.includes('/qiquan/') && name) {
        const fullUrl = href.startsWith('http') ? href : `https://www.iweiai.com${href}`;
        rows.push([name, fullUrl]);
      }
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取商品期权保证金
 * Python columns: 合约, 结算价, 交易乘数, 买方权利金, 卖方保证金, 开仓手续费, 平今手续费, 平昨手续费, 手续费(开+平今), 更新时间
 * @param symbol 商品期权品种名称，如 "原油期权"
 * @returns 商品期权保证金
 */
export async function option_margin(
  symbol: string = '原油期权'
): Promise<DataFrame> {
  try {
    // First get the symbol list to find the target URL
    const symbolDf = await option_margin_symbol();
    const symbolIdx = symbolDf.columns.indexOf('symbol');
    const urlIdx = symbolDf.columns.indexOf('url');

    if (symbolIdx === -1 || urlIdx === -1 || symbolDf.data.length === 0) {
      // Fallback: construct URL directly
      const symbolMap: Record<string, string> = {
        '原油期权': 'yuanyou',
        '铜期权': 'tong',
        '天然橡胶期权': 'tianranxiangjiao',
        '黄金期权': 'huangjin',
        '豆粕期权': 'doupo',
        '玉米期权': 'yumi',
        '铁矿石期权': 'tiekuangshi',
        '棉花期权': 'mianhua',
        '白糖期权': 'baitang',
        'PTA期权': 'pta',
        '甲醇期权': 'jiachun',
        '菜籽粕期权': 'caizipo',
        '动力煤期权': 'donglimei',
        'LPG期权': 'lpg',
        '聚丙烯期权': 'jubingxi',
        'PVC期权': 'pvc',
        '线型低密度聚乙烯期权': 'lldpe',
      };
      const pathKey = symbolMap[symbol] || symbol.replace('期权', '');
      const fallbackUrl = `https://www.iweiai.com/qiquan/${pathKey}`;
      return await parseOptionMarginPage(fallbackUrl);
    }

    // Find the target URL
    let targetUrl = '';
    for (const row of symbolDf.data) {
      if (row[symbolIdx] === symbol) {
        targetUrl = row[urlIdx];
        break;
      }
    }

    if (!targetUrl) {
      return createDataFrame([], []);
    }

    return await parseOptionMarginPage(targetUrl);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * Parse option margin data from an iweiai.com page
 */
async function parseOptionMarginPage(url: string): Promise<DataFrame> {
  const text = await httpGetText(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  const $ = load(text);

  // Extract update time from <small> tag
  const smallText = $('small').first().text().trim();
  const updatedTime = smallText.replace(/^最近更新[：:]\s*/, '');

  const columns = [
    '合约标的', '合约代码', '结算价', '交易乘数', '买方权利金', '卖方保证金',
    '手续费单位', '开仓手续费', '平今手续费', '平昨手续费', '手续费(开+平今)', '更新时间',
  ];

  const rows: any[][] = [];

  // Find the main data table
  $('table').first().find('tr').each((rowIdx, row) => {
    if (rowIdx === 0) return; // skip header

    const cells: string[] = [];
    $(row).find('td').each((__, cell) => {
      cells.push($(cell).text().trim());
    });

    if (cells.length >= 11) {
      rows.push([
        cells[0], cells[1], cells[2], cells[3], cells[4], cells[5],
        cells[6], cells[7], cells[8], cells[9], cells[10],
        updatedTime,
      ]);
    }
  });

  return createDataFrame(columns, rows);
}
