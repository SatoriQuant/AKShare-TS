/**
 * AKShare TypeScript - 同花顺可转债数据接口
 * 同花顺-数据中心-可转债
 * https://data.10jqka.com.cn/ipo/bond/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取同花顺可转债数据
 * https://data.10jqka.com.cn/ipo/bond/
 */
export async function bond_zh_cov_info_ths(): Promise<DataFrame> {
  const url = 'https://data.10jqka.com.cn/ipo/kzz/';

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      },
    });

    if (!data?.list) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '申购日期', '申购代码', '原股东配售码',
      '每股获配额', '计划发行量', '实际发行量', '中签公布日', '中签号',
      '上市日期', '正股代码', '正股简称', '转股价格', '到期时间', '中签率'
    ];

    const rows = data.list.map((item: any) => [
      item.bond_code,
      item.bond_name,
      item.sub_date,
      item.sub_code,
      item.share_code,
      parseFloat(item.quota) || null,
      parseFloat(item.plan_total) || null,
      parseFloat(item.issue_total) || null,
      item.sign_date,
      item.number,
      item.listing_date,
      item.code,
      item.name,
      parseFloat(item.price) || null,
      item.expire_date,
      parseFloat(item.success_rate) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
