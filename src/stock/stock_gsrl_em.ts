/**
 * AKShare TypeScript - 东方财富股市日历
 * https://data.eastmoney.com/gsrl/gsdt.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-股市日历-公司动态
 *
 * @param date 交易日，格式 "20230808"
 */
export async function stock_gsrl_gsdt_em(
  date: string = '20230808'
): Promise<DataFrame> {
  const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'SECURITY_CODE',
    sortTypes: '1',
    pageSize: '5000',
    pageNumber: '1',
    columns: 'SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,EVENT_TYPE,EVENT_CONTENT,TRADE_DATE',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ORGOP_ALL',
    filter: `(TRADE_DATE='${formattedDate}')`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['序号', '代码', '简称', '事件类型', '具体事项', '交易日'];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.EVENT_TYPE,
    item.EVENT_CONTENT,
    item.TRADE_DATE,
  ]);

  return createDataFrame(columns, rows);
}
