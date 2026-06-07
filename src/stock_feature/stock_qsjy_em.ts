/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-券商业绩月报
 * http://data.eastmoney.com/other/qsjy.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-券商业绩月报
 * http://data.eastmoney.com/other/qsjy.html
 * @param date 数据月份，格式 "20200731"
 * @returns 券商业绩月报数据
 */
export async function stock_qsjy_em(date: string = '20200731'): Promise<DataFrame> {
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'END_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_PERFORMANCE',
    columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,END_DATE,NETPROFIT,NP_YOY,NP_QOQ,ACCUMPROFIT,ACCUMPROFIT_YOY,OPERATE_INCOME,OI_YOY,OI_QOQ,ACCUMOI,ACCUMOI_YOY,NET_ASSETS,NA_YOY',
    source: 'WEB',
    client: 'WEB',
    filter: `(END_DATE='${dateFormatted}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '简称', '代码',
    '当月净利润-净利润', '当月净利润-同比增长', '当月净利润-环比增长',
    '当年累计净利润-累计净利润', '当年累计净利润-同比增长',
    '当月营业收入-营业收入', '当月营业收入-环比增长', '当月营业收入-同比增长',
    '当年累计营业收入-累计营业收入', '当年累计营业收入-同比增长',
    '净资产-净资产', '净资产-同比增长',
  ];

  const rows = data.result.data.map((item: any) => [
    item.SECURITY_NAME_ABBR,
    item.SECURITY_CODE,
    item.NETPROFIT,
    item.NP_YOY,
    item.NP_QOQ,
    item.ACCUMPROFIT,
    item.ACCUMPROFIT_YOY,
    item.OPERATE_INCOME,
    item.OI_YOY,
    item.OI_QOQ,
    item.ACCUMOI,
    item.ACCUMOI_YOY,
    item.NET_ASSETS,
    item.NA_YOY,
  ]);

  return createDataFrame(columns, rows);
}
