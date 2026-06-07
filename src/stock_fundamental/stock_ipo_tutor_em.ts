/**
 * AKShare TypeScript - 东方财富-IPO辅导信息
 * https://data.eastmoney.com/xg/ipo/fd.html
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富网-数据中心-新股数据-IPO辅导信息
 * https://data.eastmoney.com/xg/ipo/fd.html
 */
export async function stock_ipo_tutor_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams: Record<string, string> = {
    sortColumns: 'RECORD_DATE,TUTOR_OBJECT',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_IPO_TUTRECORD',
    columns: 'TUTOR_OBJECT,ORG_CODE,TUTOR_ORG_CODE,TUTOR_ORG,TUTOR_PROCESS_STATE,REPORT_TYPE,DISPATCH_ORG,REPORT_TITLE,RECORD_DATE',
    source: 'WEB',
    client: 'WEB',
  };

  // First request to get total pages
  const firstData = await httpGet<any>(url, { params: baseParams });

  if (!firstData?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPages = firstData.result.pages || 1;
  let allData: any[] = [...firstData.result.data];

  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    const pageParams = { ...baseParams, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '企业名称', '辅导机构', '辅导状态',
    '报告类型', '派出机构', '报告标题', '备案日期',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.TUTOR_OBJECT,
    item.TUTOR_ORG,
    item.TUTOR_PROCESS_STATE,
    item.REPORT_TYPE,
    item.DISPATCH_ORG,
    item.REPORT_TITLE,
    item.RECORD_DATE ? item.RECORD_DATE.split(' ')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
