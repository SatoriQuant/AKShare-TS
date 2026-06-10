/**
 * AKShare TypeScript - 金十数据-期货手续费
 * https://www.jin10.com/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 金十财经-期货手续费
 * https://www.jin10.com/
 *
 * @param date 日期，格式 YYYYMMDD，例如 "20250213"
 */
export async function futures_comm_js(date: string = '20260213'): Promise<DataFrame> {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'x-app-id': 'fiXF2nOnDycGutVA',
    'x-version': '1.0',
    referer: 'https://www.jin10.com/',
    origin: 'https://www.jin10.com',
  };

  const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  const url = 'https://mp-api.jin10.com/api/dynamic-data/child';
  const params = {
    tb_name: '_vir_26',
    search: JSON.stringify({
      'range,date': `${formattedDate},${formattedDate}`,
      status: 1,
    }),
    order: 'date,desc',
  };

  try {
    const data = await httpGet<any>(url, { params, headers });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = [
      '日期', '合约品种', '合约代码', '手续费公布时间', '价格公布时间',
      '现价', '涨停板', '跌停板', '保证金/买开', '保证金/卖开',
      '保证金/每手', '开仓', '平今', '平昨', '每手跳数',
      '每跳毛利', '每跳净利', '交易所',
    ];

    const rows = data.data.map((item: any) => [
      item.date || '',
      item.heyue_name || '',
      item.heyue_code || '',
      item.pub_date_commission || '',
      item.pub_date_price || '',
      parseFloat(item.heyue_price) || 0,
      parseFloat(item.up_limit_num) || 0,
      parseFloat(item.down_limit_num) || 0,
      item.buy_ratio || '',
      item.sell_ratio || '',
      item.per_lot_price || '',
      item.buy_commission || '',
      item.sell_cur_commission || '',
      item.sell_yesterday_commission || '',
      parseFloat(item.per_ratio) || 0,
      parseFloat(item.per_commission_price) || 0,
      parseFloat(item.per_net_profit) || 0,
      item.jys || '',
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
