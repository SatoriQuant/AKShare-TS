/**
 * AKShare TypeScript - 基金评级数据接口
 * 天天基金网-基金评级
 * https://fund.eastmoney.com/data/fundrating.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 从 HTML script 中解析基金评级数据
 */
function parseRatingScriptData(html: string, varIndex: number): string[][] {
  // 提取 script 中的 var 变量
  const scriptRegex = /<div[^>]*id="fundinfo"[^>]*>[\s\S]*?<script[^>]*>([\s\S]*?)<\/script>/i;
  const scriptMatch = html.match(scriptRegex);
  if (!scriptMatch) return [];

  const scriptContent = scriptMatch[1];

  // 按 var 分割
  const varParts = scriptContent.split('var');
  if (varParts.length <= varIndex) return [];

  const varContent = varParts[varIndex];
  const eqIndex = varContent.indexOf('=');
  if (eqIndex === -1) return [];

  const dataStr = varContent
    .slice(eqIndex + 1)
    .trim()
    .replace(/;$/, '')
    .replace(/^"/, '')
    .replace(/"$/, '')
    .replace(/^\|/, '')
    .replace(/\|$/, '');

  // 按 |_ 分割每条记录
  const records = dataStr.split('|_');
  return records.map(record => record.split('|'));
}

/**
 * 获取基金评级总汇 - 东方财富
 * https://fund.eastmoney.com/data/fundrating.html
 */
export async function fund_rating_all(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/data/fundrating.html';

  try {
    const html = await httpGetText(url);
    const dataContent = parseRatingScriptData(html, 6);

    if (dataContent.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '简称', '基金经理', '基金公司', '5星评级家数',
      '上海证券', '招商证券', '济安金信', '晨星评级', '手续费', '类型',
    ];

    const rows = dataContent.map(item => [
      item[0] || '',
      item[1] || '',
      item[3] || '',
      item[5] || '',
      parseFloat(item[7]) || null,
      parseFloat(item[11]) || null,
      parseFloat(item[9]) || null,
      parseFloat(item[15]) || null,
      parseFloat(item[13]) || null,
      parseFloat(String(item[17] || '').replace('%', '')) / 100 || null,
      item[2] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取上海证券评级 - 东方财富
 * https://fund.eastmoney.com/data/fundrating_3.html
 *
 * @param date 查询日期，格式 YYYYMMDD
 */
export async function fund_rating_sh(
  date: string = '20230630'
): Promise<DataFrame> {
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  const url = `https://fund.eastmoney.com/data/fundrating_3_${dateFormatted}.html`;

  try {
    const html = await httpGetText(url);
    const dataContent = parseRatingScriptData(html, 1);

    if (dataContent.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '简称', '基金经理', '基金公司',
      '3年期评级-3年评级', '3年期评级-较上期',
      '5年期评级-5年评级', '5年期评级-较上期',
      '单位净值', '日期', '日增长率',
      '近1年涨幅', '近3年涨幅', '近5年涨幅',
      '手续费', '类型',
    ];

    const rows = dataContent.map(item => [
      item[0] || '',
      item[1] || '',
      item[3] || '',
      item[5] || '',
      parseFloat(item[7]) || null,
      parseFloat(item[8]) || null,
      parseFloat(item[9]) || null,
      parseFloat(item[10]) || null,
      parseFloat(item[11]) || null,
      item[12] || '',
      parseFloat(item[13]) || null,
      parseFloat(item[14]) || null,
      parseFloat(item[15]) || null,
      parseFloat(item[16]) || null,
      parseFloat(String(item[17] || '').replace('%', '')) / 100 || null,
      item[2] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取招商证券评级 - 东方财富
 * https://fund.eastmoney.com/data/fundrating_2.html
 *
 * @param date 查询日期，格式 YYYYMMDD
 */
export async function fund_rating_zs(
  date: string = '20230331'
): Promise<DataFrame> {
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  const url = `https://fund.eastmoney.com/data/fundrating_2_${dateFormatted}.html`;

  try {
    const html = await httpGetText(url);
    const dataContent = parseRatingScriptData(html, 1);

    if (dataContent.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '简称', '基金经理', '基金公司',
      '3年期评级-3年评级', '3年期评级-较上期',
      '单位净值', '日期', '日增长率',
      '近1年涨幅', '近3年涨幅', '近5年涨幅',
      '手续费',
    ];

    const rows = dataContent.map(item => [
      item[0] || '',
      item[1] || '',
      item[3] || '',
      item[5] || '',
      parseFloat(item[7]) || null,
      parseFloat(item[8]) || null,
      parseFloat(item[9]) || null,
      item[10] || '',
      parseFloat(item[11]) || null,
      parseFloat(item[12]) || null,
      parseFloat(item[13]) || null,
      parseFloat(item[14]) || null,
      parseFloat(String(item[15] || '').replace('%', '')) / 100 || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取济安金信评级 - 东方财富
 * https://fund.eastmoney.com/data/fundrating_4.html
 *
 * @param date 查询日期，格式 YYYYMMDD
 */
export async function fund_rating_ja(
  date: string = '20230331'
): Promise<DataFrame> {
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  const url = `https://fund.eastmoney.com/data/fundrating_4_${dateFormatted}.html`;

  try {
    const html = await httpGetText(url);
    const dataContent = parseRatingScriptData(html, 1);

    if (dataContent.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '简称', '基金经理', '基金公司',
      '3年期评级-3年评级', '3年期评级-较上期',
      '单位净值', '日期', '日增长率',
      '近1年涨幅', '近3年涨幅', '近5年涨幅',
      '手续费', '类型',
    ];

    const rows = dataContent.map(item => [
      item[0] || '',
      item[1] || '',
      item[3] || '',
      item[5] || '',
      parseFloat(item[7]) || null,
      parseFloat(item[8]) || null,
      parseFloat(item[9]) || null,
      item[10] || '',
      parseFloat(item[11]) || null,
      parseFloat(item[12]) || null,
      parseFloat(item[13]) || null,
      parseFloat(item[14]) || null,
      parseFloat(String(item[15] || '').replace('%', '')) / 100 || null,
      item[2] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
