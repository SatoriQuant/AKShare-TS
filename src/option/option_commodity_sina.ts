/**
 * AKShare TypeScript - 新浪财经-商品期权
 * https://stock.finance.sina.com.cn/futures/view/optionsDP.php
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// 商品期权品种与交易所的映射
const COMMODITY_EXCHANGE_MAP: Record<string, { product: string; exchange: string }> = {
  '豆粕期权': { product: 'm_o', exchange: 'dce' },
  '玉米期权': { product: 'c_o', exchange: 'dce' },
  '铁矿石期权': { product: 'i_o', exchange: 'dce' },
  '棉花期权': { product: 'CF', exchange: 'czce' },
  '白糖期权': { product: 'SR', exchange: 'czce' },
  'PTA期权': { product: 'TA', exchange: 'czce' },
  '甲醇期权': { product: 'MA', exchange: 'czce' },
  '橡胶期权': { product: 'ru', exchange: 'shfe' },
  '沪铜期权': { product: 'cu', exchange: 'shfe' },
  '黄金期权': { product: 'au', exchange: 'shfe' },
  '菜籽粕期权': { product: 'RM', exchange: 'czce' },
  '液化石油气期权': { product: 'pg_o', exchange: 'dce' },
  '动力煤期权': { product: 'ZC', exchange: 'czce' },
  '菜籽油期权': { product: 'OI', exchange: 'czce' },
  '花生期权': { product: 'PK', exchange: 'czce' },
};

/**
 * 当前可以查询的期权品种的合约日期
 * @param symbol 期权品种名称
 * @returns 合约列表
 */
export async function option_commodity_contract_sina(
  symbol: string = '玉米期权'
): Promise<DataFrame> {
  // 由于需要解析HTML获取合约列表，这里简化处理
  // 实际实现可能需要HTML解析库
  console.warn('此函数需要HTML解析支持，返回示例数据结构');

  const columns = ['序号', '合约'];
  return createDataFrame(columns, []);
}

/**
 * 当前所有期权合约, 包括看涨期权合约和看跌期权合约
 * @param symbol 期权品种名称
 * @param contract 合约代码，如 'au2204'
 * @returns 合约实时行情
 */
export async function option_commodity_contract_table_sina(
  symbol: string = '黄金期权',
  contract: string = 'au2204'
): Promise<DataFrame> {
  const exchangeInfo = COMMODITY_EXCHANGE_MAP[symbol];
  if (!exchangeInfo) {
    return createDataFrame([], []);
  }

  const url = 'https://stock.finance.sina.com.cn/futures/api/openapi.php/OptionService.getOptionData';
  const params = {
    type: 'futures',
    product: exchangeInfo.product,
    exchange: exchangeInfo.exchange,
    pinzhong: contract,
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const upData = data.result.data.up || [];
    const downData = data.result.data.down || [];

    const columns = [
      '看涨合约-买量', '看涨合约-买价', '看涨合约-最新价', '看涨合约-卖价',
      '看涨合约-卖量', '看涨合约-持仓量', '看涨合约-涨跌', '行权价',
      '看涨合约-看涨期权合约', '看跌合约-买量', '看跌合约-买价', '看跌合约-最新价',
      '看跌合约-卖价', '看跌合约-卖量', '看跌合约-持仓量', '看跌合约-涨跌',
      '看跌合约-看跌期权合约'
    ];

    const rows: any[][] = [];
    const maxLen = Math.max(upData.length, downData.length);

    for (let i = 0; i < maxLen; i++) {
      const upRow = upData[i] || [];
      const downRow = downData[i] || [];

      rows.push([
        parseFloat(upRow[0]) || null,
        parseFloat(upRow[1]) || null,
        parseFloat(upRow[2]) || null,
        parseFloat(upRow[3]) || null,
        parseFloat(upRow[4]) || null,
        parseFloat(upRow[5]) || null,
        parseFloat(upRow[6]) || null,
        parseFloat(upRow[7]) || null,
        upRow[8] || null,
        parseFloat(downRow[0]) || null,
        parseFloat(downRow[1]) || null,
        parseFloat(downRow[2]) || null,
        parseFloat(downRow[3]) || null,
        parseFloat(downRow[4]) || null,
        parseFloat(downRow[5]) || null,
        parseFloat(downRow[6]) || null,
        downRow[7] || null,
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 合约历史行情-日频
 * @param symbol 合约代码，如 'au2012C392'
 * @returns 合约历史行情-日频
 */
export async function option_commodity_hist_sina(
  symbol: string = 'au2012C392'
): Promise<DataFrame> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const url = `https://stock.finance.sina.com.cn/futures/api/jsonp.php/var%20_m2009C30002020_7_17=/FutureOptionAllService.getOptionDayline`;
  const params = { symbol };

  try {
    const text = await httpGetText(url, { params });
    const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
    const data = JSON.parse(jsonStr);

    if (!data || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['date', 'open', 'high', 'low', 'close', 'volume'];
    const rows = data.map((item: any[]) => [
      item[5],
      parseFloat(item[0]) || null,
      parseFloat(item[1]) || null,
      parseFloat(item[2]) || null,
      parseFloat(item[3]) || null,
      parseInt(item[4]) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
