/**
 * AKShare TypeScript - 东方财富网-数据中心-股东大会
 * https://data.eastmoney.com/gddh/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-股东大会
 * https://data.eastmoney.com/gddh/
 * @returns 股东大会数据
 */
export async function stock_gddh_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'NOTICE_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_GENERALMEETING_DETAIL',
    columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,MEETING_TITLE,START_ADJUST_DATE,EQUITY_RECORD_DATE,ONSITE_RECORD_DATE,DECISION_NOTICE_DATE,NOTICE_DATE,WEB_START_DATE,WEB_END_DATE,SERIAL_NUM,PROPOSAL',
    filter: '(IS_LASTDATE="1")',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '代码', '简称', '股东大会名称', '召开开始日', '股权登记日',
    '现场登记日', '网络投票时间-开始日', '网络投票时间-结束日',
    '决议公告日', '公告日', '序列号', '提案',
  ];

  const rows = allData.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.MEETING_TITLE,
    item.START_ADJUST_DATE ? new Date(item.START_ADJUST_DATE).toISOString().split('T')[0] : null,
    item.EQUITY_RECORD_DATE ? new Date(item.EQUITY_RECORD_DATE).toISOString().split('T')[0] : null,
    item.ONSITE_RECORD_DATE ? new Date(item.ONSITE_RECORD_DATE).toISOString().split('T')[0] : null,
    item.WEB_START_DATE ? new Date(item.WEB_START_DATE).toISOString().split('T')[0] : null,
    item.WEB_END_DATE ? new Date(item.WEB_END_DATE).toISOString().split('T')[0] : null,
    item.DECISION_NOTICE_DATE ? new Date(item.DECISION_NOTICE_DATE).toISOString().split('T')[0] : null,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
    item.SERIAL_NUM,
    item.PROPOSAL,
  ]);

  return createDataFrame(columns, rows);
}
