/**
 * AKShare TypeScript - 上海证券交易所-产品-股票期权-每日统计
 * https://www.sse.com.cn/assortment/options/date/
 * 深圳证券交易所-市场数据-期权数据-日度概况
 * https://investor.szse.cn/market/option/day/index.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 上海证券交易所-产品-股票期权-每日统计
 * https://www.sse.com.cn/assortment/options/date/
 * @param date 交易日，格式：20240626
 * @returns 每日统计
 */
export async function option_daily_stats_sse(date: string = '20240626'): Promise<DataFrame> {
  const url = 'http://query.sse.com.cn/commonQuery.do';
  const params = {
    isPagination: 'false',
    sqlId: 'COMMON_SSE_ZQPZ_YSP_QQ_SJTJ_MRTJ_CX',
    tradeDate: date,
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        'Referer': 'https://www.sse.com.cn/',
      },
    });

    if (!data?.result || data.result.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '合约标的代码', '合约标的名称', '合约数量', '总成交额', '总成交量',
      '认购成交量', '认沽成交量', '认沽/认购', '未平仓合约总数',
      '未平仓认购合约数', '未平仓认沽合约数', '交易日'
    ];

    const rows = data.result.map((item: any) => [
      item.SECURITY_CODE,
      item.SECURITY_ABBR,
      parseInt(item.CONTRACT_VOLUME?.replace(/,/g, '')) || null,
      parseFloat(item.TOTAL_MONEY?.replace(/,/g, '')) || null,
      parseInt(item.TOTAL_VOLUME?.replace(/,/g, '')) || null,
      parseInt(item.CALL_VOLUME?.replace(/,/g, '')) || null,
      parseInt(item.PUT_VOLUME?.replace(/,/g, '')) || null,
      parseFloat(item.CP_RATE?.replace(/,/g, '')) || null,
      parseInt(item.LEAVES_QTY?.replace(/,/g, '')) || null,
      parseInt(item.LEAVES_CALL_QTY?.replace(/,/g, '')) || null,
      parseInt(item.LEAVES_PUT_QTY?.replace(/,/g, '')) || null,
      item.TRADE_DATE,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 深圳证券交易所-市场数据-期权数据-日度概况
 * https://investor.szse.cn/market/option/day/index.html
 * @param date 交易日，格式：20240626
 * @returns 每日统计
 */
export async function option_daily_stats_szse(date: string = '20240626'): Promise<DataFrame> {
  const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
  const url = 'https://investor.szse.cn/api/report/ShowReport/data';
  const params = {
    SHOWTYPE: 'JSON',
    CATALOGID: 'ysprdzb',
    TABKEY: 'tab1',
    txtQueryDate: formattedDate,
    random: '0.0652692406565949',
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data || !data[0]?.data || data[0].data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '合约标的代码', '合约标的名称', '成交量', '认购成交量', '认沽成交量',
      '认沽/认购持仓比', '未平仓合约总数', '未平仓认购合约数', '未平仓认沽合约数', '交易日'
    ];

    const rows = data[0].data.map((item: any) => [
      item.bddm,
      item.bdmc,
      parseInt(item.cjl?.replace(/,/g, '')) || null,
      parseInt(item.rccjl?.replace(/,/g, '')) || null,
      parseInt(item.rpcjl?.replace(/,/g, '')) || null,
      parseFloat(item.rcrpccb?.replace(/,/g, '')) || null,
      parseInt(item.wpchyzs?.replace(/,/g, '')) || null,
      parseInt(item.wpcrchys?.replace(/,/g, '')) || null,
      parseInt(item.wpcrphys?.replace(/,/g, '')) || null,
      formattedDate,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
