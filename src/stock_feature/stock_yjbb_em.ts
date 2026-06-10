/**
 * AKShare TypeScript - 东方财富-数据中心-年报季报-业绩快报-业绩报表
 * https://data.eastmoney.com/bbsj/202003/yjbb.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-年报季报-业绩快报-业绩报表
 * https://data.eastmoney.com/bbsj/202003/yjbb.html
 * @param date 报告期，可选 "20200331", "20200630", "20200930", "20201231"，从 20100331 开始
 * @returns 业绩报表数据
 */
export async function stock_yjbb_em(
  date: string = '20200331'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

  const params = {
    sortColumns: 'UPDATE_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_LICO_FN_CPD',
    columns: 'ALL',
    filter: `(REPORTDATE='${dateFormatted}')`,
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
    '序号', '股票代码', '股票简称', '每股收益',
    '营业总收入-营业总收入', '营业总收入-同比增长', '营业总收入-季度环比增长',
    '净利润-净利润', '净利润-同比增长', '净利润-季度环比增长',
    '每股净资产', '净资产收益率', '每股经营现金流量',
    '销售毛利率', '所处行业', '最新公告日期'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.BASIC_EPS,
    item.TOTAL_OPERATE_INCOME,
    item.TOTAL_OPERATE_INCOME_YOY,
    item.TOTAL_OPERATE_INCOME_QOQ,
    item.PARENT_NETPROFIT,
    item.PARENT_NETPROFIT_YOY,
    item.PARENT_NETPROFIT_QOQ,
    item.BPS,
    item.WEIGHTAVG_ROE,
    item.OPERATE_CASH_FLOW_PS,
    item.GROSS_PROFIT_RATIO,
    item.INDUSTRY,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
