/**
 * AKShare TypeScript - 上海证券交易所-产品-股票期权-期权风险指标
 * http://www.sse.com.cn/assortment/options/risk/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 上海证券交易所-产品-股票期权-期权风险指标
 * http://www.sse.com.cn/assortment/options/risk/
 * @param date 日期，格式：20240626，从20150209开始
 * @returns 期权风险指标
 */
export async function option_risk_indicator_sse(date: string = '20240626'): Promise<DataFrame> {
  const url = 'http://query.sse.com.cn/commonQuery.do';
  const params = {
    isPagination: 'false',
    trade_date: date,
    sqlId: 'SSE_ZQPZ_YSP_GGQQZSXT_YSHQ_QQFXZB_DATE_L',
    contractSymbol: '',
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        'Referer': 'http://www.sse.com.cn/',
      },
    });

    if (!data?.result || data.result.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '交易日期', '合约编码', '合约交易代码', '合约简称',
      'Delta', 'Theta', 'Gamma', 'Vega', 'Rho', '隐含波动率'
    ];

    const rows = data.result.map((item: any) => [
      item.TRADE_DATE,
      item.SECURITY_ID,
      item.CONTRACT_ID,
      item.CONTRACT_SYMBOL,
      parseFloat(item.DELTA_VALUE) || null,
      parseFloat(item.THETA_VALUE) || null,
      parseFloat(item.GAMMA_VALUE) || null,
      parseFloat(item.VEGA_VALUE) || null,
      parseFloat(item.RHO_VALUE) || null,
      parseFloat(item.IMPLC_VOLATLTY) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
