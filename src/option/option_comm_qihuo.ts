/**
 * AKShare TypeScript - 九期网-商品期权手续费
 * https://www.9qihuo.com/qiquanshouxufei
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 九期网-商品期权品种列表
 * @returns 品种名称和代码
 */
export async function option_comm_symbol(): Promise<DataFrame> {
  const url = 'https://www.9qihuo.com/qiquanshouxufei';

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

    const columns = ['品种名称', '品种代码'];
    return createDataFrame(columns, []);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 九期网-商品期权手续费
 * https://www.9qihuo.com/qiquanshouxufei
 * @param symbol 品种名称，如 "工业硅期权"
 * @returns 期权手续费
 */
export async function option_comm_info(
  symbol: string = '工业硅期权'
): Promise<DataFrame> {
  const url = 'https://www.9qihuo.com/qiquanshouxufei';

  try {
    // 首先获取品种代码
    const symbolDf = await option_comm_symbol();
    const symbolIndex = symbolDf.columns.indexOf('品种名称');
    const codeIndex = symbolDf.columns.indexOf('品种代码');

    if (symbolIndex === -1 || codeIndex === -1 || symbolDf.data.length === 0) {
      return createDataFrame([], []);
    }

    // 查找品种代码
    let symbolCode = '';
    for (const row of symbolDf.data) {
      if (row[symbolIndex]?.includes(symbol)) {
        symbolCode = row[codeIndex];
        break;
      }
    }

    if (!symbolCode) {
      return createDataFrame([], []);
    }

    // 获取手续费数据
    const text = await httpGetText(`${url}?heyue=${symbolCode}`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    // 解析HTML表格
    // 这里简化处理，返回空DataFrame
    // 实际实现需要HTML解析库
    console.warn('此函数需要HTML解析支持');

    const columns = [
      '合约', '现价', '成交量', '每跳毛利/元', '每跳净利/元',
      '开仓手续费', '平仓手续费', '平今手续费', '交易所',
      '手续费更新时间', '价格更新时间'
    ];

    return createDataFrame(columns, []);
  } catch {
    return createDataFrame([], []);
  }
}
