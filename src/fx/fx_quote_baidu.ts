/**
 * AKShare TypeScript - 百度股市通外汇行情
 * 百度股市通-外汇-行情榜单
 * https://finance.baidu.com/top/foreign-rmb
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  concat,
  DataFrame,
} from '../utils/dataframe';

/**
 * 百度股市通-外汇-行情榜单
 * https://finance.baidu.com/top/foreign-rmb
 * @param symbol 选择 {"人民币", "美元"}，默认 "人民币"
 * @param token 目标网站复制 acs-token 后传入
 * @returns 外汇行情数据
 */
export async function fx_quote_baidu(
  symbol: '人民币' | '美元' = '人民币',
  token: string = ''
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '人民币': 'rmb',
    '美元': 'dollar',
  };

  const url = 'https://finance.pae.baidu.com/api/getforeignrank';
  const headers: Record<string, string> = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Origin': 'https://finance.baidu.com',
    'Referer': 'https://finance.baidu.com/',
    'acs-token': token,
  };

  const columns = ['代码', '名称', '最新价', '涨跌额', '涨跌幅'];
  const allDataFrames: DataFrame[] = [];
  let pn = 0;

  while (true) {
    const params: Record<string, string> = {
      type: symbolMap[symbol],
      pn: String(pn),
      rn: '20',
      finClientType: 'pc',
    };

    try {
      const data = await httpGet<any>(url, { params, headers, timeout: 10000 });

      if (data?.ResultCode !== '0') {
        break;
      }

      const result = data?.Result;
      if (!result || result.length === 0) {
        break;
      }

      // result is an array of objects containing { code, name, list: [...] }
      // Each item in result has a "list" property with key-value pairs
      const rows: any[][] = [];
      let itemsProcessed = 0;

      for (const item of result) {
        if (!item.list) continue;

        // list is an array of { key, value } objects
        const listItems = item.list as Array<{ key: string; value: string }>;
        // Extract values from the list items (skip the first item which is the header)
        const values = listItems.slice(1).map((li: { key: string; value: string }) => li.value);

        if (values.length >= 3) {
          const latestPrice = Number(values[0]);
          const changeAmount = Number(values[1]);
          let changePercent: number;
          // Remove '%' and convert to decimal
          if (typeof values[2] === 'string') {
            changePercent = Number(values[2].replace('%', '')) / 100;
          } else {
            changePercent = Number(values[2]) / 100;
          }

          rows.push([
            item.code,
            item.name,
            latestPrice,
            changeAmount,
            changePercent,
          ]);
        }
        itemsProcessed++;
      }

      if (rows.length > 0) {
        allDataFrames.push(createDataFrame(columns, rows));
      }

      // If this page returned fewer than 20 items, it's the last page
      if (itemsProcessed < 20) {
        break;
      }

      pn += 20;
    } catch {
      break;
    }
  }

  if (allDataFrames.length === 0) {
    return createDataFrame(columns, []);
  }

  return concat(allDataFrames);
}
