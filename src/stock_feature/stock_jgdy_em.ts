/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-机构调研
 * http://data.eastmoney.com/jgdy/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-机构调研-机构调研统计
 * https://data.eastmoney.com/jgdy/tj.html
 * @param date 开始日期，格式 "20220101"
 * @returns 机构调研统计数据
 */
export async function stock_jgdy_tj_em(date: string = '20220101'): Promise<DataFrame> {
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'NOTICE_DATE,SUM,RECEIVE_START_DATE,SECURITY_CODE',
    sortTypes: '-1,-1,-1,1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_ORG_SURVEYNEW',
    columns: 'ALL',
    quoteColumns: 'f2~01~SECURITY_CODE~CLOSE_PRICE,f3~01~SECURITY_CODE~CHANGE_RATE',
    source: 'WEB',
    client: 'WEB',
    filter: `(NUMBERNEW="1")(IS_SOURCE="1")(NOTICE_DATE>'${dateFormatted}')`,
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
    '序号', '代码', '名称', '最新价', '涨跌幅',
    '接待机构数量', '接待方式', '接待人员', '接待地点',
    '接待日期', '公告日期',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.SUM,
    item.RECEIVE_WAY,
    item.RECEPTIONIST,
    item.RECEIVE_PLACE,
    item.RECEIVE_START_DATE ? new Date(item.RECEIVE_START_DATE).toISOString().split('T')[0] : null,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-机构调研-机构调研详细
 * https://data.eastmoney.com/jgdy/xx.html
 * @param symbol 股票代码
 * @returns 机构调研详细数据
 */
export async function stock_jgdy_detail_em(symbol: string = '000001'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'NOTICE_DATE,RECEIVE_START_DATE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_ORG_SURVEY',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")`,
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
    '序号', '代码', '名称', '公告日期', '接待日期',
    '接待机构数量', '接待方式', '接待人员', '接待地点',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
    item.RECEIVE_START_DATE ? new Date(item.RECEIVE_START_DATE).toISOString().split('T')[0] : null,
    item.SUM,
    item.RECEIVE_WAY,
    item.RECEPTIONIST,
    item.RECEIVE_PLACE,
  ]);

  return createDataFrame(columns, rows);
}
