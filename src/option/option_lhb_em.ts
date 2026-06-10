/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-期权龙虎榜单
 * https://data.eastmoney.com/other/qqlhb.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-期货期权-期权龙虎榜单
 * https://data.eastmoney.com/other/qqlhb.html
 * @param symbol 期权代码，如 "510050", "510300", "159919"
 * @param indicator 指标类型
 * @param trade_date 交易日期，格式：20220121
 * @returns 期权龙虎榜单
 */
export async function option_lhb_em(
  symbol: string = '510050',
  indicator: string = '期权交易情况-认沽交易量',
  trade_date: string = '20220121'
): Promise<DataFrame> {
  const formattedDate = `${trade_date.slice(0, 4)}-${trade_date.slice(4, 6)}-${trade_date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/get';
  const params = {
    type: 'RPT_IF_BILLBOARD_TD',
    sty: 'ALL',
    filter: `(SECURITY_CODE="${symbol}")(TRADE_DATE='${formattedDate}')`,
    p: '1',
    pss: '200',
    source: 'IFBILLBOARD',
    client: 'WEB',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data || data.result.data.length === 0) {
      return createDataFrame([], []);
    }

    const allData = data.result.data;

    if (indicator === '期权交易情况-认沽交易量') {
      const columns = [
        '交易类型', '交易日期', '证券代码', '标的名称', '名次', '机构',
        '交易量', '增减', '净认沽量', '占总交易量比例'
      ];

      const rows = allData.slice(0, 7).map((item: any) => [
        item.TRADE_TYPE,
        item.TRADE_DATE,
        item.SECURITY_CODE,
        item.TARGET_NAME,
        item.MEMBER_RANK,
        item.MEMBER_NAME_ABBR,
        parseInt(item.BUY_VOLUME) || null,
        parseInt(item.BUY_VOLUME_CHANGE) || null,
        parseInt(item.NET_BUY_VOLUME) || null,
        parseFloat(item.BUY_VOLUME_RATIO) || null,
      ]);

      return createDataFrame(columns, rows);
    } else if (indicator === '期权持仓情况-认沽持仓量') {
      const columns = [
        '交易类型', '交易日期', '证券代码', '标的名称', '名次', '机构',
        '持仓量', '增减', '净持仓量', '占总交易量比例'
      ];

      const rows = allData.slice(7, 14).map((item: any) => [
        item.TRADE_TYPE,
        item.TRADE_DATE,
        item.SECURITY_CODE,
        item.TARGET_NAME,
        item.MEMBER_RANK,
        item.MEMBER_NAME_ABBR,
        parseInt(item.BUY_POSITION) || null,
        parseInt(item.BUY_POSITION_CHANGE) || null,
        parseInt(item.NET_BUY_POSITION) || null,
        parseFloat(item.BUY_POSITION_RATIO) || null,
      ]);

      return createDataFrame(columns, rows);
    } else if (indicator === '期权交易情况-认购交易量') {
      const columns = [
        '交易类型', '交易日期', '证券代码', '标的名称', '名次', '机构',
        '交易量', '增减', '净交易量', '占总交易量比例'
      ];

      const rows = allData.slice(14, 21).map((item: any) => [
        item.TRADE_TYPE,
        item.TRADE_DATE,
        item.SECURITY_CODE,
        item.TARGET_NAME,
        item.MEMBER_RANK,
        item.MEMBER_NAME_ABBR,
        parseInt(item.BUY_VOLUME) || null,
        parseInt(item.BUY_VOLUME_CHANGE) || null,
        parseInt(item.NET_BUY_VOLUME) || null,
        parseFloat(item.BUY_VOLUME_RATIO) || null,
      ]);

      return createDataFrame(columns, rows);
    } else if (indicator === '期权持仓情况-认购持仓量') {
      const columns = [
        '交易类型', '交易日期', '证券代码', '标的名称', '名次', '机构',
        '持仓量', '增减', '净持仓量', '占总交易量比例'
      ];

      const rows = allData.slice(21).map((item: any) => [
        item.TRADE_TYPE,
        item.TRADE_DATE,
        item.SECURITY_CODE,
        item.TARGET_NAME,
        item.MEMBER_RANK,
        item.MEMBER_NAME_ABBR,
        parseInt(item.BUY_POSITION) || null,
        parseInt(item.BUY_POSITION_CHANGE) || null,
        parseInt(item.NET_BUY_POSITION) || null,
        parseFloat(item.BUY_POSITION_RATIO) || null,
      ]);

      return createDataFrame(columns, rows);
    }

    return createDataFrame([], []);
  } catch {
    return createDataFrame([], []);
  }
}
