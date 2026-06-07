/**
 * AKShare TypeScript - 国证指数数据接口
 * https://www.cnindex.com.cn/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 国证指数-最近交易日的所有指数
 * https://www.cnindex.com.cn/zh_indices/sese/index.html?act_menu=1&index_type=-1
 */
export async function index_all_cni(): Promise<DataFrame> {
  const url = 'https://www.cnindex.com.cn/index/indexList';
  const params = {
    channelCode: '-1',
    rows: '2000',
    pageNum: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.rows) {
    return createDataFrame([], []);
  }

  const columns = [
    '指数代码', '指数简称', '样本数', '收盘点位', '涨跌幅',
    'PE滚动', '成交量', '成交额', '总市值', '自由流通市值',
  ];

  const rows = data.data.rows.map((item: any) => [
    item[2],                // 指数代码
    item[8],                // 指数简称
    item[12],               // 样本数
    item[13],               // 收盘点位
    item[14],               // 涨跌幅
    item[16],               // PE滚动
    (item[18] ?? 0) / 100000,    // 成交量 (万)
    (item[19] ?? 0) / 100000000, // 成交额 (亿)
    (item[20] ?? 0) / 100000000, // 总市值 (亿)
    (item[21] ?? 0) / 100000000, // 自由流通市值 (亿)
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 国证指数-历史行情数据
 * http://www.cnindex.com.cn/module/index-detail.html?act_menu=1&indexCode=399001
 *
 * @param symbol 指数代码，如 "399001" (深证成指)
 * @param startDate 开始日期，格式 "20230114"
 * @param endDate 结束日期，格式 "20240114"
 */
export async function index_hist_cni(
  symbol: string = '399001',
  startDate: string = '20230114',
  endDate: string = '20240114'
): Promise<DataFrame> {
  const formattedStart = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
  const formattedEnd = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;

  const url = 'http://hq.cnindex.com.cn/market/market/getIndexDailyDataWithDataFormat';
  const params = {
    indexCode: symbol,
    startDate: formattedStart,
    endDate: formattedEnd,
    frequency: 'day',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '开盘价', '最高价', '最低价', '收盘价',
    '涨跌幅', '成交量', '成交额',
  ];

  const rows = data.data.data.map((item: any[]) => [
    item[0],                                  // 日期
    parseFloat(item[3]),                       // 开盘价
    parseFloat(item[1]),                       // 最高价
    parseFloat(item[4]),                       // 最低价
    parseFloat(item[5]),                       // 收盘价
    parseFloat(String(item[7]).replace('%', '')) / 100, // 涨跌幅
    item[9],                                  // 成交量
    item[8],                                  // 成交额
  ]);

  return createDataFrame(columns, rows);
}
