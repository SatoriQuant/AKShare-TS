/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-停复牌信息
 * https://data.eastmoney.com/tfpxx/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-停复牌信息
 * https://data.eastmoney.com/tfpxx/
 * @param date 查询日期，格式 "20240426"
 * @returns 停复牌信息表
 */
export async function stock_tfp_em(
  date: string = '20240426'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

  const params = {
    sortColumns: 'SUSPEND_START_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_CUSTOM_SUSPEND_DATA_INTERFACE',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(MARKET="全部")(DATETIME='${dateFormatted}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  // 获取剩余页数据
  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '代码', '名称', '停牌时间', '停牌截止时间',
    '停牌期限', '停牌原因', '所属市场', '预计复牌时间'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.SUSPEND_START_DATE ? new Date(item.SUSPEND_START_DATE).toISOString().split('T')[0] : null,
    item.SUSPEND_END_DATE ? new Date(item.SUSPEND_END_DATE).toISOString().split('T')[0] : null,
    item.SUSPEND_TERM,
    item.SUSPEND_REASON,
    item.MARKET,
    item.RESUMP_TRADE_DATE ? new Date(item.RESUMP_TRADE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
