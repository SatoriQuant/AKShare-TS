/**
 * AKShare TypeScript - 奇货可查-工具数据接口（网站版）
 *
 * 对应 Python akshare/qhkc_web/qhkc_tool.py
 * 奇货可查网站: https://qhkch.com
 *
 * 注：期货价格为收盘价; 现货价格来自网络;
 * 基差=现货价格-期货价格; 基差率=(现货价格-期货价格)/现货价格 * 100%
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// ============ API URL 常量 ============

/** 奇货可查-外盘比价 URL */
const QHKC_TOOL_FOREIGN_URL = 'https://qhkch.com/ajax/toolbox_foreign.php';

/** 奇货可查-各地区经济数据 URL */
const QHKC_TOOL_GDP_URL = 'https://qhkch.com/dist/views/toolbox/gdp.html?v=1.10.7.1';

// ============ 工具数据函数 ============

/**
 * 奇货可查-工具-外盘比价
 *
 * 实时更新数据，暂不能查询历史数据
 *
 * @returns 外盘比价 DataFrame
 *
 * @example
 * ```ts
 * const df = await qhkc_tool_foreign();
 * // columns: name, base_time, base_price, latest_price, rate
 * // 示例数据:
 * // 伦敦铜  10/08 01:00  5704    5746.5  0.745
 * // 伦敦锌  10/08 01:00  2291.25 2305.75 0.633
 * ```
 */
export async function qhkc_tool_foreign(): Promise<DataFrame> {
  const payloadId = { page: 1, limit: 10 };

  const dataJson = await httpPost<any>(QHKC_TOOL_FOREIGN_URL, payloadId);

  const columns = ['name', 'base_time', 'base_price', 'latest_price', 'rate'];
  const data = dataJson.data.map((item: any) => [
    item.name,
    item.base_time,
    item.base_price,
    item.latest_price,
    item.rate,
  ]);

  return createDataFrame(columns, data);
}

/**
 * 奇货可查-工具-龙虎星云图
 *
 * @returns 龙虎星云图数据 DataFrame（与外盘比价格式相同）
 */
export async function qhkc_tool_nebula(): Promise<DataFrame> {
  const payloadId = { page: 1, limit: 10 };

  const dataJson = await httpPost<any>(QHKC_TOOL_FOREIGN_URL, payloadId);

  const columns = ['name', 'base_time', 'base_price', 'latest_price', 'rate'];
  const data = dataJson.data.map((item: any) => [
    item.name,
    item.base_time,
    item.base_price,
    item.latest_price,
    item.rate,
  ]);

  return createDataFrame(columns, data);
}

/**
 * 奇货可查-工具-各地区经济数据
 *
 * 实时更新数据，暂不能查询历史数据
 *
 * @returns 各地区经济数据 DataFrame
 *
 * @example
 * ```ts
 * const df = await qhkc_tool_gdp();
 * // columns: 国家, 国内生产总值, 国内生产总值YoY, 国内生产总值QoQ, ...
 * ```
 *
 * 注意: 此接口从 HTML 页面解析数据，需要页面返回结构化表格数据。
 * 由于 TypeScript 环境中没有 pd.read_html，此函数通过 HTTP 获取 HTML
 * 并使用正则表达式解析表格数据。
 */
export async function qhkc_tool_gdp(): Promise<DataFrame> {
  // 此接口返回 HTML 页面，需要解析表格
  // 在 TypeScript 中，我们使用 HTTP GET 获取 HTML 内容
  // 然后解析其中的表格数据

  const { httpGetText } = await import('../utils/httpClient');

  try {
    const html = await httpGetText(QHKC_TOOL_GDP_URL);

    // 使用正则表达式解析 HTML 表格
    // 匹配 <table> 标签内的内容
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      throw new Error('未找到表格数据');
    }

    const tableHtml = tableMatch[1];

    // 解析表头
    const headerMatch = tableHtml.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
    const headers: string[] = [];
    if (headerMatch) {
      const thMatches = headerMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
      if (thMatches) {
        for (const th of thMatches) {
          const content = th.replace(/<[^>]+>/g, '').trim();
          headers.push(content);
        }
      }
    }

    // 解析数据行
    const bodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    const rows: any[][] = [];
    if (bodyMatch) {
      const trMatches = bodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (trMatches) {
        for (const tr of trMatches) {
          const tdMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
          if (tdMatches) {
            const row = tdMatches.map(td => {
              const content = td.replace(/<[^>]+>/g, '').trim();
              // 尝试转换为数字
              const num = parseFloat(content);
              return isNaN(num) ? content : num;
            });
            rows.push(row);
          }
        }
      }
    }

    // 如果第一列是国家名称，修正列名
    if (headers.length > 0 && headers[0] !== '国家') {
      headers[0] = '国家';
    }

    return createDataFrame(headers, rows);
  } catch (error: any) {
    throw new Error(`获取 GDP 数据失败: ${error.message}`);
  }
}
