/**
 * AKShare TypeScript - 唯爱期货-期权保证金
 * https://www.iweiai.com/qihuo/yuanyou
 */

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

    // 解析HTML获取品种列表
    // 这里简化处理，返回空DataFrame
    // 实际实现需要HTML解析库
    console.warn('此函数需要HTML解析支持');

    const columns = ['symbol', 'url'];
    return createDataFrame(columns, []);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取商品期权保证金
 * @param symbol 商品期权品种名称，如 "原油期权"
 * @returns 商品期权保证金
 */
export async function option_margin(
  symbol: string = '原油期权'
): Promise<DataFrame> {
  try {
    // 首先获取品种URL
    const symbolDf = await option_margin_symbol();
    const symbolIndex = symbolDf.columns.indexOf('symbol');
    const urlIndex = symbolDf.columns.indexOf('url');

    if (symbolIndex === -1 || urlIndex === -1 || symbolDf.data.length === 0) {
      return createDataFrame([], []);
    }

    // 查找品种URL
    let targetUrl = '';
    for (const row of symbolDf.data) {
      if (row[symbolIndex] === symbol) {
        targetUrl = row[urlIndex];
        break;
      }
    }

    if (!targetUrl) {
      return createDataFrame([], []);
    }

    // 获取保证金数据
    const text = await httpGetText(targetUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    // 解析HTML表格
    // 这里简化处理，返回空DataFrame
    // 实际实现需要HTML解析库
    console.warn('此函数需要HTML解析支持');

    const columns = [
      '合约', '结算价', '交易乘数', '买方权利金', '卖方保证金',
      '开仓手续费', '平今手续费', '平昨手续费', '手续费(开+平今)', '更新时间'
    ];

    return createDataFrame(columns, []);
  } catch {
    return createDataFrame([], []);
  }
}
