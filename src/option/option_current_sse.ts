/**
 * AKShare TypeScript - 上海证券交易所-产品-股票期权-信息披露-当日合约
 * http://www.sse.com.cn/assortment/options/disclo/preinfo/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 上海证券交易所-产品-股票期权-信息披露-当日合约
 * http://www.sse.com.cn/assortment/options/disclo/preinfo/
 * @returns 上交所期权当日合约
 */
export async function option_current_day_sse(): Promise<DataFrame> {
  const url = 'http://query.sse.com.cn/commonQuery.do';
  const params = {
    isPagination: 'false',
    expireDate: '',
    securityId: '',
    sqlId: 'SSE_ZQPZ_YSP_GGQQZSXT_XXPL_DRHY_SEARCH_L',
  };

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
    '合约编码', '合约交易代码', '合约简称', '标的券名称及代码',
    '类型', '行权价', '合约单位', '期权行权日', '行权交收日',
    '到期日', '开始日期'
  ];

  const rows = data.result.map((item: any) => [
    item.SECURITY_ID,
    item.CONTRACT_ID,
    item.CONTRACT_SYMBOL,
    item.SECURITYNAMEBYID,
    item.CALL_OR_PUT,
    parseFloat(item.EXERCISE_PRICE) || null,
    parseInt(item.CONTRACT_UNIT) || null,
    item.END_DATE,
    item.DELIVERY_DATE,
    item.EXPIRE_DATE,
    item.START_DATE,
  ]);

  return createDataFrame(columns, rows);
}
