/**
 * AKShare TypeScript - 参考汇率和结算汇率
 * 深港通/沪港通-港股通业务信息
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 沪港通-港股通信息披露-参考汇率
 * https://www.sse.com.cn/services/hkexsc/disclo/ratios/
 * @returns 参考汇率数据
 */
export async function stock_sgt_reference_exchange_rate_sse(): Promise<DataFrame> {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentDay = String(new Date().getDate()).padStart(2, '0');
  const currentDate = `${currentYear}${currentMonth}${currentDay}`;

  const url = 'https://query.sse.com.cn/commonSoaQuery.do';
  const params = {
    isPagination: 'true',
    updateDate: '20120601',
    updateDateEnd: currentDate,
    sqlId: 'FW_HGT_GGTHL',
    'pageHelp.cacheSize': '1',
    'pageHelp.pageSize': '10000',
    'pageHelp.pageNo': '1',
    'pageHelp.beginPage': '1',
    'pageHelp.endPage': '1',
  };

  const headers = {
    'Host': 'query.sse.com.cn',
    'Referer': 'https://www.sse.com.cn/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.result) {
    return createDataFrame([], []);
  }

  const columns = ['适用日期', '参考汇率买入价', '参考汇率卖出价'];
  const rows = data.result.map((item: any) => [
    item.updateDate,
    item.buyPrice,
    item.sellPrice,
  ]);

  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return a[0].localeCompare(b[0]);
  });

  return createDataFrame(columns, rows);
}

/**
 * 沪港通-港股通信息披露-结算汇兑比率
 * https://www.sse.com.cn/services/hkexsc/disclo/ratios/
 * @returns 结算汇兑比率数据
 */
export async function stock_sgt_settlement_exchange_rate_sse(): Promise<DataFrame> {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentDay = String(new Date().getDate()).padStart(2, '0');
  const currentDate = `${currentYear}${currentMonth}${currentDay}`;

  const url = 'https://query.sse.com.cn/commonSoaQuery.do';
  const params = {
    isPagination: 'true',
    updateDate: '20120601',
    updateDateEnd: currentDate,
    sqlId: 'FW_HGT_JSHL',
    'pageHelp.cacheSize': '1',
    'pageHelp.pageSize': '10000',
    'pageHelp.pageNo': '1',
    'pageHelp.beginPage': '1',
    'pageHelp.endPage': '1',
  };

  const headers = {
    'Host': 'query.sse.com.cn',
    'Referer': 'https://www.sse.com.cn/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.result) {
    return createDataFrame([], []);
  }

  const columns = ['适用日期', '买入结算汇兑比率', '卖出结算汇兑比率'];
  const rows = data.result.map((item: any) => [
    item.updateDate,
    item.buyPrice,
    item.sellPrice,
  ]);

  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return a[0].localeCompare(b[0]);
  });

  return createDataFrame(columns, rows);
}
