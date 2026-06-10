/**
 * AKShare TypeScript - 增发和配股
 * 东方财富网-数据中心-新股数据-增发/配股
 * https://data.eastmoney.com/other/gkzf.html
 * https://data.eastmoney.com/xg/pg/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-新股数据-增发-全部增发
 * https://data.eastmoney.com/other/gkzf.html
 * @returns 全部增发数据
 */
export async function stock_qbzf_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'ISSUE_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_SEO_DETAIL',
    columns: 'ALL',
    quoteColumns: 'f2~01~SECURITY_CODE~NEW_PRICE',
    quoteType: '0',
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
    '股票代码', '股票简称', '增发代码', '发行方式',
    '发行总数', '网上发行', '发行价格', '最新价',
    '发行日期', '增发上市日期', '锁定期',
  ];

  const rows = allData.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.CORRECODE,
    item.SEO_TYPE,
    item.ISSUE_NUM,
    item.ONLINE_ISSUE_NUM,
    item.ISSUE_PRICE,
    item.NEW_PRICE,
    item.ISSUE_DATE ? new Date(item.ISSUE_DATE).toISOString().split('T')[0] : null,
    item.ISSUE_LISTING_DATE ? new Date(item.ISSUE_LISTING_DATE).toISOString().split('T')[0] : null,
    item.LOCKIN_PERIOD,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-新股数据-配股
 * https://data.eastmoney.com/xg/pg/
 * @returns 配股数据
 */
export async function stock_pg_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'EQUITY_RECORD_DATE',
    sortTypes: '-1',
    pageSize: '50000',
    pageNumber: '1',
    reportName: 'RPT_IPO_ALLOTMENT',
    columns: 'ALL',
    quoteColumns: 'f2~01~SECURITY_CODE~NEW_PRICE',
    quoteType: '0',
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
    '股票代码', '股票简称', '配售代码', '配股数量',
    '配股比例', '配股价', '最新价', '配股前总股本', '配股后总股本',
    '股权登记日', '缴款起始日期', '缴款截止日期', '上市日',
  ];

  const rows = allData.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.ALLOTMENT_CODE,
    item.ALLOTMENT_NUM != null ? String(item.ALLOTMENT_NUM) : null,
    item.ALLOTMENT_RATIO != null ? `10配${item.ALLOTMENT_RATIO}` : null,
    item.ALLOTMENT_PRICE != null ? String(item.ALLOTMENT_PRICE) : null,
    item.NEW_PRICE != null ? String(item.NEW_PRICE) : null,
    item.PRE_CAPITAL != null ? String(item.PRE_CAPITAL) : null,
    item.AFTER_CAPITAL != null ? String(item.AFTER_CAPITAL) : null,
    item.EQUITY_RECORD_DATE ? new Date(item.EQUITY_RECORD_DATE).toISOString().split('T')[0] : null,
    item.PAY_START_DATE ? new Date(item.PAY_START_DATE).toISOString().split('T')[0] : null,
    item.PAY_END_DATE ? new Date(item.PAY_END_DATE).toISOString().split('T')[0] : null,
    item.LISTING_DATE ? new Date(item.LISTING_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
