/**
 * AKShare TypeScript - 英为财情-外汇-货币对
 * 英为财情-外汇-货币对历史数据
 * https://cn.investing.com/currencies/
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { CURRENCY_PAIR_MAP_USD } from './currency_pair_map_usd';

/**
 * 指定货币的所有可获取货币对的数据
 * https://cn.investing.com/currencies/cny-jmd
 * @param symbol 指定货币，如 "美元", "人民币"
 * @returns 指定货币的所有可获取货币对的数据
 */
export async function currency_pair_map(symbol: string = '美元'): Promise<DataFrame> {
  const headers: Record<string, string> = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': 'cn.investing.com',
    'Pragma': 'no-cache',
    'Referer': 'https://cn.investing.com/currencies/single-currency-crosses',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const regionCode: string[] = [];
  const regionName: string[] = [];

  // Collect regions
  for (const regionId of ['4', '1', '8', '7', '6']) {
    const url = 'https://cn.investing.com/currencies/Service/region';
    const params: Record<string, string> = {
      region_ID: regionId,
      currency_ID: 'false',
    };

    try {
      const html = await httpGetText(url, { params, headers });

      // 与 Python 版一致：使用 continentid 与地区名称构建映射
      const regex = /continentid="([^"]+)"[\s\S]*?<i>([^<]+)<\/i>/gi;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(html)) !== null) {
        const continentId = match[1].trim();
        const name = match[2].trim();
        regionCode.push(`${continentId}-${regionId}`);
        regionName.push(name);
      }
    } catch {
      // Skip failed region requests
      continue;
    }
  }

  try {
    // Build name-id map
    const nameIdMap: Record<string, string> = {};
    for (let i = 0; i < regionName.length; i++) {
      nameIdMap[regionName[i]] = regionCode[i];
    }

    const mappingEntry = nameIdMap[symbol];
    if (!mappingEntry) {
      if (symbol === '美元') {
        return createDataFrame(['name', 'code'], CURRENCY_PAIR_MAP_USD);
      }
      return createDataFrame([], []);
    }

    const [continentId, regionId] = mappingEntry.split('-');
    const url = 'https://cn.investing.com/currencies/Service/currency';
    const params: Record<string, string> = {
      region_ID: regionId,
      currency_ID: continentId,
    };

    const html = await httpGetText(url, { params, headers });

    // 与 Python 版一致：提取 a 标签的 href 末段与 title
    const hrefRegex = /<a[^>]*href="([^"]*\/currencies\/[^"]+)"[^>]*title="([^"]+)"[^>]*>/gi;
    const names: string[] = [];
    const codes: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = hrefRegex.exec(html)) !== null) {
      const href = match[1];
      const title = match[2].replace(/\s+/g, '-');
      const code = href.split('/').pop() || '';
      names.push(title);
      codes.push(code);
    }

    const columns = ['name', 'code'];
    const rows: any[][] = [];
    for (let i = 0; i < names.length; i++) {
      rows.push([names[i], codes[i]]);
    }

    if (rows.length === 0 && symbol === '美元') {
      return createDataFrame(columns, CURRENCY_PAIR_MAP_USD);
    }
    return createDataFrame(columns, rows);
  } catch {
    if (symbol === '美元') {
      return createDataFrame(['name', 'code'], CURRENCY_PAIR_MAP_USD);
    }
    return createDataFrame([], []);
  }
}
