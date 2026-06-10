/**
 * AKShare TypeScript - 东方财富基金持仓数据接口
 * http://data.eastmoney.com/zlsj/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-主力数据-基金持仓
 *
 * @param symbol 持仓类型：基金持仓, QFII持仓, 社保持仓, 券商持仓, 保险持仓, 信托持仓
 * @param date 财报日期，格式 "20210331"
 */
export async function stock_report_fund_hold(
  symbol: '基金持仓' | 'QFII持仓' | '社保持仓' | '券商持仓' | '保险持仓' | '信托持仓' = '基金持仓',
  date: string = '20210331'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '基金持仓': '1', 'QFII持仓': '2', '社保持仓': '3',
    '券商持仓': '4', '保险持仓': '5', '信托持仓': '6',
  };

  const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  const url = 'http://data.eastmoney.com/dataapi/zlsj/list';

  const params = {
    date: formattedDate,
    type: symbolMap[symbol],
    zjc: '0',
    sortField: 'HOULD_NUM',
    sortDirec: '1',
    pageNum: '1',
    pageSize: '500',
    p: '1',
    pageNo: '1',
  };

  const firstPage = await httpGet<any>(url, { params });
  if (!firstPage?.data) {
    return createDataFrame([], []);
  }

  const totalPages = firstPage.pages || 1;
  const allData: any[] = [...firstPage.data];

  for (let page = 2; page <= totalPages; page++) {
    const pageParams = {
      ...params,
      pageNum: page.toString(),
      p: page.toString(),
      pageNo: page.toString(),
    };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.data) {
      allData.push(...pageData.data);
    }
  }

  const columns = [
    '序号', '股票代码', '股票简称', '持有基金家数',
    '持股总数', '持股市值', '持股变化', '持股变动数值', '持股变动比例',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE || item[20],
    item.SECURITY_NAME_ABBR || item[2],
    item.HOULD_NUM || item[5],
    item.HOLD_NUM || item[6],
    item.HOLD_MARKET_CAP || item[7],
    item.HOLD_CHANGE || item[9],
    item.HOLD_NUM_CHANGE || item[10],
    item.HOLD_RATIO_CHANGE || item[11],
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-主力数据-基金持仓-明细
 *
 * @param symbol 基金代码
 * @param date 财报日期
 */
export async function stock_report_fund_hold_detail(
  symbol: string = '008286',
  date: string = '20220331'
): Promise<DataFrame> {
  const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'SECURITY_CODE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_MAINDATA_MAIN_POSITIONDETAILS',
    columns: 'ALL',
    quoteColumns: '',
    filter: `(HOLDER_CODE="${symbol}")(REPORT_DATE='${formattedDate}')`,
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '股票代码', '股票简称', '持股数', '持股市值',
    '占总股本比例', '占流通股本比例',
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.HOLD_NUM,
    item.HOLD_MARKET_CAP,
    item.FREE_SHARES_RATIO,
    item.CIRCULATE_SHARES_RATIO,
  ]);

  return createDataFrame(columns, rows);
}
