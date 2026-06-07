/**
 * AKShare TypeScript - 雪球-行情中心-沪深股市-内部交易
 * https://xueqiu.com/hq/insider
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 雪球-行情中心-沪深股市-内部交易
 * https://xueqiu.com/hq/insider
 * @returns 内部交易数据
 */
export async function stock_inner_trade_xq(): Promise<DataFrame> {
  const url = 'https://xueqiu.com/service/v5/stock/f10/cn/skholderchg';
  const params = {
    size: '100000',
    page: '1',
    extend: 'true',
  };

  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': 'xueqiu.com',
    'Pragma': 'no-cache',
    'Referer': 'https://xueqiu.com/hq',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.data?.items || data.data.items.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '股票代码', '股票名称', '变动日期', '变动人',
    '变动股数', '成交均价', '变动后持股数',
    '与董监高关系', '董监高职务',
  ];

  const rows = data.data.items.map((item: any) => {
    const changeDate = item[4]
      ? new Date(item[4]).toISOString().split('T')[0]
      : null;
    return [
      item[0],
      item[1],
      changeDate,
      item[2],
      item[5],
      item[6],
      item[7],
      item[8],
      item[9],
    ];
  });

  return createDataFrame(columns, rows);
}
