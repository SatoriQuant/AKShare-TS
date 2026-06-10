/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-股东户数
 * https://data.eastmoney.com/gdhs/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-股东户数
 * https://data.eastmoney.com/gdhs/
 * @param symbol 选择 {"最新", "每个季度末"}，其中每个季度末需要写成 "20230930" 格式
 * @returns 股东户数数据
 */
export async function stock_zh_a_gdhs(symbol: string = '20230930'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  let params: any;

  if (symbol === '最新') {
    params = {
      sortColumns: 'HOLD_NOTICE_DATE,SECURITY_CODE',
      sortTypes: '-1,-1',
      pageSize: '500',
      pageNumber: '1',
      reportName: 'RPT_HOLDERNUMLATEST',
      columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,END_DATE,INTERVAL_CHRATE,AVG_MARKET_CAP,AVG_HOLD_NUM,TOTAL_MARKET_CAP,TOTAL_A_SHARES,HOLD_NOTICE_DATE,HOLDER_NUM,PRE_HOLDER_NUM,HOLDER_NUM_CHANGE,HOLDER_NUM_RATIO,END_DATE,PRE_END_DATE',
      quoteColumns: 'f2,f3',
      source: 'WEB',
      client: 'WEB',
    };
  } else {
    params = {
      sortColumns: 'HOLD_NOTICE_DATE,SECURITY_CODE',
      sortTypes: '-1,-1',
      pageSize: '500',
      pageNumber: '1',
      reportName: 'RPT_HOLDERNUM_DET',
      columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,END_DATE,INTERVAL_CHRATE,AVG_MARKET_CAP,AVG_HOLD_NUM,TOTAL_MARKET_CAP,TOTAL_A_SHARES,HOLD_NOTICE_DATE,HOLDER_NUM,PRE_HOLDER_NUM,HOLDER_NUM_CHANGE,HOLDER_NUM_RATIO,END_DATE,PRE_END_DATE',
      quoteColumns: 'f2,f3',
      source: 'WEB',
      client: 'WEB',
      filter: `(END_DATE='${symbol.slice(0, 4)}-${symbol.slice(4, 6)}-${symbol.slice(6)}')`,
    };
  }

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
    '代码', '名称', '最新价', '涨跌幅', '股东户数-本次', '股东户数-上次',
    '股东户数-增减', '股东户数-增减比例', '区间涨跌幅', '股东户数统计截止日-本次',
    '股东户数统计截止日-上次', '户均持股市值', '户均持股数量', '总市值', '总股本', '公告日期'
  ];

  const rows = allData.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.f2,
    item.f3,
    item.HOLDER_NUM,
    item.PRE_HOLDER_NUM,
    item.HOLDER_NUM_CHANGE,
    item.HOLDER_NUM_RATIO,
    item.INTERVAL_CHRATE,
    item.END_DATE ? new Date(item.END_DATE).toISOString().split('T')[0] : null,
    item.PRE_END_DATE ? new Date(item.PRE_END_DATE).toISOString().split('T')[0] : null,
    item.AVG_MARKET_CAP,
    item.AVG_HOLD_NUM,
    item.TOTAL_MARKET_CAP,
    item.TOTAL_A_SHARES,
    item.HOLD_NOTICE_DATE ? new Date(item.HOLD_NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-股东户数详情
 * https://data.eastmoney.com/gdhs/detail/000002.html
 * @param symbol 股票代码
 * @returns 股东户数详情数据
 */
export async function stock_zh_a_gdhs_detail_em(symbol: string = '000001'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'END_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_HOLDERNUM_DET',
    columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,CHANGE_SHARES,CHANGE_REASON,END_DATE,INTERVAL_CHRATE,AVG_MARKET_CAP,AVG_HOLD_NUM,TOTAL_MARKET_CAP,TOTAL_A_SHARES,HOLD_NOTICE_DATE,HOLDER_NUM,PRE_HOLDER_NUM,HOLDER_NUM_CHANGE,HOLDER_NUM_RATIO,END_DATE,PRE_END_DATE',
    quoteColumns: 'f2,f3',
    filter: `(SECURITY_CODE="${symbol}")`,
    source: 'WEB',
    client: 'WEB',
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

  // Sort ascending by END_DATE to match Python
  allData.sort((a: any, b: any) => {
    const dateA = a.END_DATE || '';
    const dateB = b.END_DATE || '';
    return String(dateA).localeCompare(String(dateB));
  });

  const columns = [
    '股东户数统计截止日', '区间涨跌幅', '股东户数-本次', '股东户数-上次',
    '股东户数-增减', '股东户数-增减比例', '户均持股市值', '户均持股数量',
    '总市值', '总股本', '股本变动', '股本变动原因', '股东户数公告日期', '代码', '名称',
  ];

  const rows = allData.map((item: any) => [
    item.END_DATE ? new Date(item.END_DATE).toISOString().split('T')[0] : null,
    item.INTERVAL_CHRATE != null ? String(item.INTERVAL_CHRATE) : null,
    item.HOLDER_NUM != null ? String(item.HOLDER_NUM) : null,
    item.PRE_HOLDER_NUM != null ? String(item.PRE_HOLDER_NUM) : null,
    item.HOLDER_NUM_CHANGE != null ? String(item.HOLDER_NUM_CHANGE) : null,
    item.HOLDER_NUM_RATIO != null ? String(item.HOLDER_NUM_RATIO) : null,
    item.AVG_MARKET_CAP != null ? String(item.AVG_MARKET_CAP) : null,
    item.AVG_HOLD_NUM != null ? String(item.AVG_HOLD_NUM) : null,
    item.TOTAL_MARKET_CAP != null ? String(item.TOTAL_MARKET_CAP) : null,
    item.TOTAL_A_SHARES != null ? String(item.TOTAL_A_SHARES) : null,
    item.CHANGE_SHARES != null ? String(item.CHANGE_SHARES) : null,
    item.CHANGE_REASON,
    item.HOLD_NOTICE_DATE ? new Date(item.HOLD_NOTICE_DATE).toISOString().split('T')[0] : null,
    item.SECURITY_CODE || symbol,
    item.SECURITY_NAME_ABBR || '',
  ]);

  return createDataFrame(columns, rows);
}
