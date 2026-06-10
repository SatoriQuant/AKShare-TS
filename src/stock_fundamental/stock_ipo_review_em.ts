/**
 * AKShare TypeScript - 东方财富-新股上会信息
 * https://data.eastmoney.com/xg/gh/default.html
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富网-数据中心-新股申购-新股上会信息
 * https://data.eastmoney.com/xg/gh/default.html
 */
export async function stock_ipo_review_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams: Record<string, string> = {
    sortColumns: 'REVIEW_DATE,ORG_CODE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_IPO_REVIEW',
    columns: 'ALL',
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
    '序号', '企业名称', '股票简称', '股票代码', '上市板块',
    '上会日期', '审核状态', '发审委委员', '主承销商',
    '发行数量(股)', '拟融资额(元)', '公告日期', '上市日期',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.ORG_NAME,
    item.SECURITY_NAME_ABBR,
    item.SECURITY_CODE,
    item.TRADE_MARKET,
    item.REVIEW_DATE ? item.REVIEW_DATE.split(' ')[0] : null,
    item.REVIEW_STATE,
    item.REVIEW_MEMBER,
    item.LEAD_UNDERWRITER,
    item.ISSUE_NUM != null ? Number(item.ISSUE_NUM) : null,
    item.FINANCE_AMT_UPPER != null ? Number(item.FINANCE_AMT_UPPER) : null,
    item.NOTICE_DATE ? item.NOTICE_DATE.split(' ')[0] : null,
    item.LISTING_DATE ? item.LISTING_DATE.split(' ')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
