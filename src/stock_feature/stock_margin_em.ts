/**
 * AKShare TypeScript - 东方财富网-数据中心-融资融券
 * https://data.eastmoney.com/rzrq/zhtjday.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-融资融券-融资融券账户统计-两融账户信息
 * https://data.eastmoney.com/rzrq/zhtjday.html
 * @returns 融资融券账户统计数据
 */
export async function stock_margin_account_info(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPTA_WEB_MARGIN_DAILYTRADE',
    columns: 'ALL',
    pageNumber: '1',
    pageSize: '500',
    sortColumns: 'STATISTICS_DATE',
    sortTypes: '-1',
    p: '1',
    pageNo: '1',
    pageNum: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  // 获取剩余页数据
  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page), p: String(page), pageNo: String(page), pageNum: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '日期', '融资余额', '融券余额', '融资买入额', '融券卖出额',
    '证券公司数量', '营业部数量', '个人投资者数量', '机构投资者数量',
    '参与交易的投资者数量', '有融资融券负债的投资者数量',
    '担保物总价值', '平均维持担保比例'
  ];

  const rows = allData.map((item: any) => [
    item.STATISTICS_DATE ? new Date(item.STATISTICS_DATE).toISOString().split('T')[0] : null,
    item.FIN_BALANCE,
    item.LOAN_BALANCE,
    item.FIN_BUY_AMT,
    item.LOAN_SELL_AMT,
    item.SECURITY_ORG_NUM,
    item.OPERATEDEPT_NUM,
    item.PERSONAL_INVESTOR_NUM,
    item.ORG_INVESTOR_NUM,
    item.INVESTOR_NUM,
    item.MARGINLIAB_INVESTOR_NUM,
    item.TOTAL_GUARANTEE,
    item.AVG_GUARANTEE_RATIO,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}
