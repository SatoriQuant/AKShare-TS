/**
 * AKShare TypeScript - 期货仓单日报
 * SHFE上期所, DCE大商所, CZCE郑商所, GFEX广期所
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 大连商品交易所-仓单日报
 * http://www.dce.com.cn/dalianshangpin/xqsj/tjsj26/rtj/cdrb/index.html
 *
 * @param date 交易日，格式 YYYYMMDD
 */
export async function futures_warehouse_receipt_dce(date: string = '20251027'): Promise<DataFrame> {
  const url = 'http://www.dce.com.cn/dcereport/publicweb/dailystat/wbillWeeklyQuotes';
  const payload = {
    tradeDate: date,
    varietyId: 'all',
  };

  try {
    const data = await httpPost<any>(url, payload);

    if (!data?.data?.entityList) {
      return createDataFrame([], []);
    }

    const columns = [
      '品种代码', '品种名称', '仓库/分库', '可选提货地点/分库-数量',
      '昨日仓单量（手）', '今日仓单量（手）', '增减（手）',
    ];

    const rows = data.data.entityList.map((item: any) => [
      item.varietyOrder || '',
      item.variety || '',
      item.whAbbr || '',
      item.deliveryAbbr || '',
      parseInt(item.lastWbillQty) || 0,
      parseInt(item.wbillQty) || 0,
      parseInt(item.diff) || 0,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海期货交易所-仓单日报
 * https://tsite.shfe.com.cn/statements/dataview.html?paramid=dailystock
 *
 * @param date 交易日，格式 YYYYMMDD
 * @returns Promise<DataFrame> 仓单日报数据
 */
export async function futures_shfe_warehouse_receipt(date: string = '20200702'): Promise<DataFrame> {
  const url = `https://www.shfe.com.cn/data/tradedata/future/dailydata/${date}dailystock.dat`;

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.o_cursor || data.o_cursor.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '品种', '仓库', '注册仓单', '增减',
    ];

    const rows = data.o_cursor.map((item: any) => {
      const varName = (item.VARNAME || '').split('$')[0];
      const whAbbr = (item.WHABBRNAME || '').split('$')[0];

      return [
        varName,
        whAbbr,
        parseInt(item.WRQTY) || 0,
        parseInt(item.CHANGE) || 0,
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 广州期货交易所-仓单日报
 * http://www.gfex.com.cn/gfex/cdrb/hqsj_tjsj.shtml
 *
 * @param date 交易日，格式 YYYYMMDD
 */
export async function futures_gfex_warehouse_receipt(date: string = '20240122'): Promise<DataFrame> {
  const url = 'http://www.gfex.com.cn/u/interfacesWebTdWbillWeeklyQuotes/loadList';

  try {
    const data = await httpPost<any>(url, `gen_date=${date}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = [
      '品种代码', '品种', '仓库/分库', '昨日仓单量', '今日仓单量', '增减',
    ];

    const rows = data.data
      .filter((item: any) => item.whType !== undefined && item.whType !== '')
      .map((item: any) => [
        (item.varietyOrder || '').toUpperCase(),
        item.variety || '',
        item.whAbbr || '',
        parseInt(item.lastWbillQty) || 0,
        parseInt(item.wbillQty) || 0,
        parseInt(item.regWbillQty) || 0,
      ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 期货仓单日报（通用接口）
 *
 * @param date 交易日，格式 YYYYMMDD
 * @param market 交易所：SHFE, DCE, CZCE, GFEX
 */
export async function futures_warehouse_receipt(
  date: string = '20251014',
  market: 'SHFE' | 'DCE' | 'CZCE' | 'GFEX' = 'DCE'
): Promise<DataFrame> {
  const marketFuncMap: Record<string, (date: string) => Promise<DataFrame>> = {
    SHFE: futures_shfe_warehouse_receipt,
    DCE: futures_warehouse_receipt_dce,
    GFEX: futures_gfex_warehouse_receipt,
  };

  const func = marketFuncMap[market.toUpperCase()];
  if (!func) {
    // CZCE returns a dict per variety, harder to represent as single DataFrame
    return createDataFrame([], []);
  }

  return func(date);
}
