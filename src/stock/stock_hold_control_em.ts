/**
 * AKShare TypeScript - 东方财富高管持股数据
 * https://data.eastmoney.com/executive/list.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-特色数据-高管持股-董监高及相关人员持股变动明细
 */
export async function stock_hold_management_detail_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_EXECUTIVE_HOLD_DETAILS',
    columns: 'ALL',
    quoteColumns: '',
    filter: '',
    pageNumber: '1',
    pageSize: '5000',
    sortTypes: '-1,1,1',
    sortColumns: 'CHANGE_DATE,SECURITY_CODE,PERSON_NAME',
    source: 'WEB',
    client: 'WEB',
  };

  const firstPage = await httpGet<any>(url, { params });
  if (!firstPage?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPages = firstPage.result.pages || 1;
  const allData: any[] = [...firstPage.result.data];

  for (let page = 2; page <= Math.min(totalPages, 5); page++) {
    const pageParams = { ...params, pageNumber: page.toString() };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData.push(...pageData.result.data);
    }
  }

  const columns = [
    '代码', '名称', '日期', '变动人', '变动股数', '成交均价',
    '变动金额', '变动原因', '变动比例', '变动后持股数',
    '持股种类', '董监高人员姓名', '职务', '变动人与董监高的关系',
  ];

  const rows = allData.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME,
    item.CHANGE_DATE,
    item.PERSON_NAME,
    item.CHANGE_SHARES,
    item.AVERAGE_PRICE,
    item.CHANGE_AMOUNT,
    item.CHANGE_REASON,
    item.CHANGE_RATIO,
    item.CHANGE_AFTER_HOLDNUM,
    item.HOLD_TYPE,
    item.DSE_PERSON_NAME,
    item.POSITION_NAME,
    item.PERSON_DSE_RELATION,
  ]);

  return createDataFrame(columns, rows);
}
